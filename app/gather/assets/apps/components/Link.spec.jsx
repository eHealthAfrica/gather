/*
 * Copyright (C) 2023 by eHealth Africa : http://www.eHealthAfrica.org
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

import Link from './Link'

describe('Link component', () => {
  it('should render a link', () => {
    const component = mount(
      <Link link={{ url: '/link', name: 'click here' }} />
    )

    const link = component.find('a')
    expect(link.exists()).toBeTruthy()
    expect(link.props().href).toEqual('/link')
    expect(link.text()).toEqual('click here')
  })
})
