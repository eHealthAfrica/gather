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

/* global describe, it, expect */

import React from 'react'
import SurveyConfig from './SurveyConfig'
import { mountComponent } from '../../../tests/enzyme-helpers'

describe('Survey Configuration', () => {
  const columns = ['surveyor', 'gender', 'what']
  const labels = {
    surveyor: 'Which surveyor is entering this data?',
    gender: 'What is the gender of this occupant?',
    what: 'What?'
  }

  it('should render config-component for survey that has no existing configs', () => {
    const component = mountComponent(
      <SurveyConfig
        labels={labels}
        columns={columns}
      />
    )

    expect(component.find("[data-qa='config']").exists()).toBeTruthy()
    expect(component.find("[data-qa='config-item']")).toHaveLength(columns.length)
    expect(component.find("[data-qa='config-item-dropdown']")).toHaveLength(0)

    component.find("[data-qa='config-item-checkbox']").forEach(el => {
      expect(el.props().checked).toEqual(false)
      el.simulate('change', { target: { checked: true } })
    })

    expect(component.find("[data-qa='config-item-dropdown']")).toHaveLength(columns.length)
  })

  it('should render config-component for survey that has existing configs', () => {
    const dashboardConfig = {
      'Which surveyor is entering this data?': { elastic: true, dashboard: 'barChart' },
      'What is the gender of this occupant?': { elastic: true, dashboard: 'pieChart' },
      'What?': { elastic: true, dashboard: null }
    }

    const component = mountComponent(
      <SurveyConfig
        dashboardConfig={dashboardConfig}
        setShowConfig={() => {}}
        saveDashboardConfig={() => {}}
      />
    )

    expect(component.find("[data-qa='config']").exists()).toBeTruthy()
    expect(component.find("[data-qa='config-item']")).toHaveLength(columns.length)
    expect(component.find("[data-qa='config-item-dropdown']")).toHaveLength(columns.length)

    component.find("[data-qa='config-item-checkbox']").forEach(el => {
      const { checked, name } = el.props()
      expect(checked).toEqual(dashboardConfig[name].elastic)
    })

    component.find("[data-qa='config-item-dropdown']").forEach(el => {
      const name = el.props().name
      const text = el.getDOMNode().textContent
      const expectation = dashboardConfig[name].dashboard
      let actual = null

      switch (text) {
        case 'Bar Chart':
          actual = 'barChart'
          break
        case 'Pie Chart':
          actual = 'pieChart'
          break
        default:
      }

      expect(actual).toEqual(expectation)

      component.find(`[data-qa='config-item-dropdown-${name}']`).forEach(el => {
        el.simulate('click')
      })
    })

    component.find("[data-qa='config-item-checkbox']").forEach(el => {
      el.simulate('change', { target: { checked: false } })
    })

    expect(component.find("[data-qa='config-item-dropdown']")).toHaveLength(0)

    component.find("[data-qa='config-button']").simulate('click')
  })
})
