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
import { FormattedMessage } from 'react-intl'
import { getLabelTree } from '../../utils/types'

const createMessages = (visualizations, prefix) => ({
  button: {
    id: `${prefix}.button`,
    defaultMessage: 'Activate dashboard'
  },
  visualizations: visualizations.reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: { id: `${prefix}.${curr.replace(' ', '_')}`, defaultMessage: curr }
    }),
    {}
  )
})

export default ({
  dashboardConfig,
  saveDashboardConfig,
  setShowConfig,
  columns,
  labels,
  visualizations: visualize
}) => {
  const prefix = 'survey.dashboard.config'
  const visualizations = ['No Visualization', ...visualize]

  const messages = createMessages(visualizations, prefix)

  const initialState = dashboardConfig || columns.reduce(
    (acc, column) => ({ ...acc, [getLabelTree(column, labels)]: { elastic: false, dashboard: null } }),
    {}
  )

  const [newDashboardConfig, setNewDashboardConfig] = useState(initialState)

  const handleElastic = (key, { target: { checked } }) =>
    setNewDashboardConfig({
      ...newDashboardConfig,
      [key]: { elastic: checked, dashboard: checked ? visualizations[0] : null }
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
                id='survey.dashboard.config.dashboard_column'
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
                    <div className='col-8 label-col wrap vLine'>{itemName}</div>
                    <div className='col-2 wrap vLine'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        name={key}
                        checked={item.elastic}
                        onChange={event => handleElastic(key, event)}
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
                              <FormattedMessage
                                id={
                                  item.dashboard
                                    ? messages.visualizations[item.dashboard].id
                                    : `${prefix}.${visualizations[0].replace(' ', '_')}`
                                }
                                defaultMessage={item.dashboard || visualizations[0]}
                              />
                              <span className='caret' />
                            </div>
                            <div className='dropdown-menu'>
                              {visualizations.map((elem, index) => (
                                <a
                                  key={`${elem}${index}`}
                                  className='dropdown-item'
                                  href='#!'
                                  onClick={() => handleDashboard(key, elem)}
                                  data-qa={`config-item-dropdown-${key}`}
                                >
                                  <FormattedMessage
                                    id={messages.visualizations[elem].id}
                                    defaultMessage={messages.visualizations[elem].defaultMessage}
                                  />
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
            id={messages.button.id}
            defaultMessage={messages.button.defaultMessage}
          />
        </button>
      </div>
    </div>
  )
}
