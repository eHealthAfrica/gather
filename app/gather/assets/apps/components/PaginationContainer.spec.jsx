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
  LoadingSpinner,
  PaginationBar,
  PaginationContainer,
  RefreshSpinner
} from './index'

class Foo extends React.Component {
  render () {
    return 'foo'
  }
}

describe('PaginationContainer', () => {
  describe('depending on the state', () => {
    const buildStateComponent = (url) => {
      nock('http://localhost')
        .get(url)
        .query({page: 1, page_size: 25})
        .reply(200, {})

      const component = mountWithIntl(
        <PaginationContainer
          listComponent={Foo}
          url={url}
        />
      )

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
      const component = buildStateComponent('/paginate-spinner')

      component.setState({
        isLoading: true,
        isRefreshing: false,
        error: null,
        list: null
      })

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
        isLoading: false,
        isRefreshing: false,
        error: { message: 'something went wrong' },
        list: null
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
        isLoading: false,
        isRefreshing: false,
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
      const component = buildStateComponent('/paginate-not-found')

      nock('http://localhost')
        .get('/paginate-not-found')
        .query({page: 1, page_size: 25, search: 'something'})
        .reply(200, { count: 0, results: [] })

      component.setState({
        isLoading: false,
        isRefreshing: false,
        error: null,
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
        isLoading: false,
        isRefreshing: true,
        error: null,
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
      expect(component.text()).toEqual('foo')
    })

    it('should render the list component', () => {
      const component = buildStateComponent('/paginate-list')

      component.setState({
        isLoading: false,
        isRefreshing: false,
        error: null,
        list: {
          count: 1,
          results: [1]
        }
      })

      expect(component.find(LoadingSpinner).exists()).toBeFalsy()
      expect(component.find(RefreshSpinner).exists()).toBeFalsy()
      expect(component.find(FetchErrorAlert).exists()).toBeFalsy()
      expect(component.find('[data-qa="data-loaded"]').exists()).toBeTruthy()
      expect(component.find(PaginationBar).exists()).toBeTruthy()
      expect(component.find(EmptyAlert).exists()).toBeFalsy()
      expect(component.find(Foo).exists()).toBeTruthy()
      expect(component.text()).toEqual('foo')
    })

    it('should change current page to 1 if pageSize is changed', () => {
      const component = buildStateComponent('/paginate-page-size')

      nock('http://localhost')
        .get('/paginate-page-size')
        .query({page: 14, page_size: 100})
        .reply(200, {
          count: 1500,
          results: global.range(0, 100)
        })

      component.setState({ page: 14, pageSize: 100 })
      expect(component.state('page')).toEqual(14)
      expect(component.state('pageSize')).toEqual(100)

      component.setProps({ pageSize: 100 })
      expect(component.state('page')).toEqual(14)
      expect(component.state('pageSize')).toEqual(100)

      nock('http://localhost')
        .get('/paginate-page-size')
        .query({page: 1, page_size: 10})
        .reply(200, {
          count: 1500,
          results: global.range(0, 10)
        })

      component.setProps({ pageSize: 10 })
      expect(component.state('page')).toEqual(1)
      expect(component.state('pageSize')).toEqual(10)
    })
  })

  describe('depending on fetch response', () => {
    const buildFetchComponent = (url) => {
      nock('http://localhost')
        .get(url)
        .query({page: 1, page_size: 25})
        .reply(200, { count: 0, results: [] })

      const component = mountWithIntl(
        <PaginationContainer
          listComponent={Foo}
          url={url + '?'}
          position='top'
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
      const component = buildFetchComponent('/fetch-warning')

      nock('http://localhost')
        .get('/fetch-warning')
        .query({page: 1, page_size: 25})
        .reply(404)

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
      const component = buildFetchComponent('/fetch-empty')

      nock('http://localhost')
        .get('/fetch-empty')
        .query({page: 1, page_size: 25})
        .reply(200, { count: 0, results: [] })

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
      const component = buildFetchComponent('/fetch-list')

      nock('http://localhost')
        .get('/fetch-list')
        .query({page: 1, page_size: 25})
        .reply(200, { count: 1, results: [1] })

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
      expect(component.text()).toEqual('foo')
    })
  })

  describe('PaginationBar iterations', () => {
    const buildPaginationComponent = (path) => {
      nock('http://localhost')
        .get(path)
        .query({page: 1, page_size: 25})
        .reply(200, {
          count: 100,
          results: global.range(0, 25)
        })

      const component = mountWithIntl(
        <PaginationContainer
          listComponent={Foo}
          url={path}

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
        .query({page: 2, page_size: 25, search: 'bla'})
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
        .query({page: 1, page_size: 25, search: 'something'})
        .reply(200, {
          count: 100,
          results: global.range(0, 25)
        })

      input.simulate('change', {target: {name: 'search', value: 'something'}})
      input.simulate('keypress', {charCode: 13})

      expect(component.state('page')).toEqual(1)
      expect(component.state('search')).toEqual('something')
    })

    it('Navigation buttons should change the current page, but not search', () => {
      const component = buildPaginationComponent('/paginate-actions-buttons')
      const paginationBar = component.find(PaginationBar)
      const nextButton = paginationBar.find('[data-qa="data-pagination-next"]').find('button')
      expect(nextButton.exists()).toBeTruthy()

      nock('http://localhost')
        .get('/paginate-actions-buttons')
        .query({page: 3, page_size: 25, search: 'bla'})
        .reply(200, {
          count: 100,
          results: global.range(0, 25)
        })
      nextButton.simulate('click')

      expect(component.state('page')).toEqual(3)
      expect(component.state('search')).toEqual('bla')
    })
  })
})
