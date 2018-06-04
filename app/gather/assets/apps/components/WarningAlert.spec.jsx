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
import { mount } from 'enzyme'

import WarningAlert from './WarningAlert'

describe('WarningAlert', () => {
  it('should render nothing without the warning list', () => {
    const component = mount(<WarningAlert />)
    expect(component.find('[data-qa="data-warning"]').exists()).toBeFalsy()
  })

  it('should render the warning list', () => {
    const warnings = [
      'warning 1', 'warning 2', 'warning 3'
    ]
    const component = mount(<WarningAlert warnings={warnings} />)
    expect(component.find('[data-qa="data-warning"]').exists()).toBeTruthy()

    expect(component.find('[data-qa="data-warning-0"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="data-warning-0"]').text()).toEqual('warning 1')

    expect(component.find('[data-qa="data-warning-1"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="data-warning-1"]').text()).toEqual('warning 2')

    expect(component.find('[data-qa="data-warning-2"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="data-warning-2"]').text()).toEqual('warning 3')
  })
})
