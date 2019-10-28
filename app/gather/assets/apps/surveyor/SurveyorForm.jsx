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

import { clone } from '../utils'
import { deleteData, postData, putData } from '../utils/request'
import { getSurveyorsPath, getSurveyorsAPIPath } from '../utils/paths'

import { ConfirmButton, ErrorAlert, WarningAlert, MultiSelect } from '../components'

const MESSAGES = defineMessages({
  deleteButton: {
    defaultMessage: 'Delete surveyor',
    id: 'surveyor.form.action.delete'
  },
  deleteConfirm: {
    defaultMessage: 'Are you sure you want to delete the surveyor?',
    id: 'surveyor.form.action.delete.confirm'
  },
  deleteError: {
    defaultMessage: 'An error occurred while deleting “{username}”.',
    id: 'surveyor.form.action.delete.error'
  },
  submitError: {
    defaultMessage: 'An error occurred while saving “{username}”.',
    id: 'surveyor.form.action.submit.error'
  },

  passwordLengthWarning: {
    defaultMessage: '- must contain at least 10 characters.',
    id: 'surveyor.form.password.warning.length'
  },
  passwordSimilarWarning: {
    defaultMessage: '- can\'t be too similar to your other personal information.',
    id: 'surveyor.form.password.warning.similar'
  },
  passwordCommonWarning: {
    defaultMessage: '- can\'t be a commonly used password.',
    id: 'surveyor.form.password.warning.common'
  },
  passwordNumericWarning: {
    defaultMessage: '- can\'t be entirely numeric.',
    id: 'surveyor.form.password.warning.numeric'
  },

  passwordRepeatedError: {
    defaultMessage: 'The two password fields didn\'t match.',
    id: 'surveyor.form.password.error.repeated'
  },
  passwordShortError: {
    defaultMessage: 'This password is too short. It must contain at least 10 characters.',
    id: 'surveyor.form.password.error.length'
  }
})

class SurveyorForm extends Component {
  constructor (props) {
    super(props)

    const { surveyor, surveys: { results } } = props

    this.state = {
      surveyor: surveyor ? clone(surveyor) : {},
      assignedSurveys: surveyor ? surveyor.projects : [],
      availableSurveys: results.map(({ project_id: id, name }) => ({ id, name })),
      errors: {},
      showPasswordFields: false
    }
  }

