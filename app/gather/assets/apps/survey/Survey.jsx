/*
 * Copyright (C) 2019 by eHealth Africa : http://www.eHealthAfrica.org
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
import { GATHER_APP } from '../utils/constants'
import {
  getSurveysPath,
  getSurveysAPIPath,
  getEntitiesAPIPath,
  getExportTasksAPIPath
} from '../utils/paths'
import { cleanJsonPaths, reorderObjectKeys } from '../utils/types'

import SurveyDetail from './SurveyDetail'
import SurveyDashboard from './SurveyDashboard'
import SurveyMasks from './mask/SurveyMasks'
import EntitiesList from './entity/EntitiesList'
import EntityItem from './entity/EntityItem'
import EntitiesDownload from './entity/EntitiesDownload'
import EntitiesDownloadTaskList from './entity/EntitiesDownloadTaskList'

const TABLE_VIEW = 'table'
const SINGLE_VIEW = 'single'
const DASHBOARD_VIEW = 'dashboard'
const TASKS_VIEW = 'tasks'
const TABLE_SIZES = [10, 25, 50, 100]

class Survey extends Component {
  constructor (props) {
    super(props)

    const paths = cleanJsonPaths(props.skeleton.jsonpaths)
    this.state = {
      viewMode: TABLE_VIEW,
      total: props.survey.entities_count,
      labels: props.skeleton.docs,
      allPaths: paths,
      selectedPaths: paths,
      activationError: null,
      dashboardConfig: null
    }
    this.saveDashboardConfig = this.saveDashboardConfig.bind(this)
  }

  saveDashboardConfig (dashboardConfig) {
    this.setState({ dashboardConfig })
  }

  render () {
    const { survey } = this.props

    return (
      <div data-qa={`survey-item-${survey.id}`} className='survey-view'>
        <div className='survey-header'>
          <h2>{survey.name}</h2>
          <div className='header-actions'>
            <a
              href={getSurveysPath({ action: 'edit', id: survey.id })}
              role='button'
              className='btn btn-primary btn-icon'
            >
              <i className='fas fa-pen invert mr-3' />
              <FormattedMessage
                id='survey.view.action.edit'
                defaultMessage='Edit survey'
              />
            </a>
          </div>
        </div>

        <SurveyDetail survey={survey} />

        {this.renderEntities()}
      </div>
    )
  }

  renderEntities () {
    const { total } = this.state
    if (total === 0) return ''

    const { skeleton, survey, settings } = this.props
    const { viewMode, labels, allPaths, selectedPaths, dashboardConfig } = this.state
    const listComponent = (
      viewMode === TASKS_VIEW
        ? EntitiesDownloadTaskList
        : viewMode === SINGLE_VIEW
          ? EntityItem
          : EntitiesList
    )
    const url = (
      viewMode === TASKS_VIEW
        ? getExportTasksAPIPath({ project: survey.id, omit: ['settings'] })
        : getEntitiesAPIPath({ project: survey.id })
    )
    const extras = {
      labels: labels,
      paths: selectedPaths
    }
    const filename = skeleton.name || survey.name

    // Postgres uses JSONB type to store the payload value and
    // this breaks the keys order that we need to maintain to display each Entity.
    // Hence, we are trying to rebuild each payload with the correct keys order.
    const mapResponse = (list) => list.map(
      entity => ({
        ...entity,
        payload: reorderObjectKeys(entity.payload, skeleton.jsonpaths)
      })
    )

    return (
      <div className='survey-data'>
        <div className='survey-data-toolbar'>
          <ul className='survey-data-tabs'>
            {
              // Enable Dashboard tab only if the ES consumer is connected to Gather
              settings.ES_CONSUMER_URL &&
                <li className='dashboard-tab'>
                  <button
                    type='button'
                    disabled={viewMode === DASHBOARD_VIEW}
                    className={`tab ${viewMode === DASHBOARD_VIEW ? 'active' : ''}`}
                    onClick={() => { this.setState({ viewMode: DASHBOARD_VIEW }) }}
                  >
                    <i className='fas fa-chart-area mr-2' />
                    <FormattedMessage
                      id='survey.view.action.dashboard'
                      defaultMessage='Dashboard'
                    />
                  </button>
                </li>
            }
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
                  defaultMessage='Table'
                />
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
                  defaultMessage='Single'
                />
              </button>
            </li>
            <li>
              <EntitiesDownload
                survey={survey}
                total={total}
                paths={selectedPaths}
                labels={labels}
                settings={settings}
                filename={filename}
              />
            </li>
            <li>
              <button
                type='button'
                disabled={viewMode === TASKS_VIEW}
                className={`tab ${viewMode === TASKS_VIEW ? 'active' : ''}`}
                onClick={() => { this.setState({ viewMode: TASKS_VIEW }) }}
              >
                <i className='fas fa-file-download mr-2' />
                <FormattedMessage
                  id='survey.view.action.tasks'
                  defaultMessage='Generated files'
                />
              </button>
            </li>
            {
              viewMode !== DASHBOARD_VIEW &&
                <li className='toolbar-filter'>
                  {this.renderMaskButton()}
                </li>
            }
          </ul>
        </div>
        {
          viewMode === DASHBOARD_VIEW
            ? (
              <SurveyDashboard
                columns={allPaths}
                labels={labels}
                entitiesCount={total}
                dashboardConfig={dashboardConfig}
                saveDashboardConfig={this.saveDashboardConfig}
              />
            )
            : (
              <PaginationContainer
                key={viewMode}
                pageSize={viewMode === SINGLE_VIEW ? 1 : TABLE_SIZES[0]}
                sizes={viewMode === SINGLE_VIEW ? [] : TABLE_SIZES}
                url={url}
                position='top'
                listComponent={listComponent}
                showPrevious
                showNext
                extras={viewMode === TASKS_VIEW ? null : extras}
                mapResponse={viewMode === TASKS_VIEW ? null : mapResponse}
              />
            )
        }
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

    return (
      <FetchUrlsContainer
        urls={urls}
        handleResponse={handleResponse}
        targetComponent={SurveyMasks}
      />
    )
  }
}

export default Survey
