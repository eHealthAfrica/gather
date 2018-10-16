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
import { FormattedMessage } from 'react-intl'

import { getSyncUsersPath } from '../utils/paths'

export default class SyncUsersList extends Component {
  render () {
    const { list } = this.props

    if (list.length === 0) {
      return <div data-qa='sync-users-list-empty' />
    }

    return (
      <div data-qa='sync-users-list' className='sync-users-list'>
        <h4 className='title'>
          <FormattedMessage
            id='sync-user.list.title'
            defaultMessage='Sync Users' />
        </h4>

        <div className='sync-users'>
          {
            list.map((syncUser) => (
              <div key={syncUser.id} className='sync-user-list-item'>
                <div className='sync-user-header'>
                  <i className='fas fa-user mr-2' />
                  { syncUser.email }
                  <a
                    href={getSyncUsersPath({ action: 'edit', id: syncUser.id })}
                    role='button'
                    className='btn btn-sm btn-secondary icon-only float-right'>
                    <i className='fas fa-pencil-alt' />
                  </a>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    )
  }
}