  render () {
    const { surveyor, intl: { formatMessage } } = this.props
    const { surveyor: { id, username }, errors } = this.state
    const isNew = (id === undefined)

    const title = (isNew
      ? (
        <FormattedMessage
          id='surveyor.form.title.add'
          defaultMessage='New surveyor'
        />
      )
      : (
        <span>
          <FormattedMessage
            id='surveyor.form.title.edit'
            defaultMessage='Edit surveyor'
          />
          <span className='username ml-2'>
            <i className='fas fa-user mr-1' />
            {surveyor.username}
          </span>
        </span>
      )
    )
    const dataQA = (isNew
      ? 'surveyor-add'
      : `surveyor-edit-${id}`
    )

    return (
      <div data-qa={dataQA} className='surveyor-edit'>
        <h3 className='page-title'>{title}</h3>

        <ErrorAlert errors={errors.generic} />

        <form onSubmit={this.onSubmit.bind(this)}>
          <div className={`form-group big-input ${errors.username ? 'error' : ''}`}>
            <label className='form-control-label title'>
              <FormattedMessage
                id='surveyor.form.username'
                defaultMessage='Surveyor username'
              />
            </label>
            <input
              name='username'
              type='text'
              className='form-control'
              required
              value={username || ''}
              onChange={this.onInputChange.bind(this)}
            />
            <ErrorAlert errors={errors.username} />
          </div>

          {this.renderPassword(isNew)}
          {this.renderSurveys()}

          <div className='actions'>
            <div>
              {
                !isNew &&
                  <ConfirmButton
                    className='btn btn-delete'
                    cancelable
                    onConfirm={this.onDelete.bind(this)}
                    title={
                      <span className='username'>
                        <i className='fas fa-user mr-1' />
                        {surveyor.username}
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
                onClick={this.onCancel.bind(this)}
              >
                <FormattedMessage
                  id='surveyor.form.action.cancel'
                  defaultMessage='Cancel'
                />
              </button>
            </div>
            <div>
              <button type='submit' className='btn btn-primary btn-block'>
                <FormattedMessage
                  id='surveyor.form.action.submit'
                  defaultMessage='Save surveyor'
                />
              </button>
            </div>
          </div>
        </form>
      </div>
    )
  }

  renderPassword (isNew) {
    const { intl: { formatMessage } } = this.props
    const {
      surveyor: { password, confirmPassword },
      errors,
      showPasswordFields
    } = this.state

    const show = () => {
      this.setState({ showPasswordFields: true })
    }

    if (!isNew && !showPasswordFields) {
      return (
        <div className='password-reset'>
          <a href='#!' onClick={show}>Reset Password</a>
        </div>
      )
    }

    return (
      <>
        <div className={`form-group big-input ${errors.password ? 'error' : ''}`}>
          <label className='form-control-label title'>
            <FormattedMessage
              id='surveyor.form.password'
              defaultMessage='Password'
            />
          </label>
          <input
            name='password'
            type='password'
            className='form-control'
            required={isNew}
            value={password || ''}
            onChange={this.onInputChange.bind(this)}
          />
          <ErrorAlert errors={errors.password} />

          <WarningAlert
            warnings={[
              formatMessage(MESSAGES.passwordLengthWarning),
              formatMessage(MESSAGES.passwordSimilarWarning),
              formatMessage(MESSAGES.passwordCommonWarning),
              formatMessage(MESSAGES.passwordNumericWarning)
            ]}
          />
        </div>

        <div className='form-group big-input'>
          <label className='form-control-label title'>
            <FormattedMessage
              id='surveyor.form.password.repeat'
              defaultMessage='Repeat password'
            />
          </label>
          <input
            name='confirmPassword'
            type='password'
            className='form-control'
            required={isNew || password}
            value={confirmPassword || ''}
            onChange={this.onInputChange.bind(this)}
          />
        </div>
      </>
    )
  }

  renderSurveys () {
    const { assignedSurveys, availableSurveys } = this.state
    const selectedSurveys = availableSurveys.filter(survey => assignedSurveys.indexOf(survey.id) > -1)

    const onChange = (surveys) => {
      this.setState({ assignedSurveys: surveys.map(survey => survey.id) })
    }

    return (
      <div className='form-group'>
        <label className='form-control-label title'>
          <FormattedMessage
            id='surveyorForm.surveyor.surveys'
            defaultMessage='Assigned Surveys'
          />
        </label>
        <MultiSelect
          selected={selectedSurveys}
          options={availableSurveys}
          onChange={onChange}
        />
      </div>
    )
  }

  onInputChange (event) {
    event.preventDefault()

    const { name, value } = event.target
    this.setState({ surveyor: { ...this.state.surveyor, [name]: value } })
  }

  validatePassword () {
    const { formatMessage } = this.props.intl
    const { id, password, confirmPassword } = this.state.surveyor

    if (!id || password) {
      // validate password
      if (password !== confirmPassword) {
        this.setState({
          errors: {
            password: [formatMessage(MESSAGES.passwordRepeatedError)]
          }
        })
        return false
      }

      if (password.length < 10) {
        this.setState({
          errors: {
            password: [formatMessage(MESSAGES.passwordShortError)]
          }
        })
        return false
      }
    }

    return true
  }

  onCancel () {
    this.goBack()
  }

  onSubmit (event) {
    event.preventDefault()
    this.setState({ errors: {} })

    if (!this.validatePassword()) return

    const { id, password: oldPassword } = this.props.surveyor || {}
    const {
      surveyor: { username, password },
      assignedSurveys
    } = this.state

    const surveyor = {
      username: username,
      password: oldPassword || password,
      projects: assignedSurveys
    }

    const saveMethod = (id ? putData : postData)
    const url = getSurveyorsAPIPath({ id })

    return saveMethod(url, surveyor)
      .then(this.goBack)
      .catch(error => { this.handleError(error, 'submitError') })
  }

  onDelete () {
    const url = getSurveyorsAPIPath({ id: this.props.surveyor.id })
    return deleteData(url)
      .then(this.goBack)
      .catch(error => { this.handleError(error, 'deleteError') })
  }

  handleError (error, action) {
    if (error.content) {
      this.setState({ errors: error.content })
    } else {
      const { formatMessage } = this.props.intl
      const { surveyor } = this.state
      const generic = [formatMessage(MESSAGES[action], { ...surveyor })]

      this.setState({ errors: { generic } })
    }
  }

  goBack () {
    // navigate to Surveyors list page
    window.location.assign(getSurveyorsPath({ action: 'list' }))
  }
}

// Include this to enable `this.props.intl` for this component.
export default injectIntl(SurveyorForm)
