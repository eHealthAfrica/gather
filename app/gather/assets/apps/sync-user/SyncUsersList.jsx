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

import React, { Component } from 'react'
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl'

import { getSyncUsersPath, getSyncUsersAPIPath } from '../utils/paths'
import { deleteData } from '../utils/request'

import { ConfirmButton, ErrorAlert } from '../components'

const MESSAGES = defineMessages({
  deleteButton: {
    defaultMessage: 'Delete sync user',
    id: 'sync-user.form.action.delete'
  },
  deleteConfirm: {
    defaultMessage: 'Are you sure you want to delete the sync user?',
    id: 'sync-user.form.action.delete.confirm'
  },
  deleteError: {
    defaultMessage: 'An error occurred while deleting “{email}”.',
    id: 'sync-user.form.action.delete.error'
  }
})

class SyncUsersList extends Component {
  constructor (props) {
    super(props)
    this.state = { errors: {} }
  }

  render () {
    const { formatMessage } = this.props.intl
    const { list } = this.props

    if (list.length === 0) {
      return <div data-qa='sync-users-list-empty' />
    }

    const onDelete = (syncUser) => {
      const url = getSyncUsersAPIPath({ id: syncUser.id })
      return deleteData(url)
        .then(() => {
          window.location.assign(getSyncUsersPath({ action: 'list' }))
        })
        .catch(error => {
          if (error.content) {
            this.setState({ errors: error.content })
          } else {
            const { formatMessage } = this.props.intl
            const syncUser = this.state
            const errors = [formatMessage(MESSAGES.deleteError, { ...syncUser })]
            this.setState({ errors })
          }
        })
    }

    return (
      <div data-qa='sync-users-list' className='sync-users-list'>
        <h4 className='title'>
          <FormattedMessage
            id='sync-user.list.title'
            defaultMessage='Sync Users'
          />
        </h4>

        <ErrorAlert errors={this.state.errors} />

        <div className='sync-users'>
          {
            list.map((syncUser) => (
              <div key={syncUser.id} className='sync-user-list-item'>
                <div className='sync-user-header'>
                  <i className='fas fa-user mr-2' />
                  {syncUser.email}

                  <ConfirmButton
                    className='btn btn-danger icon-only float-right'
                    cancelable
                    onConfirm={() => { onDelete(syncUser) }}
                    title={
                      <span className='email'>
                        <i className='fas fa-user mr-1' />
                        {syncUser.email}
                      </span>
                    }
                    message={formatMessage(MESSAGES.deleteConfirm)}
                    buttonLabel={<i className='fas fa-times' />}
                  />
                </div>
              </div>
            ))
          }
        </div>
      </div>
    )
  }
}

// Include this to enable `this.props.intl` for this component.
export default injectIntl(SyncUsersList)
