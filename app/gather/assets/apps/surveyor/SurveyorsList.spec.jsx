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
import { mountWithIntl } from '../../tests/enzyme-helpers'
import SurveyorsList from './SurveyorsList'

describe('SurveyorsList', () => {
  it('should return empty div', () => {
    const props = { list: [] }
    const component = mountWithIntl(<SurveyorsList {...props} />)

    expect(component.find('[data-qa="surveyors-list-empty"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="surveyors-list"]').exists()).toBeFalsy()
  })

  it('should return list of surveyors', () => {
    const props = {
      list: [
        { id: 1, username: 'user1', project_names: [] },
        { id: 2, username: 'user2', project_names: [] }
      ]
    }
    const component = mountWithIntl(<SurveyorsList {...props} />)

    expect(component.find('[data-qa="surveyors-list-empty"]').exists()).toBeFalsy()
    expect(component.find('[data-qa="surveyors-list"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="surveyor-list-item"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="surveyor-list-item"]')).toHaveLength(props.list.length)
    component.find('[data-qa="surveyor-name"]').forEach((elem, index) => {
      const name = elem.getDOMNode().textContent
      expect(name).toEqual(props.list[index].username)
    })
    component.find('[data-qa="surveyor-projects"]').forEach((elem, index) => {
      const projects = elem.getDOMNode().textContent
      expect(projects).toEqual('-')
    })
  })

  it('should return list of surveyors along with their assigned projects', () => {
    const props = {
      list: [
        { id: 1, username: 'user1', project_names: ['microcensors', 'sample'] },
        { id: 2, username: 'user2', project_names: ['sample'] }
      ]
    }
    const component = mountWithIntl(<SurveyorsList {...props} />)

    expect(component.find('[data-qa="surveyors-list-empty"]').exists()).toBeFalsy()
    expect(component.find('[data-qa="surveyors-list"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="surveyor-list-item"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="surveyor-list-item"]')).toHaveLength(props.list.length)
    component.find('[data-qa="surveyor-name"]').forEach((elem, index) => {
      const name = elem.getDOMNode().textContent
      expect(name).toEqual(props.list[index].username)
    })
    component.find('[data-qa="surveyor-projects"]').forEach((elem, index) => {
      const projectList = props.list[index].project_names.join(', ')
      const projects = elem.getDOMNode().textContent
      expect(projects).toEqual(projectList)
    })
  })
})
