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

import { FetchUrlsContainer, PaginationContainer } from '../components'
import { getMobileUsersAPIPath } from '../utils/paths'

import MobileUserForm from './MobileUserForm'
import MobileUsersList from './MobileUsersList'

export default class MobileUserDispatcher extends Component {
  render () {
    const { action, mobileUserId } = this.props

    switch (action) {
      case 'add':
        return <MobileUserForm mobileUser={{}} />

      case 'edit':
        const editUrls = [
          {
            name: 'mobileUser',
            url: getMobileUsersAPIPath({ id: mobileUserId })
          }
        ]

        return <FetchUrlsContainer urls={editUrls} targetComponent={MobileUserForm} />

      default:
        return (
          <PaginationContainer
            pageSize={36}
            url={getMobileUsersAPIPath({})}
            position='top'
            listComponent={MobileUsersList}
            search
            showPrevious
            showNext
          />
        )
    }
  }
}
