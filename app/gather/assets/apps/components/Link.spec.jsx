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

import { AETHER_KERNEL_URL, AETHER_ODK_URL } from '../utils/env'
import { Link, LinksList, normalizeLinksList } from './Link'

describe('Link components', () => {
  describe('Link', () => {
    it('should render a link', () => {
      const component = mount(
        <Link link={{url: '/link', name: 'click here'}} />
      )

      const link = component.find('a')
      expect(link.exists()).toBeTruthy()
      expect(link.props().href).toEqual('/link')
      expect(link.text()).toEqual('click here')
    })
  })

  describe('LinksList', () => {
    it('should render nothing with an empty list', () => {
      const component = mount(<LinksList />)
      expect(component.state('collapsed')).toBeFalsy()
      expect(component.text()).toEqual('')
    })

    it('should render a link', () => {
      const component = mount(
        <LinksList list={
          [
            {url: '/link', name: 'click here'}
          ]
        }
        />
      )
      expect(component.state('collapsed')).toBeFalsy()
      const button = component.find('[data-qa="link-list-collapse-button"]')
      expect(button.exists()).toBeFalsy()

      const link = component.find('a')
      expect(link.exists()).toBeTruthy()
      expect(link.props().href).toEqual('/link')
      expect(link.text()).toEqual('click here')
    })

    it('should render a list of links', () => {
      const component = mount(
        <LinksList list={
          [
            {url: '/link-1', name: 'click here 1'},
            {url: '/link-2', name: 'click here 2'},
            {url: '/link-3', name: 'click here 3'}
          ]
        }
        />
      )
      expect(component.state('collapsed')).toBeTruthy()
      const button = component.find('[data-qa="link-list-collapse-button"]')
      expect(button.exists()).toBeTruthy()

      button.simulate('click')

      const links = component.find('a')
      expect(links.exists()).toBeTruthy()
      expect(links.length).toEqual(3)

      for (let i = 0; i < 3; i++) {
        const link = links.get(i)

        expect(link.props.href).toEqual(`/link-${i + 1}`)
        expect(link.props.children).toEqual(`click here ${i + 1}`)
      }
    })
  })

  describe('normalizeLinksList', () => {
    it('should return an empty list', () => {
      expect(normalizeLinksList()).toEqual([])
      expect(normalizeLinksList([])).toEqual([])
      expect(normalizeLinksList([], 'app')).toEqual([])
    })

    it('should prepend the Kernel url', () => {
      const list = [
        {url: '/link-1', name: 'click here 1', useless: 1},
        {url: '/link-2', name: 'click here 2', to_be_ignored: 2},
        {url: '/link-3', name: 'click here 3', nothing: 'important'}
      ]
      const expected = [
        {url: AETHER_KERNEL_URL + '/link-1', name: 'click here 1'},
        {url: AETHER_KERNEL_URL + '/link-2', name: 'click here 2'},
        {url: AETHER_KERNEL_URL + '/link-3', name: 'click here 3'}
      ]
      expect(normalizeLinksList(list)).toEqual(expected)
      expect(normalizeLinksList(list, 'kernel')).toEqual(expected)
    })

    it('should prepend the ODK url', () => {
      const list = [
        {url: '/link-1', name: 'click here 1', useless: 1},
        {url: '/link-2', name: 'click here 2', to_be_ignored: 2},
        {url: '/link-3', name: 'click here 3', nothing: 'important'}
      ]
      const expected = [
        {url: AETHER_ODK_URL + '/link-1', name: 'click here 1'},
        {url: AETHER_ODK_URL + '/link-2', name: 'click here 2'},
        {url: AETHER_ODK_URL + '/link-3', name: 'click here 3'}
      ]

      expect(normalizeLinksList(list, 'odk')).toEqual(expected)
    })

    it('should not prepend anything', () => {
      const list = [
        {url: '/link-1', name: 'click here 1', useless: 1},
        {url: '/link-2', name: 'click here 2', to_be_ignored: 2},
        {url: '/link-3', name: 'click here 3', nothing: 'important'}
      ]
      const expected = [
        {url: '/link-1', name: 'click here 1'},
        {url: '/link-2', name: 'click here 2'},
        {url: '/link-3', name: 'click here 3'}
      ]

      expect(normalizeLinksList(list, 'zzz')).toEqual(expected)
    })
  })
})
