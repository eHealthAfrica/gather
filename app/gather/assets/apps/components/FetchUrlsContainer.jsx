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

import React, { Component } from 'react'

import { fetchUrls } from '../utils/request'
import { isMounted } from '../utils/dom'

import EmptyAlert from './EmptyAlert'
import FetchErrorAlert from './FetchErrorAlert'
import LoadingSpinner from './LoadingSpinner'
import RefreshSpinner from './RefreshSpinner'

/**
 * FetchUrlsContainer component.
 *
 * Request data from server and returns back to the provided component.
 *
 * Properties:
 *   `urls`:               The list of urls objects to fetch.
 *                         The expected urls format is:
 *                          [
 *                            {
 *                              name: 'string',
 *                              url: 'https://...'
 *                            },
 *                            ...
 *                          ]
 *
 *   `silent`:             Indicates if the auxiliary hint components
 *                         (loading, error) are hidden.
 *                         The whole fetch process is in silent mode.
 *
 *   `handleResponse`:     Function that transform the response.
 *
 *   `targetComponent`:    The rendered component after a sucessful request.
 *                         It's going to received as properties the trasformed
 *                         response and a function that allows to reload the data.
 *
 */

export default class FetchUrlsContainer extends Component {
  constructor (props) {
    super(props)

    this.state = {
      // default status variables
      isLoading: true
    }
  }

  componentDidMount () {
    this.loadData()
  }

  componentWillUnmount () {
    this.abortFetch()
  }

  abortFetch () {
    this.state.controller && this.state.controller.abort()
  }

  refreshData () {
    this.setState({ isRefreshing: true })
    this.loadData()
  }

  loadData () {
    this.abortFetch()

    const controller = new window.AbortController()
    this.setState({ controller })

    return fetchUrls(this.props.urls, { signal: controller.signal })
      .then(response => {
        const { handleResponse } = this.props
        isMounted(this) && this.setState({
          response: handleResponse ? handleResponse(response) : response,
          isLoading: false,
          isRefreshing: false,
          error: null
        })
      })
      .catch(error => {
        isMounted(this) && this.setState({
          isLoading: false,
          isRefreshing: false,
          error
        })
      })
  }

  render () {
    if (this.state.isLoading) {
      return this.props.silent ? <div /> : <LoadingSpinner />
    }
    if (this.state.error) {
      return this.props.silent ? <div /> : <FetchErrorAlert error={this.state.error} />
    }
    if (!this.state.response) {
      return this.props.silent ? <div /> : <EmptyAlert />
    }

    const TargetComponent = this.props.targetComponent

    return (
      <div data-qa='data-loaded'>
        { !this.props.silent && this.state.isRefreshing && <RefreshSpinner /> }
        <TargetComponent
          {...this.state.response}
          reload={this.refreshData.bind(this)}
        />
      </div>
    )
  }
}
