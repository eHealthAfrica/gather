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

/* global describe, it, expect */

import React from 'react'
import { mountWithIntl, shallowWithIntl } from 'enzyme-react-intl'

import FilteredMultiSelect from 'react-filtered-multiselect'
import MultiSelect from './MultiSelect'

describe('MultiSelect', () => {
  it('should render the multi select component', () => {
    const multiSelect = (
      <MultiSelect
        selected={[
          {id: 2, name: '2'}
        ]}
        options={[
          {id: 1, name: '1'},
          {id: 2, name: '2'},
          {id: 3, name: '3'}
        ]}
        onChange={() => {}}
      />
    )

    const component = mountWithIntl(shallowWithIntl(multiSelect).get(0))

    expect(component.state()).toBeTruthy()
    expect(component.state('valueProp')).toEqual('id')
    expect(component.state('textProp')).toEqual('name')
    expect(component.state('selected')).not.toEqual([])
    expect(component.state('options')).not.toEqual([])
    expect(component.find(FilteredMultiSelect).exists()).toBeTruthy()
  })

  it('should render the multi select component with custom properties', () => {
    const multiSelect = (
      <MultiSelect
        valueProp='key'
        textProp='label'
        onChange={() => {}}
      />
    )
    const component = mountWithIntl(shallowWithIntl(multiSelect).get(0))

    expect(component.state()).toBeTruthy()
    expect(component.state('valueProp')).toEqual('key')
    expect(component.state('textProp')).toEqual('label')
    expect(component.state('selected')).toEqual([])
    expect(component.state('options')).toEqual([])
    expect(component.find(FilteredMultiSelect).exists()).toBeTruthy()
  })

  it('should select/deselect the options', () => {
    let changed = false
    const multiSelect = (
      <MultiSelect
        selected={[
          {id: 2, name: '2'}
        ]}
        options={[
          {id: 1, name: '1'},
          {id: 2, name: '2'},
          {id: 3, name: '3'},
          {id: 4, name: '4'},
          {id: 5, name: '5'},
          {id: 6, name: '6'}
        ]}
        onChange={() => { changed = true }}
      />
    )

    const component = mountWithIntl(shallowWithIntl(multiSelect).get(0))

    // select new selected values
    expect(component.state('selected')).toEqual([
      {id: 2, name: '2'}
    ])
    expect(changed).toBeFalsy()
    component.instance().onSelect([
      {id: 4},
      {id: 1},
      {id: 2} // already there, will not be duplicated
    ])
    expect(changed).toBeTruthy()
    expect(component.state('selected')).toEqual([
      {id: 1, name: '1'},
      {id: 2, name: '2'},
      {id: 4, name: '4'}
    ])

    // deselect values
    changed = false
    expect(changed).toBeFalsy()
    component.instance().onDeselect([
      {id: 4},
      {id: 5} // not there, will not affect
    ])
    expect(changed).toBeTruthy()
    expect(component.state('selected')).toEqual([
      {id: 1, name: '1'},
      {id: 2, name: '2'}
    ])

    // deselect values that are not there
    changed = false
    expect(changed).toBeFalsy()
    component.instance().onDeselect([
      {id: 8}
    ])
    expect(changed).toBeFalsy()
  })
})
