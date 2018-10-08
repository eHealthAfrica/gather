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

import { clone } from '../utils'
import { deleteData, postData, putData } from '../utils/request'
import { getMobileUsersPath, getMobileUsersAPIPath } from '../utils/paths'

import { ConfirmButton, ErrorAlert } from '../components'

const MESSAGES = defineMessages({
  deleteButton: {
    defaultMessage: 'Delete mobile user',
    id: 'mobile-user.form.action.delete'
  },
  deleteConfirm: {
    defaultMessage: 'Are you sure you want to delete the mobile user?',
    id: 'mobile-user.form.action.delete.confirm'
  },
  deleteError: {
    defaultMessage: 'An error occurred while deleting “{email}”.',
    id: 'mobile-user.form.action.delete.error'
  },
  submitError: {
    defaultMessage: 'An error occurred while saving “{email}”.',
    id: 'mobile-user.form.action.submit.error'
  }
})

class MobileUserForm extends Component {
  constructor (props) {
    super(props)
    this.state = { ...clone(props.mobileUser), errors: {} }
  }

  render () {
    const { formatMessage } = this.props.intl
    const mobileUser = this.state
    const isNew = (mobileUser.id === undefined)

    const title = (isNew
      ? <FormattedMessage
        id='mobile-user.form.title.add'
        defaultMessage='New mobile user' />
      : (
        <span>
          <FormattedMessage
            id='mobile-user.form.title.edit'
            defaultMessage='Edit mobile user' />
          <span className='email ml-2'>
            <i className='fas fa-user mr-1' />
            {this.props.mobileUser.email}
          </span>
        </span>
      )
    )
    const dataQA = (isNew
      ? 'mobile-user-add'
      : `mobile-user-edit-${mobileUser.id}`
    )

    return (
      <div data-qa={dataQA} className='mobile-user-edit'>
        <h3 className='page-title'>{title}</h3>

        <ErrorAlert errors={mobileUser.errors.generic} />

        <form onSubmit={this.onSubmit.bind(this)}>
          <div className={`form-group big-input ${mobileUser.errors.email ? 'error' : ''}`}>
            <label className='form-control-label title'>
              <FormattedMessage
                id='mobile-user.form.email'
                defaultMessage='Mobile user email' />
            </label>
            <input
              name='email'
              type='email'
              className='form-control'
              required
              value={mobileUser.email || ''}
              onChange={this.onInputChange.bind(this)}
            />
            <ErrorAlert errors={mobileUser.errors.email} />
          </div>

          <div className='actions'>
            <div>
              { !isNew &&
                <ConfirmButton
                  className='btn btn-delete'
                  cancelable
                  onConfirm={this.onDelete.bind(this)}
                  title={
                    <span className='email'>
                      <i className='fas fa-user mr-1' />
                      {this.props.mobileUser.email}
                    </span>
                  }
                  message={formatMessage(MESSAGES.deleteConfirm)}
                  buttonLabel={formatMessage(MESSAGES.deleteButton)}
                />
              }
            </div>
            <div>
              <button
                type='button'
                className='btn btn-cancel'
                onClick={this.onCancel.bind(this)}>
                <FormattedMessage
                  id='mobile-user.form.action.cancel'
                  defaultMessage='Cancel' />
              </button>
            </div>
            <div>
              <button type='submit' className='btn btn-primary btn-block'>
                <FormattedMessage
                  id='mobile-user.form.action.submit'
                  defaultMessage='Save mobile user' />
              </button>
            </div>
          </div>
        </form>
      </div>
    )
  }

  onInputChange (event) {
    event.preventDefault()
    this.setState({ [event.target.name]: event.target.value })
  }

  onCancel () {
    this.goBack()
  }

  onSubmit (event) {
    event.preventDefault()
    this.setState({ errors: {} })

    const mobileUser = {
      email: this.state.email
    }

    const saveMethod = (this.state.id ? putData : postData)
    const url = getMobileUsersAPIPath({ id: this.props.mobileUser.id })

    return saveMethod(url, mobileUser)
      .then(this.goBack)
      .catch(error => { this.handleError(error, 'submitError') })
  }

  onDelete () {
    const url = getMobileUsersAPIPath({ id: this.props.mobileUser.id })
    return deleteData(url)
      .then(this.goBack)
      .catch(error => { this.handleError(error, 'deleteError') })
  }

  handleError (error, action) {
    if (error.content) {
      this.setState({ errors: error.content })
    } else {
      const { formatMessage } = this.props.intl
      const mobileUser = this.state
      const generic = [formatMessage(MESSAGES[action], { ...mobileUser })]

      this.setState({ errors: { generic } })
    }
  }

  goBack () {
    // navigate to Mobile Users list page
    window.location.assign(getMobileUsersPath({ action: 'list' }))
  }
}

// Include this to enable `this.props.intl` for this component.
export default injectIntl(MobileUserForm)
