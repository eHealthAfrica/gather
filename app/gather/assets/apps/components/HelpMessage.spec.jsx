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
import { mount } from 'enzyme'

import HelpMessage from './HelpMessage'

const Foo = () => 'foo'

describe('HelpMessage', () => {
  it('should render the help message', () => {
    const component = mount(<HelpMessage><Foo /></HelpMessage>)
    expect(component.find('[data-qa="data-help-message"]').exists()).toBeTruthy()
    expect(component.find(Foo).exists()).toBeTruthy()
    expect(component.find(Foo).text()).toContain('foo')
  })
})
