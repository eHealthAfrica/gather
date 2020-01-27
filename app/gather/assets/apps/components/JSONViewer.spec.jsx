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

import { BLANK, DASH } from '../utils/constants'

import JSONViewer from './JSONViewer'

describe('JSONViewer', () => {
  describe('Basic types', () => {
    it('should render BLANK constant without meaningful data', () => {
      const component = mountWithIntl(<JSONViewer />)
      expect(component.text()).toEqual(BLANK)

      const componentNull = mountWithIntl(<JSONViewer data={null} />)
      expect(componentNull.text()).toEqual(BLANK)

      const componentUndefined = mountWithIntl(<JSONViewer data={undefined} />)
      expect(componentUndefined.text()).toEqual(BLANK)

      const componentEmptyString = mountWithIntl(<JSONViewer data='' />)
      expect(componentEmptyString.text()).toEqual(BLANK)

      const componentEmptyLongString = mountWithIntl(<JSONViewer data='   ' />)
      expect(componentEmptyLongString.text()).toEqual(BLANK)
    })

    it('should render integer values', () => {
      const componentInteger = mountWithIntl(<JSONViewer data={1} />)
      expect(componentInteger.text()).toEqual('1')
    })

    it('should render decimal values', () => {
      const componentDecimal = mountWithIntl(<JSONViewer data={1.5} />)
      expect(componentDecimal.text()).toEqual('1.500000')
    })

    it('should render boolean values', () => {
      const yes = true
      const componentTrue = mountWithIntl(<JSONViewer data={yes} />)
      expect(componentTrue.text()).toEqual('Yes')

      const no = false
      const componentFalse = mountWithIntl(<JSONViewer data={no} />)
      expect(componentFalse.text()).toEqual('No')
    })

    it('should render date values', () => {
      const componentDate = mountWithIntl(<JSONViewer data='2018-01-02' />)
      expect(componentDate.text()).toEqual('January 2, 2018')

      const componentTime = mountWithIntl(<JSONViewer data='13:24:16' />)
      expect(componentTime.text()).toEqual('13:24:16')

      const componentDateTime = mountWithIntl(<JSONViewer data='2018-01-02T13:24:16.000Z' />)
      expect(componentDateTime.text()).toEqual(`January 2, 2018 ${DASH} 13:24:16 UTC`)
    })

    it('should render string values', () => {
      const componentString = mountWithIntl(
        <JSONViewer data='something' links={[{ name: 'image.png', url: '/image' }]} />
      )
      expect(componentString.text()).toEqual('something')
    })

    it('should render string values with links', () => {
      const componentStringLinks = mountWithIntl(
        <JSONViewer data='image.png' links={[{ name: 'image.png', url: '/image' }]} />
      )
      expect(componentStringLinks.text()).toEqual('image.png')

      const link = componentStringLinks.find('a')
      expect(link.exists()).toBeTruthy()
      expect(link.props().href).toEqual('/image')
      expect(link.text()).toEqual('image.png')
    })
  })

  describe('Object', () => {
    it('should render BLANK constant without meaningful data', () => {
      const componentEmptyObject = mountWithIntl(<JSONViewer data={{}} />)
      expect(componentEmptyObject.text()).toEqual(BLANK)
    })

    it('should render the object in pieces', () => {
      const component = mountWithIntl(
        <JSONViewer
          data={{
            property_0: 'value_0',
            property_1: 'value_1',
            property_2: 'value_2'
          }}
        />
      )

      const properties = component.find('.property')
      expect(properties.length).toEqual(3)

      properties.forEach((node, index) => {
        expect(node.find('.property-title').text()).toEqual(`property ${index}`) // cleaned key name
        expect(node.find('.property-value').text()).toEqual(`value_${index}`)
      })
    })

    it('should render object with empty properties', () => {
      const component = mountWithIntl(
        <JSONViewer
          data={{
            property_0: null,
            property_1: undefined,
            property_2: '',
            property_3: '   ',
            property_4: [],
            property_5: {}
          }}
        />
      )

      const properties = component.find('.property')
      expect(properties.length).toEqual(6)

      properties.forEach((node, index) => {
        expect(node.find('.property-title').text()).toEqual(`property ${index}`) // cleaned key name
        expect(node.find('.property-value').text()).toEqual(BLANK)
      })
    })

    it('should collapse nested properties', () => {
      const component = mountWithIntl(
        <JSONViewer
          data={{
            property_0: { property_1: 1 }
          }}
        />
      )

      expect(component.find('.property').length).toEqual(1)
      expect(component.find('.property-title').text()).toEqual('property 0')
      // by default nested property is collapsed
      expect(component.find('.property-value').text()).toEqual('…')
      component.find('button').simulate('click')

      const properties = component.find('.property')
      expect(properties.length).toEqual(2)
      properties.forEach((node, index) => {
        expect(node.find('.property-title').first().text()).toEqual(`property ${index}`) // cleaned key name
        expect(node.find('.property-value').first().text()).not.toEqual('…')
      })
    })
  })

  describe('Array', () => {
    it('should render BLANK constant without meaningful data', () => {
      const componentEmptyArray = mountWithIntl(<JSONViewer data={[]} />)
      expect(componentEmptyArray.text()).toEqual(BLANK)
    })

    it('should render the array in pieces', () => {
      const component = mountWithIntl(<JSONViewer data={[0, 1, 2]} />)

      expect(component.find('.property-item').length).toEqual(0)

      // by default array is collapsed
      component.find('button').simulate('click')

      const properties = component.find('.property-item')
      expect(properties.length).toEqual(3)

      properties.forEach((node, index) => {
        expect(node.text()).toEqual(`${index}`)
      })
    })

    it('should render array with empty properties', () => {
      const component = mountWithIntl(
        <JSONViewer
          data={[
            null,
            undefined,
            '',
            '   ',
            [],
            {}
          ]}
        />
      )

      expect(component.find('.property-item').length).toEqual(0)

      // by default array is collapsed
      component.find('button').simulate('click')

      const properties = component.find('.property-item')
      expect(properties.length).toEqual(6)

      properties.forEach((node, index) => {
        expect(node.text()).toEqual(BLANK)
      })
    })
  })

  describe('Labels', () => {
    it('should use the given labels to render the titles', () => {
      const component = mountWithIntl(
        <JSONViewer
          data={{ a: 1 }}
          labels={{ a: 'Root' }}
        />
      )
      expect(component.find('.property-title').text()).toEqual('Root')
    })

    it('should detect array properties', () => {
      const component = mountWithIntl(
        <JSONViewer
          data={[{ e: 1 }]}
          labels={{ 'a.d.#.e': 'The indexed E' }}
          labelRoot='a.d.'
        />
      )
      // by default array is collapsed
      component.find('button').simulate('click')
      expect(component.find('.property-title').text()).toEqual('The indexed E')
    })

    it('should detect map properties', () => {
      const component = mountWithIntl(
        <JSONViewer
          data={{ c: 1 }}
          labels={{ 'a.*.c': 'The Big C' }}
          labelRoot='a.x.'
        />
      )
      expect(component.find('.property-title').text()).toEqual('The Big C')
    })
  })
})
