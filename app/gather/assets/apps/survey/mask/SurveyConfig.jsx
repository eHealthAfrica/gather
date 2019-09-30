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

import React, { useState } from 'react'
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl'
import { getLabelTree } from '../../utils/types'

const MESSAGES = defineMessages({
  noChart: {
    id: 'survey.dashboard.config.no.chart',
    defaultMessage: 'No visualization'
  },
  barChart: {
    id: 'survey.dashboard.config.bar.chart',
    defaultMessage: 'Bar Chart'
  },
  pieChart: {
    id: 'survey.dashboard.config.pie.chart',
    defaultMessage: 'Pie Chart'
  },
  lineChart: {
    id: 'survey.dashboard.config.line.chart',
    defaultMessage: 'Line Chart'
  }
})

const NO_CHART = 'noChart'

const VISUALIZATIONS = [NO_CHART, 'barChart', 'pieChart', 'lineChart']

const SurveyConfig = ({
  dashboardConfig,
  saveDashboardConfig,
  setShowConfig,
  columns,
  labels,
  intl: { formatMessage }
}) => {
  const initialState = dashboardConfig || columns.reduce(
    (acc, column) => ({ ...acc, [getLabelTree(column, labels)]: { elastic: false, dashboard: null } }),
    {}
  )

  const [newDashboardConfig, setNewDashboardConfig] = useState(initialState)

  const handleElastic = (key, { target: { checked } }) =>
    setNewDashboardConfig({
      ...newDashboardConfig,
      [key]: { elastic: checked, dashboard: checked ? NO_CHART : null }
    })

  const handleDashboard = (key, value) =>
    setNewDashboardConfig({
      ...newDashboardConfig,
      [key]: { ...newDashboardConfig[key], dashboard: value }
    })

  return (
    <div className='config-screen' data-qa='config'>
      <div className='content'>
        <div className='row'>
          <div className='col-8' />
          <div className='col-2'><h5>Elastic Search</h5></div>
          <div className='col-2'>
            <h5>
              <FormattedMessage
                id='survey.dashboard.config.dashboard.column'
                defaultMessage='Dashboard'
              />
            </h5>
          </div>
        </div>
        <ul>
          {
            Object.keys(newDashboardConfig).map((key, index) => {
              const item = newDashboardConfig[key]
              const itemName = `${index + 1}. ${key}`
              return (
                <li key={itemName} className='item-title' data-qa='config-item'>
                  <div className='row row-item'>
                    <div className='col-8 label-col wrap v-line'>{itemName}</div>
                    <div className='col-2 wrap v-line'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name={key}
                        checked={item.elastic}
                        onChange={event => { handleElastic(key, event) }}
                        data-qa='config-item-checkbox'
                      />
                    </div>
                    {
                      item.elastic && (
                        <div className='col-2 wrap'>
                          <div className='dropdown'>
                            <div
                              className='dropdown-toggle'
                              href='#!'
                              name={key}
                              data-toggle='dropdown'
                              data-qa='config-item-dropdown'
                            >
                              {
                                formatMessage(
                                  item.dashboard ? MESSAGES[item.dashboard] : MESSAGES[NO_CHART]
                                )
                              }
                              <span className='caret' />
                            </div>
                            <div className='dropdown-menu'>
                              {VISUALIZATIONS.map((elem, index) => (
                                <a
                                  key={`${elem}${index}`}
                                  className='dropdown-item'
                                  href='#!'
                                  onClick={() => { handleDashboard(key, elem) }}
                                  data-qa={`config-item-dropdown-${key}`}
                                >
                                  {formatMessage(MESSAGES[elem])}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    }
                  </div>
                </li>
              )
            })
          }
        </ul>
      </div>
      <div className='config-btn'>
        <button
          type='button'
          className='btn btn-primary btn-secondary'
          onClick={() => {
            setShowConfig(false)
            saveDashboardConfig(newDashboardConfig)
          }}
          data-qa='config-button'
        >
          <FormattedMessage
            id='survey.dashboard.config.button.activate'
            defaultMessage='Activate dashboard'
          />
        </button>
      </div>
    </div>
  )
}

export default injectIntl(SurveyConfig)
