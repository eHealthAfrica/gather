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
import { getSurveysPath, getSurveysAPIPath, getEntitiesAPIPath } from '../utils/paths'
import { postData } from '../utils/request'
import { extractPathDocs } from '../utils/avro-utils'

import SurveyDetail from './SurveyDetail'
import SurveyMasks from './mask/SurveyMasks'
import EntitiesList from './entity/EntitiesList'
import EntityItem from './entity/EntityItem'

const TABLE_VIEW = 'table'
const SINGLE_VIEW = 'single'
const TABLE_SIZES = [ 10, 25, 50, 100 ]

export default class Survey extends Component {
  constructor (props) {
    super(props)

    this.state = {
      viewMode: TABLE_VIEW,
      total: props.survey.entities_count,
      labels: {},
      allPaths: [],
      selectedPaths: []
    }

    const {results} = props.schemas
    if (results.length) {
      const pathsAndLabels = {
        labels: {},
        paths: []
      }

      // use the schemas to extract the possible paths
      results.forEach(result => {
        extractPathDocs(result.definition, pathsAndLabels)
      })

      // not desired paths
      const forbiddenPath = (jsonPath) => (
        // attributes "@attr"
        (jsonPath.charAt(0) === '@') ||
        // internal xForm properties
        ([
          '_id', '_version',
          'starttime', 'endtime', 'deviceid',
          'meta'
        ].indexOf(jsonPath) > -1) ||
        // "meta" children
        (jsonPath.indexOf('meta.') === 0) ||
        // array/ map properties
        (jsonPath.indexOf('#') > -1 || jsonPath.indexOf('*') > -1)
      )
      // ["a", "a.b", "a.c"] => ["a.b", "a.c"]
      const isLeaf = (jsonPath, _, array) => array.filter(
        anotherPath => anotherPath.indexOf(jsonPath + '.') === 0
      ).length === 0

      this.state.labels = pathsAndLabels.labels
      this.state.allPaths = pathsAndLabels.paths
        // remove undesired paths
        .filter(jsonPath => !forbiddenPath(jsonPath))
        // keep only the leafs
        .filter(isLeaf)
      this.state.selectedPaths = this.state.allPaths
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

        { this.renderEntities() }
      </div>
    )
  }

  renderEntities () {
    if (this.state.total === 0) {
      return ''
    }

    const {survey} = this.props
    const {viewMode} = this.state
    const listComponent = (viewMode === SINGLE_VIEW ? EntityItem : EntitiesList)
    const extras = {
      labels: this.state.labels,
      paths: this.state.selectedPaths
    }

    return (
      <div className='survey-data'>
        <div className='survey-data-toolbar'>
          <ul className='survey-data-tabs'>
            <li>
              <button
                type='button'
                disabled={viewMode === TABLE_VIEW}
                className={`tab ${viewMode === TABLE_VIEW ? 'active' : ''}`}
                onClick={() => { this.setState({ viewMode: TABLE_VIEW }) }}
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
                disabled={viewMode === SINGLE_VIEW}
                className={`tab ${viewMode === SINGLE_VIEW ? 'active' : ''}`}
                onClick={() => { this.setState({ viewMode: SINGLE_VIEW }) }}
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
          pageSize={viewMode === SINGLE_VIEW ? 1 : TABLE_SIZES[0]}
          sizes={viewMode === SINGLE_VIEW ? [] : TABLE_SIZES}
          url={getEntitiesAPIPath({project: survey.id, ordering: '-modified'})}
          position='top'
          listComponent={listComponent}
          showPrevious
          showNext
          extras={extras}
        />
      </div>
    )
  }

  renderDownloadButton () {
    const {survey} = this.props
    const {total, allPaths, selectedPaths} = this.state

    const pageSize = CSV_MAX_ROWS_SIZE || MAX_PAGE_SIZE
    const params = {
      ordering: '-modified',
      project: survey.id,
      fields: 'modified,payload',
      action: 'fetch', // this will build the "post as get" API path
      format: 'csv',
      pageSize
    }
    const payload = {
      parse_columns: CSV_HEADER_RULES,
      rule_sep: CSV_HEADER_RULES_SEP
    }

    // restrict the columns to export with the selected columns
    if (selectedPaths.length !== allPaths.length) {
      payload.columns = 'modified,' + selectedPaths
        .map(key => 'payload.' + key)
        .join(',')
    }

    const download = (options, fileName) => {
      postData(getEntitiesAPIPath(options), payload, {download: true, fileName})
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
    if (this.state.allPaths.length === 0) {
      return ''
    }

    const handleResponse = (response) => ({
      ...response,
      columns: this.state.allPaths,
      initialSelected: this.state.selectedPaths,
      labels: this.state.labels,
      onChange: (selectedPaths) => { this.setState({ selectedPaths }) }
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
