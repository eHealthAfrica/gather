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
import SurveyConfig from './surveyConfig'
import { mountComponent } from '../../../tests/enzyme-helpers'

describe('Survey Configuration', () => {
  const labels = {
    surveyor: 'Which surveyor is entering this data?',
    gender: 'What is the gender of this occupant?',
    what: 'What?'
  }
  const columns = ['surveyor', 'gender', 'what']
  const visualizations = ['Bar Chart', 'Line Chart', 'Pie Chart']

  it('should render config-component for survey that has no existing configs', () => {
    const component = mountComponent(
      <SurveyConfig
        labels={labels}
        columns={columns}
        visualizations={visualizations}
      />
    )

    expect(component.find("[data-qa='config']").exists()).toBeTruthy()
    expect(component.find("[data-qa='config-item']")).toHaveLength(columns.length)

    component.find("[data-qa='config-item-checkbox']").forEach(el => {
      expect(el.props().checked).toEqual(false)
      el.simulate('change', { target: { checked: true } })
    })

    expect(component.find("[data-qa='config-item-dropdown']")).toHaveLength(0)
  })

  it('should render config-component for survey that has existing configs', () => {
    const dashboardConfig = {
      'Which surveyor is entering this data?': { elastic: true, dashboard: 'Bar Chart' },
      'What is the gender of this occupant?': { elastic: true, dashboard: 'Pie Chart' },
      'What?': { elastic: true, dashboard: null }
    }

    const component = mountComponent(
      <SurveyConfig
        dashboardConfig={dashboardConfig}
        setShowConfig={() => {}}
        saveDashboardConfig={() => {}}
        labels={labels}
        columns={columns}
        visualizations={visualizations}
      />
    )

    expect(component.find("[data-qa='config']").exists()).toBeTruthy()
    expect(component.find("[data-qa='config-item']")).toHaveLength(columns.length)

    component.find("[data-qa='config-item-checkbox']").forEach(el => {
      const { checked, name } = el.props()
      expect(checked).toEqual(dashboardConfig[name].elastic)
      el.simulate('change', { target: { checked: false } })
    })

    expect(component.find("[data-qa='config-item-dropdown']")).toHaveLength(columns.length)

    component.find("[data-qa='config-item-dropdown']").forEach(el => {
      const text = el.getDOMNode().textContent
      const name = el.props().name
      const expectation = dashboardConfig[name].dashboard

      if (expectation === null) expect(text).toEqual('No Visualization')
      else expect(text).toEqual(expectation)

      el.simulate('click', { target: { checked: false } })

      component.find(`[data-qa='config-item-dropdown-${name}']`).forEach(el => {
        el.simulate('click')
      })
    })

    component.find("[data-qa='config-button']").simulate('click')
  })
})
