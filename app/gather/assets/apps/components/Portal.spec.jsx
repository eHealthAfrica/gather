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

/* global describe, it, expect, KeyboardEvent */

import React from 'react'
import { mount } from 'enzyme'

import Portal from './Portal'

const Foo = () => 'foo'

describe('Portal', () => {
  it('should render the component in the DOM', () => {
    expect(document.body.getElementsByTagName('div').length).toEqual(0)

    const component = mount(<Portal><Foo /></Portal>)

    expect(document.body.getElementsByTagName('div').length).toEqual(1)
    expect(document.body.getElementsByTagName('div')[0].innerHTML).toEqual('foo')

    component.unmount()

    expect(document.body.getElementsByTagName('div').length).toEqual(0)
  })

  it('should listen to document keydown events', () => {
    let escape = 0
    let enter = 0

    const onEscape = () => { escape++ }
    const onEnter = () => { enter++ }

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })

    const component = mount(<Portal />)
    document.dispatchEvent(escapeEvent)
    expect(escape).toEqual(0)
    expect(enter).toEqual(0)

    document.dispatchEvent(enterEvent)
    expect(escape).toEqual(0)
    expect(enter).toEqual(0)
    component.unmount()

    const componentEscape = mount(<Portal onEscape={onEscape} />)
    document.dispatchEvent(escapeEvent)
    expect(escape).toEqual(1)
    expect(enter).toEqual(0)

    document.dispatchEvent(enterEvent)
    expect(escape).toEqual(1)
    expect(enter).toEqual(0)
    componentEscape.unmount()

    const componentEnter = mount(<Portal onEnter={onEnter} />)
    document.dispatchEvent(escapeEvent)
    expect(escape).toEqual(1)
    expect(enter).toEqual(0)

    document.dispatchEvent(enterEvent)
    expect(escape).toEqual(1)
    expect(enter).toEqual(1)
    componentEnter.unmount()

    const componentKeydown = mount(<Portal onEscape={onEscape} onEnter={onEnter} />)
    document.dispatchEvent(escapeEvent)
    expect(escape).toEqual(2)
    expect(enter).toEqual(1)

    document.dispatchEvent(enterEvent)
    expect(escape).toEqual(2)
    expect(enter).toEqual(2)
    componentKeydown.unmount()
  })
})
