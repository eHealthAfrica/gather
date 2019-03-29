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
import { hot } from 'react-hot-loader/root'

import { PaginationContainer } from '../components'
import { getSyncUsersAPIPath } from '../utils/paths'

import SyncUserForm from './SyncUserForm'
import SyncUsersList from './SyncUsersList'

class SyncUserDispatcher extends Component {
  render () {
    const { action } = this.props

    switch (action) {
      case 'add':
        return <SyncUserForm />

      default:
        return (
          <PaginationContainer
            pageSize={36}
            url={getSyncUsersAPIPath({})}
            position='top'
            listComponent={SyncUsersList}
            search
            showPrevious
            showNext
          />
        )
    }
  }
}

// Include this to enable HMR for this module
export default hot(SyncUserDispatcher)
