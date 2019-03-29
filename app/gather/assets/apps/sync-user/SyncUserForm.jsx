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
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl'

import { postData } from '../utils/request'
import { getSyncUsersPath, getSyncUsersAPIPath } from '../utils/paths'

import { ErrorAlert } from '../components'

const MESSAGES = defineMessages({
  submitError: {
    defaultMessage: 'An unexpected error occurred while adding the mobile user.',
    id: 'sync-user.form.action.submit.error'
  }
})

class SyncUserForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      email: '',
      errors: {}
    }
  }

  render () {
    const { formatMessage } = this.props.intl
    const { email, errors } = this.state

    const onInputChange = (event) => {
      event.preventDefault()
      this.setState({ [event.target.name]: event.target.value })
    }

    const onSubmit = (event) => {
      event.preventDefault()
      this.setState({ errors: {} })

      postData(getSyncUsersAPIPath({}), { email: this.state.email })
        .then(goBack)
        .catch(error => {
          if (error.content) {
            this.setState({ errors: error.content })
          } else {
            this.setState({
              errors: {
                generic: [formatMessage(MESSAGES.submitError)]
              }
            })
          }
        })
    }

    const goBack = () => {
      // navigate to Sync Users list page
      window.location.assign(getSyncUsersPath({ action: 'list' }))
    }

    return (
      <div data-qa='sync-user-add' className='sync-user-edit'>
        <h3 className='page-title'>
          <FormattedMessage
            id='sync-user.form.title.add'
            defaultMessage='New mobile user'
          />
        </h3>

        <ErrorAlert errors={errors.generic} />

        <form onSubmit={onSubmit}>
          <div className={`form-group big-input ${errors.email ? 'error' : ''}`}>
            <label className='form-control-label title'>
              <FormattedMessage
                id='sync-user.form.email'
                defaultMessage='email' />
            </label>
            <input
              name='email'
              type='email'
              className='form-control'
              required
              value={email || ''}
              onChange={onInputChange}
            />
            <ErrorAlert errors={errors.email} />
          </div>

          <div className='actions'>
            <div>
              <button
                type='button'
                className='btn btn-cancel'
                onClick={goBack}>
                <FormattedMessage
                  id='sync-user.form.action.cancel'
                  defaultMessage='Cancel' />
              </button>
            </div>
            <div>
              <button type='submit' className='btn btn-primary btn-block'>
                <FormattedMessage
                  id='sync-user.form.action.submit'
                  defaultMessage='Add mobile user' />
              </button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}

// Include this to enable `this.props.intl` for this component.
export default injectIntl(SyncUserForm)
