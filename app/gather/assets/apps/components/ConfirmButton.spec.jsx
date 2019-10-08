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

import ConfirmButton from './ConfirmButton'

/**
 * Tests:
 *
 * - default button is always displayed.
 *
 * - based on "condition" property, "onClick" action on default button will...
 *
 *    - ...execute onConfirm function if it exists and it's not satisfied.
 *
 *    - ...display the window message and the second confirm button otherwise,
 *         (close and cancel buttons appear only if it's also cancelable).
 *
 * - second confirm button executes onConfirm function.
 *
 * - close and cancel buttons hide the window message.
 */

const CLICK_ARGS = { preventDefault: () => {} }

describe('ConfirmButton', () => {
  describe('if "open" is false', () => {
    describe('and not "cancelable"', () => {
      it('should render only the initial confirm button', () => {
        const component = mountWithIntl(
          <ConfirmButton
            title='do'
            message='do?'
            onConfirm={() => { }}
          />
        )
        expect(component.instance().props.cancelable).toBeFalsy()
        expect(component.state('open')).toEqual(false)

        component.setState({ open: false })

        expect(component.state('open')).toEqual(false)
        expect(component.find('[data-qa="confirm-button"]').exists()).toBeTruthy()
        expect(component.find('[data-qa="confirm-button-window"]').exists()).toBeFalsy()
        expect(component.find('[data-qa="confirm-button-close"]').exists()).toBeFalsy()
        expect(component.find('[data-qa="confirm-button-cancel"]').exists()).toBeFalsy()
        expect(component.find('[data-qa="confirm-button-confirm"]').exists()).toBeFalsy()
        expect(component.find('[data-qa="confirm-button-message"]').exists()).toBeFalsy()
      })
    })

    describe('and "cancelable"', () => {
      it('should render only the initial confirm button', () => {
        const component = mountWithIntl(
          <ConfirmButton
            title='do'
            message='do?'
            cancelable
            onConfirm={() => { }}
          />
        )
        expect(component.instance().props.cancelable).toBeTruthy()
        expect(component.state('open')).toEqual(false)

        component.setState({ open: false })

        expect(component.state('open')).toEqual(false)
        expect(component.find('[data-qa="confirm-button"]').exists()).toBeTruthy()
        expect(component.find('[data-qa="confirm-button-window"]').exists()).toBeFalsy()
        expect(component.find('[data-qa="confirm-button-close"]').exists()).toBeFalsy()
        expect(component.find('[data-qa="confirm-button-cancel"]').exists()).toBeFalsy()
        expect(component.find('[data-qa="confirm-button-confirm"]').exists()).toBeFalsy()
        expect(component.find('[data-qa="confirm-button-message"]').exists()).toBeFalsy()
      })
    })
  })

  describe('if "open" is true', () => {
    describe('and not "cancelable"', () => {
      it('should render only the two confirm buttons and the message', () => {
        const component = mountWithIntl(
          <ConfirmButton
            title='do'
            message='do?'
            onConfirm={() => { }}
          />
        )
        expect(component.instance().props.cancelable).toBeFalsy()
        expect(component.state('open')).toEqual(false)

        component.setState({ open: true })

        expect(component.state('open')).toEqual(true)
        expect(component.find('[data-qa="confirm-button"]').exists()).toBeTruthy()
        expect(component.find('[data-qa="confirm-button-window"]').exists()).toBeTruthy()
        expect(component.find('[data-qa="confirm-button-close"]').exists()).toBeFalsy()
        expect(component.find('[data-qa="confirm-button-cancel"]').exists()).toBeFalsy()
        expect(component.find('[data-qa="confirm-button-confirm"]').exists()).toBeTruthy()
        expect(component.find('[data-qa="confirm-button-message"]').exists()).toBeTruthy()
        expect(component.find('[data-qa="confirm-button-message"]').text()).toContain('do?')
      })
    })

    describe('and "cancelable"', () => {
      it('should render all the buttons and the message', () => {
        const component = mountWithIntl(
          <ConfirmButton
            title='do'
            message='do?'
            cancelable
            onConfirm={() => { }}
          />
        )
        expect(component.instance().props.cancelable).toBeTruthy()
        expect(component.state('open')).toEqual(false)

        component.setState({ open: true })

        expect(component.state('open')).toEqual(true)
        expect(component.find('[data-qa="confirm-button"]').exists()).toBeTruthy()
        expect(component.find('[data-qa="confirm-button-window"]').exists()).toBeTruthy()
        expect(component.find('[data-qa="confirm-button-close"]').exists()).toBeTruthy()
        expect(component.find('[data-qa="confirm-button-cancel"]').exists()).toBeTruthy()
        expect(component.find('[data-qa="confirm-button-confirm"]').exists()).toBeTruthy()
        expect(component.find('[data-qa="confirm-button-message"]').exists()).toBeTruthy()
        expect(component.find('[data-qa="confirm-button-message"]').text()).toContain('do?')
      })
    })
  })

  it('should initially render only the confirm button', () => {
    const component = mountWithIntl(
      <ConfirmButton
        title='do'
        message='do?'
        onConfirm={() => { }}
      />
    )
    expect(component.state('open')).toBeFalsy()
  })

  it('should execute the "onConfirm" action if the condition is not satisfied', () => {
    let action = 0
    const component = mountWithIntl(
      <ConfirmButton
        title='do'
        message='do?'
        condition={() => false}
        onConfirm={() => { action++ }}
      />
    )

    expect(component.instance().props.cancelable).toBeFalsy()
    expect(component.state('open')).toBeFalsy()
    expect(action).toEqual(0)

    component.find('[data-qa="confirm-button"]').simulate('click', CLICK_ARGS)

    expect(action).toEqual(1)
    expect(component.state('open')).toBeFalsy()
  })

  it('should render the window message after clicking the button if there is no condition', () => {
    let action = 0
    const component = mountWithIntl(
      <ConfirmButton
        title='do'
        message='do?'
        onConfirm={() => { action++ }}
      />
    )

    expect(component.instance().props.cancelable).toBeFalsy()
    expect(component.state('open')).toBeFalsy()
    expect(action).toEqual(0)

    component.find('[data-qa="confirm-button"]').simulate('click', CLICK_ARGS)

    expect(action).toEqual(0)
    expect(component.state('open')).toBeTruthy()
  })

  it('should render the window message after clicking the button if the condition is satisfied', () => {
    let action = 0
    const component = mountWithIntl(
      <ConfirmButton
        title='do'
        message='do?'
        condition={() => true}
        onConfirm={() => { action++ }}
      />
    )

    expect(component.instance().props.cancelable).toBeFalsy()
    expect(component.state('open')).toBeFalsy()
    expect(action).toEqual(0)

    component.find('[data-qa="confirm-button"]').simulate('click', CLICK_ARGS)

    expect(action).toEqual(0)
    expect(component.state('open')).toBeTruthy()
  })

  it('should execute the onConfirm action after clicking the second confirm button', () => {
    let action = 0
    const component = mountWithIntl(
      <ConfirmButton
        title='do'
        message='do?'
        onConfirm={() => { action++ }}
      />
    )
    expect(action).toEqual(0)
    expect(component.state('open')).toBeFalsy()

    component.find('[data-qa="confirm-button"]').simulate('click', CLICK_ARGS)
    expect(action).toEqual(0)
    expect(component.state('open')).toBeTruthy()

    component.find('[data-qa="confirm-button-confirm"]').simulate('click', CLICK_ARGS)
    expect(action).toEqual(1)
    expect(component.state('open')).toBeFalsy()
  })

  describe('if cancelable', () => {
    it('should render only the button again after clicking the close button', () => {
      let action = 0
      const component = mountWithIntl(
        <ConfirmButton
          title='do'
          message='do?'
          cancelable
          onConfirm={() => { action++ }}
        />
      )
      expect(component.instance().props.cancelable).toEqual(true)
      expect(action).toEqual(0)
      expect(component.state('open')).toBeFalsy()

      component.find('[data-qa="confirm-button"]').simulate('click', CLICK_ARGS)

      expect(action).toEqual(0)
      expect(component.state('open')).toBeTruthy()

      component.find('[data-qa="confirm-button-close"]').simulate('click', CLICK_ARGS)

      expect(action).toEqual(0)
      expect(component.state('open')).toBeFalsy()
    })

    it('should render only the button again after clicking the cancel button', () => {
      let action = 0
      const component = mountWithIntl(
        <ConfirmButton
          title='do'
          message='do?'
          cancelable
          onConfirm={() => { action++ }}
        />
      )
      expect(component.instance().props.cancelable).toEqual(true)
      expect(action).toEqual(0)
      expect(component.state('open')).toBeFalsy()

      component.find('[data-qa="confirm-button"]').simulate('click', CLICK_ARGS)

      expect(action).toEqual(0)
      expect(component.state('open')).toBeTruthy()

      component.find('[data-qa="confirm-button-cancel"]').simulate('click', CLICK_ARGS)

      expect(action).toEqual(0)
      expect(component.state('open')).toBeFalsy()
    })
  })
})
