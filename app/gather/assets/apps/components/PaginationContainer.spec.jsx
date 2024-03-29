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

/* global describe, it, expect, beforeEach, afterEach */

import React from 'react'
import { mountWithIntl } from '../../tests/enzyme-helpers'
import nock from 'nock'

import {
  EmptyAlert,
  FetchErrorAlert,
  LoadingSpinner,
  PaginationBar,
  PaginationContainer,
  RefreshSpinner
} from './index'

const Foo = ({ list }) => `foo: [${list}]`

const BLANK_STATE = {
  isLoading: false,
  isRefreshing: false,
  error: null,
  list: null
}

describe('PaginationContainer', () => {
  describe('depending on the state', () => {
    const buildStateComponent = (url) => {
      nock('http://localhost')
        .get(url)
        .query({ page: 1, page_size: 25 })
        .reply(200, {})

      const component = mountWithIntl(
        <PaginationContainer
          listComponent={Foo}
          url={url}
          sizes={[25]}
        />
      )

      expect(component.state('isLoading')).toBeTruthy()
      expect(component.state('sizes')).toEqual([25])
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
      const component = buildStateComponent('/paginate-spinner')

      component.setState({ ...BLANK_STATE, isLoading: true })

      expect(component.find(LoadingSpinner).exists()).toBeTruthy()
      expect(component.find(RefreshSpinner).exists()).toBeFalsy()
      expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
      expect(component.find('[data-qa="data-loaded"]').exists()).toBeFalsy()
      expect(component.find(PaginationBar).exists()).toBeFalsy()
      expect(component.find(EmptyAlert).exists()).toBeFalsy()
      expect(component.find(Foo).exists()).toBeFalsy()
    })

    it('should render the fetch error warning', () => {
      const component = buildStateComponent('/paginate-warning')

      component.setState({
        ...BLANK_STATE,
        error: { message: 'something went wrong' }
      })

      expect(component.find(LoadingSpinner).exists()).toBeFalsy()
      expect(component.find(RefreshSpinner).exists()).toBeFalsy()
      expect(component.find(FetchErrorAlert).exists()).toBeTruthy()
      expect(component.find('[data-qa="data-loaded"]').exists()).toBeFalsy()
      expect(component.find(PaginationBar).exists()).toBeFalsy()
      expect(component.find(EmptyAlert).exists()).toBeFalsy()
      expect(component.find(Foo).exists()).toBeFalsy()
    })

    it('should render the empty warning', () => {
      const component = buildStateComponent('/paginate-empty')

      component.setState({
        ...BLANK_STATE,
        list: {
          count: 0,
          results: []
        }
      })

      expect(component.find(LoadingSpinner).exists()).toBeFalsy()
      expect(component.find(RefreshSpinner).exists()).toBeFalsy()
      expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
      expect(component.find('[data-qa="data-loaded"]').exists()).toBeTruthy()
      expect(component.find(PaginationBar).exists()).toBeTruthy()
      expect(component.find(EmptyAlert).exists()).toBeTruthy()
      expect(component.find(Foo).exists()).toBeFalsy()
    })

    it('should render the not found warning', () => {
      nock('http://localhost')
        .get('/paginate-not-found')
        .query({ page: 1, page_size: 25, search: 'something' })
        .reply(200, { count: 0, results: [] })

      const component = buildStateComponent('/paginate-not-found')
      component.setState({
        ...BLANK_STATE,
        search: 'something',
        list: {
          count: 0,
          results: []
        }
      })

      expect(component.find(LoadingSpinner).exists()).toBeFalsy()
      expect(component.find(RefreshSpinner).exists()).toBeFalsy()
      expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
      expect(component.find('[data-qa="data-loaded"]').exists()).toBeTruthy()
      expect(component.find(PaginationBar).exists()).toBeTruthy()
      expect(component.find(EmptyAlert).exists()).toBeFalsy()
      expect(component.find(Foo).exists()).toBeFalsy()
      expect(component.find('[data-qa="data-empty"]').exists()).toBeTruthy()
      expect(component.find('[data-qa="data-empty"]').text())
        .toEqual('No results found for something.')
    })

    it('should render the refresh spinner and the list component', () => {
      const component = buildStateComponent('/paginate-spinner-list')

      component.setState({
        ...BLANK_STATE,
        isRefreshing: true,
        list: {
          count: 1,
          results: [1]
        }
      })

      expect(component.find(LoadingSpinner).exists()).toBeFalsy()
      expect(component.find(RefreshSpinner).exists()).toBeTruthy()
      expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
      expect(component.find('[data-qa="data-loaded"]').exists()).toBeTruthy()
      expect(component.find(PaginationBar).exists()).toBeTruthy()
      expect(component.find(EmptyAlert).exists()).toBeFalsy()
      expect(component.find(Foo).exists()).toBeTruthy()
      expect(component.text()).toEqual('foo: [1]')
    })

    it('should render the list component', () => {
      const component = buildStateComponent('/paginate-list')

      component.setState({
        ...BLANK_STATE,
        list: {
          count: 2,
          results: [1, 2]
        }
      })

      expect(component.find(LoadingSpinner).exists()).toBeFalsy()
      expect(component.find(RefreshSpinner).exists()).toBeFalsy()
      expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
      expect(component.find('[data-qa="data-loaded"]').exists()).toBeTruthy()
      expect(component.find(PaginationBar).exists()).toBeTruthy()
      expect(component.find(EmptyAlert).exists()).toBeFalsy()
      expect(component.find(Foo).exists()).toBeTruthy()
      expect(component.text()).toEqual('foo: [1,2]')
    })

    it('should change current page to 1 if pageSize is changed', () => {
      nock('http://localhost')
        .get('/paginate-page-size')
        .query({ page: 14, page_size: 50 })
        .reply(200, {
          count: 1500,
          results: global.range(0, 50)
        })

      const component = buildStateComponent('/paginate-page-size')
      component.setState({ page: 14, pageSize: 50 })
      expect(component.state('page')).toEqual(14)
      expect(component.state('pageSize')).toEqual(50)
      // change state does not update sizes
      expect(component.state('sizes')).toEqual([25])

      nock('http://localhost')
        .get('/paginate-page-size')
        .query({ page: 1, page_size: 100 })
        .reply(200, {
          count: 1500,
          results: global.range(0, 100)
        })

      component.setProps({ pageSize: 100, sizes: [1] })
      expect(component.state('page')).toEqual(1)
      expect(component.state('pageSize')).toEqual(100)
      expect(component.state('sizes')).toEqual([1, 100])

      nock('http://localhost')
        .get('/paginate-page-size')
        .query({ page: 12, page_size: 100 })
        .reply(200, {
          count: 1500,
          results: global.range(0, 100)
        })

      component.setState({ page: 12 })
      component.setProps({ sizes: [100] })
      expect(component.state('page')).toEqual(12)
      expect(component.state('pageSize')).toEqual(100)
      expect(component.state('sizes')).toEqual([100])

      nock('http://localhost')
        .get('/paginate-page-size')
        .query({ page: 1, page_size: 10 })
        .reply(200, {
          count: 1500,
          results: global.range(0, 10)
        })

      component.setProps({ pageSize: 10, sizes: [100] })
      expect(component.state('page')).toEqual(1)
      expect(component.state('pageSize')).toEqual(10)
      expect(component.state('sizes')).toEqual([10, 100])
    })
  })

  describe('depending on fetch response', () => {
    const buildFetchComponent = (url) => {
      nock('http://localhost')
        .get(url)
        .query({ page: 1, page_size: 25 })
        .reply(200, { count: 0, results: [] })

      const component = mountWithIntl(
        <PaginationContainer
          listComponent={Foo}
          url={url + '?'}
          position='top'
          mapResponse={(list) => list.map(a => a + 1)}
        />
      )

      expect(component.state('isLoading')).toBeTruthy()
      expect(component.state('isRefreshing')).toBeFalsy()
      expect(component.state('error')).toBeFalsy()
      expect(component.state('list')).toBeFalsy()

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
      nock('http://localhost')
        .get('/fetch-warning')
        .query({ page: 1, page_size: 25 })
        .reply(404)

      const component = buildFetchComponent('/fetch-warning')
      await component.instance().loadData()
      expect(component.state('isLoading')).toBeFalsy()
      expect(component.state('isRefreshing')).toBeFalsy()
      expect(component.state('list')).toBeFalsy()
      expect(component.state('error')).toBeTruthy()

      component.update()

      expect(component.find(RefreshSpinner).exists()).toBeFalsy()
      expect(component.find(FetchErrorAlert).exists()).toBeTruthy()
      expect(component.find('[data-qa="data-loaded"]').exists()).toBeFalsy()
      expect(component.find(PaginationBar).exists()).toBeFalsy()
      expect(component.find(EmptyAlert).exists()).toBeFalsy()
      expect(component.find(Foo).exists()).toBeFalsy()
    })

    it('should render the empty warning', async () => {
      nock('http://localhost')
        .get('/fetch-empty')
        .query({ page: 1, page_size: 25 })
        .reply(200, { count: 0, results: [] })

      const component = buildFetchComponent('/fetch-empty')
      await component.instance().loadData()
      expect(component.state('isLoading')).toBeFalsy()
      expect(component.state('isRefreshing')).toBeFalsy()
      expect(component.state('list')).toBeTruthy()
      expect(component.state('error')).toBeFalsy()

      component.update()

      expect(component.find(LoadingSpinner).exists()).toBeFalsy()
      expect(component.find(RefreshSpinner).exists()).toBeFalsy()
      expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
      expect(component.find('[data-qa="data-loaded"]').exists()).toBeTruthy()
      expect(component.find(PaginationBar).exists()).toBeTruthy()
      expect(component.find(EmptyAlert).exists()).toBeTruthy()
      expect(component.find(Foo).exists()).toBeFalsy()
    })

    it('should render the list component', async () => {
      nock('http://localhost')
        .get('/fetch-list')
        .query({ page: 1, page_size: 25 })
        .reply(200, { count: 1, results: [1] })

      const component = buildFetchComponent('/fetch-list')
      await component.instance().loadData()
      expect(component.state('isLoading')).toBeFalsy()
      expect(component.state('isRefreshing')).toBeFalsy()
      expect(component.state('list')).toBeTruthy()
      expect(component.state('error')).toBeFalsy()

      component.update()

      expect(component.find(LoadingSpinner).exists()).toBeFalsy()
      expect(component.find(RefreshSpinner).exists()).toBeFalsy()
      expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
      expect(component.find('[data-qa="data-loaded"]').exists()).toBeTruthy()
      expect(component.find(PaginationBar).exists()).toBeTruthy()
      expect(component.find(EmptyAlert).exists()).toBeFalsy()
      expect(component.find(Foo).exists()).toBeTruthy()
      expect(component.text()).toEqual('foo: [2]')
    })
  })

  describe('PaginationBar iterations', () => {
    const buildPaginationComponent = (path) => {
      nock('http://localhost')
        .get(path)
        .query({ page: 1, page_size: 25 })
        .reply(200, {
          count: 100,
          results: global.range(0, 25)
        })

      const component = mountWithIntl(
        <PaginationContainer
          listComponent={Foo}
          url={path}
          sizes={[1, 10, 25]}
          titleBar={path}
          search
          showFirst
          showPrevious
          showNext
          showLast
        />
      )

      expect(component.state('page')).toEqual(1)
      expect(component.state('search')).toBeFalsy()

      nock('http://localhost')
        .get(path)
        .query({ page: 2, page_size: 25, search: 'bla' })
        .reply(200, {
          count: 100,
          results: global.range(0, 25)
        })
      component.setState({
        isLoading: false,
        isRefreshing: false,
        error: null,
        list: {
          count: 100,
          results: global.range(0, 100)
        },
        search: 'bla',
        page: 2
      })

      component.update()
      expect(component.state('page')).toEqual(2)
      expect(component.state('search')).toEqual('bla')
      expect(component.find(PaginationBar).exists()).toBeTruthy()
      expect(component.find(PaginationBar).text()).toContain(path) // title bar

      return component
    }

    beforeEach(() => {
      nock.cleanAll()
    })

    afterEach(() => {
      nock.isDone()
      nock.cleanAll()
    })

    it('Search actions should change the current page to 1', () => {
      const component = buildPaginationComponent('/paginate-actions-search')
      const paginationBar = component.find(PaginationBar)

      const input = paginationBar.find('[data-qa="data-pagination-search"]').find('input')
      expect(input.exists()).toBeTruthy()

      nock('http://localhost')
        .get('/paginate-actions-search')
        .query({ page: 1, page_size: 25, search: 'something' })
        .reply(200, {
          count: 100,
          results: global.range(0, 25)
        })

      input.simulate('change', { target: { name: 'search', value: 'something' } })
      input.simulate('keyup', { key: 'Enter' })

      expect(component.state('page')).toEqual(1)
      expect(component.state('search')).toEqual('something')
    })

    it('Set new page size should change the current page to 1, but not search', () => {
      const component = buildPaginationComponent('/paginate-actions-set-page-size')
      const paginationBar = component.find(PaginationBar)

      const select = paginationBar.find('[data-qa="data-pagination-sizes"]').find('select')
      expect(select.exists()).toBeTruthy()

      nock('http://localhost')
        .get('/paginate-actions-set-page-size')
        .query({ page: 1, page_size: 10, search: 'bla' })
        .reply(200, {
          count: 100,
          results: global.range(0, 10)
        })

      select.simulate('change', { target: { value: '10' } })

      expect(component.state('page')).toEqual(1)
      expect(component.state('pageSize')).toEqual(10)
      expect(component.state('search')).toEqual('bla')
    })

    it('Navigation buttons should change the current page, but not search', () => {
      const component = buildPaginationComponent('/paginate-actions-buttons')
      const paginationBar = component.find(PaginationBar)
      const nextButton = paginationBar.find('[data-qa="data-pagination-next"]').find('button')
      expect(nextButton.exists()).toBeTruthy()

      nock('http://localhost')
        .get('/paginate-actions-buttons')
        .query({ page: 3, page_size: 25, search: 'bla' })
        .reply(200, {
          count: 100,
          results: global.range(0, 25)
        })
      nextButton.simulate('click')

      expect(component.state('page')).toEqual(3)
      expect(component.state('search')).toEqual('bla')
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
        <PaginationContainer
          listComponent={Foo}
          url='/unmounted'
          sizes={[25]}
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
  })
})
