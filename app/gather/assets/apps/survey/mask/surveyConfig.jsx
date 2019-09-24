import React, { useEffect, useState } from 'react'
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl'
import { getLabelTree } from '../../utils/types'

const prefix = 'survey.dashboard.config'
const visualizations = ['No Visualization', 'Bar Chart', 'Line Chart', 'Pie Chart']

const MESSAGES = {
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
}

export default ({ dashboardConfig, saveDashboardConfig, setShowConfig, columns, labels }) => {
  const [newDashboardConfig, setNewDashboardConfig] = useState({})

  useEffect(() => {
    setNewDashboardConfig(dashboardConfig || columns.reduce(
      (acc, column) => ({ ...acc, [getLabelTree(column, labels)]: { elastic: false, dashboard: null } }),
      {}
    ))
  }, [])

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
    <div className='config-screen'>
      <div className='content'>
        <div className='row'>
          <div className='col-8' />
          <div className='col-2'><h5>Elastic Search</h5></div>
          <div className='col-2'><h5>Dashboard</h5></div>
        </div>
        <ul>
          {
            Object.keys(newDashboardConfig).map((key, index) => {
              const item = newDashboardConfig[key];
              const itemName = `${index + 1}. ${key}`
              return (
                <li key={itemName} className='item-title'>
                  <div className='row row-item'>
                    <div className='col-8 label-col'>{itemName}</div>
                    <div className='col-2 form-check'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        checked={item.elastic}
                        onChange={event => handleElastic(key, event)}
                      />
                    </div>
                    {
                      item.elastic && (
                        <div className='col-2'>
                          <div className='dropdown'>
                            <div className='dropdown-toggle' href='#!' data-toggle='dropdown'>
                              <FormattedMessage
                                id={
                                  item.dashboard
                                  ? MESSAGES.visualizations[item.dashboard].id
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
                                  onClick={event => handleDashboard(key, elem)}
                                >
                                  <FormattedMessage
                                    id={MESSAGES.visualizations[elem].id}
                                    defaultMessage={MESSAGES.visualizations[elem].defaultMessage}
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
          >
            <FormattedMessage
              id={MESSAGES.button.id}
              defaultMessage={MESSAGES.button.defaultMessage}
            />
          </button>
        </div>
    </div>
  )
}
