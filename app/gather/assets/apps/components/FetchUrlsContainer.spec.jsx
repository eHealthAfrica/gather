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

const BLANK_STATE = {
  isLoading: false,
  isRefreshing: false,
  error: null,
  response: false
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

        component.setState({ ...BLANK_STATE, isLoading: true })

        expect(component.find(LoadingSpinner).exists()).toBeTruthy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeFalsy()
        expect(component.find(Foo).exists()).toBeFalsy()
      })

      it('should render the fetch error warning', () => {
        const component = buildStateComponent('/warning')

        component.setState({ ...BLANK_STATE, error: {} })

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeTruthy()
        expect(component.find(EmptyAlert).exists()).toBeFalsy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeFalsy()
        expect(component.find(Foo).exists()).toBeFalsy()
      })

      it('should render the empty warning', () => {
        const component = buildStateComponent('/empty')

        component.setState({ ...BLANK_STATE })

        expect(component.find(LoadingSpinner).exists()).toBeFalsy()
        expect(component.find(RefreshSpinner).exists()).toBeFalsy()
        expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
        expect(component.find(EmptyAlert).exists()).toBeTruthy()
        expect(component.find('[data-qa="data-loaded"]').exists()).toBeFalsy()
        expect(component.find(Foo).exists()).toBeFalsy()
      })

      it('should render the refresh spinner and the target component', () => {
        const component = buildStateComponent('/spinner-target')

        component.setState({ ...BLANK_STATE, isRefreshing: true, response: true })

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

        component.setState({ ...BLANK_STATE, response: true })

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

        component.setState({ ...BLANK_STATE, response: true })

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

        component.setState({ ...BLANK_STATE, isLoading: true })

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

        component.setState({ ...BLANK_STATE, error: {} })

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

        component.setState({ ...BLANK_STATE })

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

        component.setState({ ...BLANK_STATE, isRefreshing: true, response: true })

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

        component.setState({ ...BLANK_STATE, response: true })

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

        component.setState({ ...BLANK_STATE, response: true })

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

  describe('abort', () => {
    beforeEach(() => {
      nock.cleanAll()
    })

    afterEach(() => {
      nock.isDone()
      nock.cleanAll()
    })

    it('should call the abort method if unmounted', async () => {
      const component = mountWithIntl(
        <FetchUrlsContainer
          targetComponent={Foo}
          urls={[]}
        />
      )

      let abortCalled = false
      const mockController = {
        abort: () => {
          abortCalled = true
        }
      }

      component.setState({ controller: mockController })

      expect(abortCalled).toBeFalsy()
      component.unmount()
      expect(abortCalled).toBeTruthy()
    })

    it('should call the abort method if "refreshData" is called', async () => {
      const component = mountWithIntl(
        <FetchUrlsContainer
          targetComponent={Foo}
          urls={[]}
        />
      )

      let abortCalled = false
      const mockController = {
        abort: () => {
          abortCalled = true
        }
      }

      component.setState({ controller: mockController })

      expect(abortCalled).toBeFalsy()
      component.instance().refreshData()
      expect(abortCalled).toBeTruthy()
    })
  })
})
