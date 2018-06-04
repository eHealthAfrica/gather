/*
 * Copyright (C) 2018 by eHealth Africa : http://www.eHealthAfrica.org
 *
 * See the NOTICE file distributed with this work for additional information
 * regarding copyright ownership.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

import { FetchUrlsContainer, PaginationContainer } from '../components'
import { range } from '../utils'
import { MAX_PAGE_SIZE, GATHER_APP } from '../utils/constants'
import { CSV_HEADER_RULES, CSV_HEADER_RULES_SEP, CSV_MAX_ROWS_SIZE } from '../utils/env'
import { getSurveysPath, getSurveysAPIPath, getSubmissionsAPIPath } from '../utils/paths'
import { postData } from '../utils/request'
import { flatten } from '../utils/types'

import SurveyDetail from './SurveyDetail'
import SurveyMasks from './SurveyMasks'
import SubmissionsList from '../submission/SubmissionsList'
import SubmissionItem from '../submission/SubmissionItem'

const TABLE_SIZE = 10
const SEPARATOR = '¬¬¬' // very uncommon string

export default class Survey extends Component {
  constructor (props) {
    super(props)

    this.state = {
      pageSize: TABLE_SIZE,
      total: props.submissions.count,
      allColumns: [],
      selectedColumns: []
    }

    const {results} = props.submissions
    if (results.length) {
      const allFlattenKeys = []

      // use the initial submissions to extract the possible columns
      results.forEach(result => {
        Object.keys(flatten(result.payload, SEPARATOR))
          .forEach(key => { allFlattenKeys.push(key) })
      })

      this.state.allColumns = [ ...new Set(allFlattenKeys) ].sort()
      this.state.selectedColumns = [ ...this.state.allColumns ]
    }
  }

  render () {
    const {survey} = this.props

    return (
      <div data-qa={`survey-item-${survey.id}`} className='survey-view'>
        <div className='survey-header'>
          <h2>{survey.name}</h2>
          <a
            href={getSurveysPath({action: 'edit', id: survey.id})}
            role='button'
            className='btn btn-primary btn-icon'>
            <i className='fas fa-pencil-alt invert mr-3' />
            <FormattedMessage
              id='survey.view.action.edit'
              defaultMessage='Edit survey' />
          </a>
        </div>

        <SurveyDetail survey={survey} />

        { this.renderSubmissions() }
      </div>
    )
  }

  renderSubmissions () {
    const {survey} = this.props

    if (survey.submissions === 0) {
      return ''
    }

    const {pageSize} = this.state
    const SubmissionComponent = (pageSize === 1 ? SubmissionItem : SubmissionsList)
    const extras = {
      separator: SEPARATOR,
      columns: this.state.selectedColumns
    }

    return (
      <div className='survey-data'>
        <div className='survey-data-toolbar'>
          <ul className='survey-data-tabs'>
            <li>
              <button
                type='button'
                className={`tab ${pageSize !== 1 ? 'active' : ''}`}
                onClick={() => { this.setState({ pageSize: TABLE_SIZE }) }}
              >
                <i className='fas fa-th-list mr-2' />
                <FormattedMessage
                  id='survey.view.action.table'
                  defaultMessage='Table' />
              </button>
            </li>
            <li>
              <button
                type='button'
                className={`tab ${pageSize === 1 ? 'active' : ''}`}
                onClick={() => { this.setState({ pageSize: 1 }) }}
              >
                <i className='fas fa-file mr-2' />
                <FormattedMessage
                  id='survey.view.action.single'
                  defaultMessage='Single' />
              </button>
            </li>
            <li>
              { this.renderDownloadButton() }
            </li>
            <li className='toolbar-filter'>
              { this.renderMaskButton() }
            </li>
          </ul>
        </div>
        <PaginationContainer
          pageSize={pageSize}
          url={getSubmissionsAPIPath({project: survey.id, ordering: '-created'})}
          position='top'
          listComponent={SubmissionComponent}
          showPrevious
          showNext
          extras={extras}
        />
      </div>
    )
  }

  renderDownloadButton () {
    const {survey} = this.props
    const {total, allColumns, selectedColumns} = this.state

    const pageSize = CSV_MAX_ROWS_SIZE || MAX_PAGE_SIZE
    const params = {
      ordering: '-created',
      project: survey.id,
      fields: 'created,payload',
      action: 'fetch', // this will build the "post as get" API path
      format: 'csv',
      pageSize
    }
    const payload = {
      parse_columns: CSV_HEADER_RULES,
      rule_sep: CSV_HEADER_RULES_SEP
    }

    // restrict the columns to export with the selected columns
    if (selectedColumns.length !== allColumns.length) {
      payload.columns = 'created,' + selectedColumns
        .map(key => 'payload.' + key.replace(new RegExp(SEPARATOR, 'g'), '.'))
        .join(',')
    }

    const download = (options, fileName) => {
      postData(getSubmissionsAPIPath(options), payload, {download: true, fileName})
    }

    if (total < pageSize) {
      return (
        <button
          type='button'
          className='tab'
          onClick={() => { download(params, `${survey.name}.csv`) }}
        >
          <i className='fas fa-download mr-2' />
          <FormattedMessage
            id='survey.view.action.download'
            defaultMessage='Download' />
        </button>
      )
    }

    const dropdown = 'downloadLinkChoices'
    const pages = range(1, Math.ceil(total / pageSize) + 1)
      .map(index => ({
        key: index,
        options: { ...params, page: index },
        fileName: `${survey.name}-${index}.csv`
      }))

    return (
      <div className='dropdown'>
        <button
          type='button'
          className='tab'
          id={dropdown}
          data-toggle='dropdown'
        >
          <i className='fas fa-download mr-2' />
          <FormattedMessage
            id='survey.view.action.download'
            defaultMessage='Download' />
        </button>

        <div
          className='dropdown-menu'
          aria-labelledby={dropdown}
        >
          <div className='dropdown-list'>
            {
              pages.map(page => (
                <button
                  key={page.key}
                  type='button'
                  className='dropdown-item'
                  onClick={() => { download(page.options, page.fileName) }}
                >
                  { page.fileName }
                </button>
              ))
            }
          </div>
        </div>
      </div>
    )
  }

  renderMaskButton () {
    if (this.state.allColumns.length === 0) {
      return ''
    }

    const handleResponse = (response) => ({
      ...response,
      columns: this.state.allColumns,
      separator: SEPARATOR,
      onChange: (selectedColumns) => { this.setState({ selectedColumns }) }
    })

    const urls = [
      {
        name: 'survey',
        url: getSurveysAPIPath({ app: GATHER_APP, id: this.props.survey.id }),
        force: {
          url: getSurveysAPIPath({ app: GATHER_APP }),
          data: { project_id: this.props.survey.id, name: this.props.survey.name }
        }
      }
    ]

    return <FetchUrlsContainer
      urls={urls}
      handleResponse={handleResponse}
      targetComponent={SurveyMasks}
    />
  }
}
