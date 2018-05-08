/* global describe, it, expect, beforeEach, afterEach */

import React from 'react'
import { mountWithIntl } from 'enzyme-react-intl'
import nock from 'nock'

import {
  EmptyAlert,
  FetchErrorAlert,
  FetchUrlsContainer,
  LoadingSpinner,
  RefreshSpinner
} from './index'

class Foo extends React.Component {
  render () {
    return 'foo'
  }
}

describe('FetchUrlsContainer', () => {
  describe('depending on the state', () => {
    describe('without silent property', () => {
      const buildStateComponent = (path) => {
        nock('http://localhost').get(path).reply(200, {})

        const component = mountWithIntl(
          <FetchUrlsContainer
            targetComponent={Foo}
            urls={[{
              name: 'test',
              url: path
            }]}
          />
        )

        expect(component.instance().props.silent).toBeFalsy()
        expect(component.state('isLoading')).toBeTruthy()

        return component
      }

      beforeEach(() => {
        nock.cleanAll()
      })

      afterEach(() => {
        nock.isDone()
        nock.cleanAll()
      })

      it('should render the loading spinner', () => {
        const component = buildStateComponent('/spinner')

        component.setState({ isLoading: true, isRefreshing: false, error: null, response: false })

        expect(component.find(LoadingSpinner).exists()).toBeTruthy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeFalsy()
        expect(component.find(Foo).exists()).toBeFalsy()
      })

      it('should render the fetch error warning', () => {
        const component = buildStateComponent('/warning')

        component.setState({ isLoading: false, isRefreshing: false, error: {}, response: false })

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeTruthy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeFalsy()
        expect(component.find(Foo).exists()).toBeFalsy()
      })

      it('should render the empty warning', () => {
        const component = buildStateComponent('/empty')

        component.setState({ isLoading: false, isRefreshing: false, error: null, response: false })

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeTruthy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeFalsy()
        expect(component.find(Foo).exists()).toBeFalsy()
      })

      it('should render the refresh spinner and the target component', () => {
        const component = buildStateComponent('/spinner-target')

        component.setState({ isLoading: false, isRefreshing: true, error: null, response: true })

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeTruthy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeTruthy()
        expect(component.find(Foo).exists()).toBeTruthy()
        expect(component.text()).toEqual('foo')
      })

      it('should render the refresh spinner and the target component with "refreshData"', () => {
        const component = buildStateComponent('/spinner-target-refresh')

        component.setState({ isLoading: false, isRefreshing: false, error: null, response: true })

        nock('http://localhost').get('/spinner-target-refresh').reply(200, {})
        component.instance().refreshData()
        component.update()

        expect(component.state('isRefreshing')).toBeTruthy()
        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeTruthy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeTruthy()
        expect(component.find(Foo).exists()).toBeTruthy()
        expect(component.text()).toEqual('foo')
      })

      it('should render the target component', () => {
        const component = buildStateComponent('/target')

        component.setState({ isLoading: false, isRefreshing: false, error: null, response: true })

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeTruthy()
        expect(component.find(Foo).exists()).toBeTruthy()
        expect(component.text()).toEqual('foo')
      })
    })

    describe('with silent property', () => {
      const buildStateSilentComponent = (path) => {
        nock('http://localhost').get(path).reply(200, {})

        const component = mountWithIntl(
          <FetchUrlsContainer
            silent
            targetComponent={Foo}
            urls={[{
              name: 'test',
              url: path
            }]}
          />
        )

        expect(component.instance().props.silent).toBeTruthy()
        expect(component.state('isLoading')).toBeTruthy()

        return component
      }

      beforeEach(() => {
        nock.cleanAll()
      })

      afterEach(() => {
        nock.isDone()
        nock.cleanAll()
      })

      it('should NOT render the loading spinner', () => {
        const component = buildStateSilentComponent('/spinner-silent')

        component.setState({ isLoading: true, isRefreshing: false, error: null, response: false })

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeFalsy()
        expect(component.find(Foo).exists()).toBeFalsy()
        expect(component.text()).toEqual('')
      })

      it('should NOT render the fetch error warning', () => {
        const component = buildStateSilentComponent('/warning-silent')

        component.setState({ isLoading: false, isRefreshing: false, error: {}, response: false })

        expect(component.text()).toEqual('')
        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeFalsy()
        expect(component.find(Foo).exists()).toBeFalsy()
        expect(component.text()).toEqual('')
      })

      it('should NOT render the empty warning', () => {
        const component = buildStateSilentComponent('/empty-silent')

        component.setState({ isLoading: false, isRefreshing: false, error: null, response: false })

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeFalsy()
        expect(component.find(Foo).exists()).toBeFalsy()
        expect(component.text()).toEqual('')
      })

      it('should NOT render the refresh spinner BUT the target component', () => {
        const component = buildStateSilentComponent('/spinner-target-silent')

        component.setState({ isLoading: false, isRefreshing: true, error: null, response: true })

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeTruthy()
        expect(component.find(Foo).exists()).toBeTruthy()
        expect(component.text()).toEqual('foo')
      })

      it('should NOT render the refresh spinner BUT the target component with "refreshData"', () => {
        const component = buildStateSilentComponent('/spinner-target-refresh-silent')

        component.setState({ isLoading: false, isRefreshing: false, error: null, response: true })

        nock('http://localhost').get('/spinner-target-refresh-silent').reply(200, {})
        component.instance().refreshData()

        expect(component.state('isRefreshing')).toBeTruthy()
        component.update()

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeTruthy()
        expect(component.find(Foo).exists()).toBeTruthy()
        expect(component.text()).toEqual('foo')
      })

      it('should render the target component', () => {
        const component = buildStateSilentComponent('/target-silent')

        component.setState({ isLoading: false, isRefreshing: false, error: null, response: true })

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeTruthy()
        expect(component.find(Foo).exists()).toBeTruthy()
        expect(component.text()).toEqual('foo')
      })
    })
  })

  describe('depending on fetch response', () => {
    describe('without silent property', () => {
      const buildFetchComponent = (path) => {
        nock('http://localhost').get(path).reply(200, {})

        const component = mountWithIntl(
          <FetchUrlsContainer
            targetComponent={Foo}
            urls={[{
              name: 'test',
              url: path
            }]}
          />
        )

        expect(component.instance().props.silent).toBeFalsy()
        expect(component.state('isLoading')).toBeTruthy()
        expect(component.state('isRefreshing')).toBeFalsy()
        expect(component.state('error')).toBeFalsy()
        expect(component.state('response')).toBeFalsy()

        return component
      }

      beforeEach(() => {
        nock.cleanAll()
      })

      afterEach(() => {
        nock.isDone()
        nock.cleanAll()
      })

      it('should render the fetch error warning', async () => {
        const component = buildFetchComponent('/fetch-error')

        nock('http://localhost').get('/fetch-error').reply(404, {})

        await component.instance().loadData()
        component.update()

        expect(component.state('error')).toBeTruthy()

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeTruthy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeFalsy()
        expect(component.find(Foo).exists()).toBeFalsy()
      })

      it('should render the empty warning', async () => {
        const component = buildFetchComponent('/fetch-empty')

        nock('http://localhost').get('/fetch-empty').reply(200, {})

        // make sure that there is no response
        component.setProps({ handleResponse: () => false })
        await component.instance().loadData()
        component.update()

        expect(component.state('response')).toBeFalsy()

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeTruthy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeFalsy()
        expect(component.find(Foo).exists()).toBeFalsy()
      })

      it('should render the target component', async () => {
        const component = buildFetchComponent('/fetch-target')

        nock('http://localhost').get('/fetch-target').reply(200, {})

        await component.instance().loadData()
        component.update()

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeTruthy()
        expect(component.find(Foo).exists()).toBeTruthy()
        expect(component.text()).toEqual('foo')
      })
    })

    describe('with silent property', () => {
      const buildFetchSilentComponent = (path) => {
        nock('http://localhost').get(path).reply(200, {})

        const component = mountWithIntl(
          <FetchUrlsContainer
            silent
            targetComponent={Foo}
            urls={[{
              name: 'test',
              url: path
            }]}
          />
        )

        expect(component.instance().props.silent).toBeTruthy()
        expect(component.state('isLoading')).toBeTruthy()
        expect(component.state('isRefreshing')).toBeFalsy()
        expect(component.state('error')).toBeFalsy()
        expect(component.state('response')).toBeFalsy()

        return component
      }

      beforeEach(() => {
        nock.cleanAll()
      })

      afterEach(() => {
        nock.isDone()
        nock.cleanAll()
      })

      it('should NOT render the fetch error warning', async () => {
        const component = buildFetchSilentComponent('/fetch-error-silent')

        nock('http://localhost').get('/fetch-error-silent').reply(404, {})
        component.update()

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeFalsy()
        expect(component.find(Foo).exists()).toBeFalsy()
        expect(component.text()).toEqual('')
      })

      it('should NOT render the empty warning', async () => {
        const component = buildFetchSilentComponent('/fetch-empty-silent')

        nock('http://localhost').get('/fetch-empty-silent').reply(204)

        // make sure that there is no response
        component.setProps({ handleResponse: () => false })
        await component.instance().loadData()
        component.update()

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeFalsy()
        expect(component.find(Foo).exists()).toBeFalsy()
        expect(component.text()).toEqual('')
      })

      it('should render the target component', async () => {
        const component = buildFetchSilentComponent('/fetch-target-silent')

        nock('http://localhost').get('/fetch-target-silent').reply(200, {})

        await component.instance().loadData()
        component.update()

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeTruthy()
        expect(component.find(Foo).exists()).toBeTruthy()
        expect(component.text()).toEqual('foo')
      })
    })
  })
})
