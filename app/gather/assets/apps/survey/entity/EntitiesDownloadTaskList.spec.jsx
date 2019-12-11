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
import { mountWithIntl } from '../../../tests/enzyme-helpers'
import EntitiesDownloadTaskList from './EntitiesDownloadTaskList'

describe('EntitiesDownloadTaskList', () => {
  it('should return empty div', () => {
    const props = { start: 0, list: [] }
    const component = mountWithIntl(<EntitiesDownloadTaskList {...props} />)

    expect(component.find('[data-qa="tasks-list-empty"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="tasks-list"]').exists()).toBeFalsy()
  })

  it('should return list of tasks', () => {
    const props = {
      start: 0,
      list: [
        { id: 'a', files: [] },
        { id: 'b', files: [] }
      ]
    }
    const component = mountWithIntl(<EntitiesDownloadTaskList {...props} />)

    expect(component.find('[data-qa="tasks-list-empty"]').exists()).toBeFalsy()
    expect(component.find('[data-qa="tasks-list"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="task-item"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="task-item"]')).toHaveLength(props.list.length)

    component.find('[data-qa="id"]').forEach((elem, index) => {
      const id = elem.getDOMNode().textContent
      expect(id).toEqual(props.list[index].id)
    })
    component.find('[data-qa="task-files"]').forEach((elem, index) => {
      const files = elem.getDOMNode().textContent
      expect(files).toEqual('')
    })
  })

  it('should return list of tasks along with their generated files', () => {
    const props = {
      start: 0,
      list: [
        { id: 'a', files: [{ name: 'a', size: 1, md5sum: 'a' }] },
        { id: 'b', files: [{ name: 'b', size: 2, md5sum: 'b' }] }
      ]
    }
    const component = mountWithIntl(<EntitiesDownloadTaskList {...props} />)

    expect(component.find('[data-qa="tasks-list-empty"]').exists()).toBeFalsy()
    expect(component.find('[data-qa="tasks-list"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="task-item"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="task-item"]')).toHaveLength(props.list.length)
    component.find('[data-qa="id"]').forEach((elem, index) => {
      const id = elem.getDOMNode().textContent
      expect(id).toEqual(props.list[index].id)
    })
    component.find('[data-qa="task-files"]').forEach((elem, index) => {
      const fileText = elem.getDOMNode().textContent
      expect(fileText).toBeTruthy()
    })
  })
})
