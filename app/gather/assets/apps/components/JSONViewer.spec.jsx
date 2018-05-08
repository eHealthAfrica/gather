/* global describe, it, expect */

import React from 'react'
import { mountWithIntl } from 'enzyme-react-intl'

import JSONViewer from './JSONViewer'

describe('JSONViewer', () => {
  describe('Basic types', () => {
    it('should render "–" without meaningful data', () => {
      const component = mountWithIntl(<JSONViewer />)
      expect(component.text()).toEqual('–')

      const componentNull = mountWithIntl(<JSONViewer data={null} />)
      expect(componentNull.text()).toEqual('–')

      const componentUndefined = mountWithIntl(<JSONViewer data={undefined} />)
      expect(componentUndefined.text()).toEqual('–')

      const componentEmptyString = mountWithIntl(<JSONViewer data='' />)
      expect(componentEmptyString.text()).toEqual('–')

      const componentEmptyLongString = mountWithIntl(<JSONViewer data='   ' />)
      expect(componentEmptyLongString.text()).toEqual('–')
    })

    it('should render integer values', () => {
      const componentInteger = mountWithIntl(<JSONViewer data={1} />)
      expect(componentInteger.text()).toEqual('1')
    })

    it('should render decimal values', () => {
      const componentDecimal = mountWithIntl(<JSONViewer data={1.5} />)
      expect(componentDecimal.text()).toEqual('1.500000')
    })

    it('should render string values', () => {
      const componentString = mountWithIntl(
        <JSONViewer data='something' links={[{name: 'image.png', url: '/image'}]} />
      )
      expect(componentString.text()).toEqual('something')
    })

    it('should render string values with links', () => {
      const componentStringLinks = mountWithIntl(
        <JSONViewer data={'image.png'} links={[{name: 'image.png', url: '/image'}]} />
      )
      expect(componentStringLinks.text()).toEqual('image.png')

      const link = componentStringLinks.find('a')
      expect(link.exists()).toBeTruthy()
      expect(link.props().href).toEqual('/image')
      expect(link.text()).toEqual('image.png')
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
      expect(componentDateTime.text()).toEqual('January 2, 2018 - 13:24:16 UTC')
    })
  })

  describe('Object', () => {
    it('should render "–" without meaningful data', () => {
      const componentEmptyObject = mountWithIntl(<JSONViewer data={{}} />)
      expect(componentEmptyObject.text()).toEqual('–')
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
        expect(node.find('.property-value').text()).toEqual('–')
      })
    })
  })

  describe('Array', () => {
    it('should render "–" without meaningful data', () => {
      const componentEmptyArray = mountWithIntl(<JSONViewer data={[]} />)
      expect(componentEmptyArray.text()).toEqual('–')
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
        expect(node.text()).toEqual('–')
      })
    })
  })
})
