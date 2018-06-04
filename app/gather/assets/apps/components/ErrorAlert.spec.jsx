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

import ErrorAlert from './ErrorAlert'

describe('ErrorAlert', () => {
  it('should render nothing without the error list', () => {
    const component = mount(<ErrorAlert />)
    expect(component.find('[data-qa="data-erred"]').exists()).toBeFalsy()
  })

  it('should render the error list', () => {
    const errors = [
      'error 1', 'error 2', 'error 3'
    ]
    const component = mount(<ErrorAlert errors={errors} />)
    expect(component.find('[data-qa="data-erred"]').exists()).toBeTruthy()

    expect(component.find('[data-qa="data-erred-0"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="data-erred-0"]').text()).toEqual('error 1')

    expect(component.find('[data-qa="data-erred-1"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="data-erred-1"]').text()).toEqual('error 2')

    expect(component.find('[data-qa="data-erred-2"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="data-erred-2"]').text()).toEqual('error 3')
  })
})
