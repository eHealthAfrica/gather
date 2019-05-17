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

/* global describe, it, expect, beforeEach, afterEach */

import React from 'react'
import { mount } from 'enzyme'

import { isMounted } from './dom'

class Foo extends React.Component {
  render () {
    return 'foo ' + JSON.stringify(this.props)
  }
}

describe('DOM utils', () => {
  let element = null
  beforeEach(() => {
    element = document.createElement('div')
    element.id = 'my-element'
    document.body.appendChild(element)

    expect(document.body.innerHTML)
      .toEqual('<div id="my-element"></div>')
  })

  afterEach(() => {
    document.body.removeChild(element)
  })

  describe('isMounted', () => {
    it('should return true if the component is in the DOM', () => {
      const component = mount(<Foo />, { attachTo: element })

      expect(isMounted(component.instance())).toBeTruthy()
    })

    it('should return false if the component is not in the DOM', () => {
      const component = mount(<Foo />, { attachTo: element })
      component.unmount()
      expect(isMounted(component)).toBeFalsy()
    })
  })
})
