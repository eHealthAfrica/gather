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

import { clone, deepEqual } from '../utils'
import { deleteData, postData, putData, patchData } from '../utils/request'
import {
  getMediaFileAPIPath,
  getSurveysAPIPath,
  getSurveysPath,
  getXFormsAPIPath
} from '../utils/paths'

import { ODK_APP, GATHER_APP } from '../utils/constants'

import { ConfirmButton, ErrorAlert, Portal } from '../components'
import SurveyODKForm from './SurveyODKForm'

const MESSAGES = defineMessages({
  cancelButton: {
    defaultMessage: 'Cancel',
    id: 'survey.form.action.cancel'
  },
  cancelConfirm: {
    defaultMessage: 'Are you sure you want to cancel your changes?',
    id: 'survey.form.action.cancel.confirm'
  },

  deleteButton: {
    defaultMessage: 'Delete survey',
    id: 'survey.form.action.delete'
  },
  deleteConfirm: {
    defaultMessage: 'Are you sure you want to delete the survey “{name}”?',
    id: 'survey.form.action.delete.confirm'
  },
  deleteError: {
    defaultMessage: 'An error occurred while deleting the survey “{name}”',
    id: 'survey.form.action.delete.error'
  },
  submitError: {
    defaultMessage: 'An error occurred while saving the survey “{name}”',
    id: 'survey.form.action.submit.error'
  },

  saveKernelSurvey: {
    defaultMessage: 'Saving survey “{name}”',
    id: 'survey.form.action.save.kernel.survey'
  },
  saveODKSurvey: {
    defaultMessage: 'Saving survey “{name}” in ODK',
    id: 'survey.form.action.save.odk.survey'
  },
  propagateODKSurvey: {
    defaultMessage: 'Generating artefacts for survey “{name}”',
    id: 'survey.form.action.propagate.odk.survey'
  },
  saveODKXForm: {
    defaultMessage: 'Saving xform “{name}” in ODK',
    id: 'survey.form.action.save.odk.xform'
  },
  saveODKMediaFile: {
    defaultMessage: 'Saving media file “{name}” in ODK',
    id: 'survey.form.action.save.odk.media.file'
  },

  deleteKernelSurvey: {
    defaultMessage: 'Deleting survey “{name}”',
    id: 'survey.form.action.delete.kernel.survey'
  },
  deleteODKSurvey: {
    defaultMessage: 'Deleting survey “{name}” in ODK',
    id: 'survey.form.action.delete.odk.survey'
  },
  deleteODKXForm: {
    defaultMessage: 'Deleting xform “{name}” in ODK',
    id: 'survey.form.action.delete.odk.xform'
  },
  deleteODKMediaFile: {
    defaultMessage: 'Deleting media file “{name}” in ODK',
    id: 'survey.form.action.delete.odk.media.file'
  },

  handleDone: {
    defaultMessage: 'Done!',
    id: 'survey.form.action.handle.done'
  },

  errorWhile: {
    defaultMessage: 'An error occurred while: {action}',
    id: 'survey.form.action.handle.error'
  }
})

class SurveyForm extends Component {
  constructor (props) {
    super(props)

    const survey = clone(props.survey || {})
    this.state = {
      ...survey,
      errors: {},
      isUpdating: false,
      actionsInProgress: []
    }

    if (props.settings.ODK_ACTIVE) {
      this.state.odk = { ...clone(props.odkSurvey || {}) }
    }
  }

  render () {
    const survey = this.state
    const { errors, isUpdating } = survey
    const dataQA = (survey.id === undefined
      ? 'survey-add'
      : `survey-edit-${survey.id}`
    )

    return (
      <div data-qa={dataQA} className='survey-edit'>
        <h3 className='page-title'>{ this.renderTitle() }</h3>

        <ErrorAlert errors={errors.generic} />
        { isUpdating && this.renderUpdating() }

        <form onSubmit={this.onSubmit.bind(this)} encType='multipart/form-data'>
          { this.renderName() }
          {
            this.props.settings.ODK_ACTIVE &&
            <SurveyODKForm
              survey={this.state.odk}
              surveyors={this.props.surveyors}
              settings={this.props.settings}
              onChange={(odk) => this.setState({ odk })}
              errors={errors.odk}
            />
          }
          { this.renderButtons() }
        </form>
      </div>
    )
  }

  renderTitle () {
    const survey = this.state
    if (survey.id === undefined) {
      return (
        <FormattedMessage
          id='survey.form.title.add'
          defaultMessage='New survey' />
      )
    } else {
      return (
        <span>
          <FormattedMessage
            id='survey.form.title.edit'
            defaultMessage='Edit survey' />
          <span className='survey-name ml-1'>{survey.name}</span>
        </span>
      )
    }
  }

  renderName () {
    const survey = this.state
    const { errors } = survey

    return (
      <div className={`form-group big-input ${errors.name ? 'error' : ''}`}>
        <label className='form-control-label title'>
          <FormattedMessage
            id='survey.form.name'
            defaultMessage='Name' />
        </label>
        <input
          name='name'
          type='text'
          className='form-control'
          required
          value={survey.name || ''}
          onChange={this.onInputChange.bind(this)}
        />
        <ErrorAlert errors={errors.name} />
      </div>
    )
  }

  renderButtons () {
    const { formatMessage } = this.props.intl

    return (
      <div className='actions'>
        { this.state.id &&
          <div>
            <ConfirmButton
              className='btn btn-delete'
              cancelable
              onConfirm={this.onDelete.bind(this)}
              title={this.renderTitle()}
              message={formatMessage(MESSAGES.deleteConfirm, { name: this.state.name })}
              buttonLabel={formatMessage(MESSAGES.deleteButton)}
            />
          </div>
        }
        <div>
          <ConfirmButton
            className='btn btn-cancel btn-block'
            cancelable
            condition={this.onCancelCondition.bind(this)}
            onConfirm={this.onCancel.bind(this)}
            title={this.renderTitle()}
            message={formatMessage(MESSAGES.cancelConfirm)}
            buttonLabel={formatMessage(MESSAGES.cancelButton)}
          />
        </div>
        <div>
          <button type='submit' className='btn btn-primary btn-block'>
            <FormattedMessage
              id='survey.form.action.submit'
              defaultMessage='Save survey' />
          </button>
        </div>
      </div>
    )
  }

  renderUpdating () {
    const { actionsInProgress } = this.state
    return (
      <Portal>
        <div className='modal show'>
          <div className='modal-dialog modal-md'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>{this.renderTitle()}</h5>
              </div>

              <div className='modal-body'>
                <i className='fas fa-spin fa-cog mr-2' />
                <FormattedMessage
                  id='survey.form.action.updating'
                  defaultMessage='Saving data in progress…' />
                <div className='mt-2'>
                  <ul>
                    {
                      actionsInProgress.length > 0 &&
                      actionsInProgress.map((msg, index) => <li key={index}>{msg}</li>)
                    }
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    )
  }

  onInputChange (event) {
    event.preventDefault()
    this.setState({ [event.target.name]: event.target.value })
  }

  onCancelCondition () {
    // Check if any changes have been made to the survey
    const initialSurvey = clone(this.props.survey || { name: '' })
    const survey = {
      ...initialSurvey,
      name: this.state.name
    }
    return !deepEqual(initialSurvey, survey, true)
  }

  onCancel () {
    if (this.state.id) {
      this.backToView()
    } else {
      this.backToList()
    }
  }

  onDelete () {
    const { formatMessage } = this.props.intl
    const survey = this.state

    const afterDelete = () => {
      this.setState({
        actionsInProgress: [
          ...this.state.actionsInProgress,
          formatMessage(MESSAGES.handleDone)
        ]
      })

      this.backToList()
    }

    const afterGatherDelete = () => {
      if (!this.props.settings.ODK_ACTIVE) {
        return afterDelete()
      }

      this.setState({
        actionsInProgress: [
          ...this.state.actionsInProgress,
          formatMessage(MESSAGES.handleDone),
          formatMessage(MESSAGES.deleteODKSurvey, { name: survey.name })
        ]
      })

      // delete ODK survey and continue
      deleteData(getSurveysAPIPath({ app: ODK_APP, id: survey.id }))
        .then(afterDelete)
        // ignore ODK errors (it might not exist)
        .catch(afterDelete)
    }

    this.setState({
      errors: {},
      isUpdating: true,
      actionsInProgress: [
        formatMessage(MESSAGES.deleteKernelSurvey, { name: survey.name })
      ]
    })

    // delete Kernel survey and continue
    deleteData(getSurveysAPIPath({ id: survey.id }))
      .then(() => {
        // delete also Gather survey and continue
        deleteData(getSurveysAPIPath({ app: GATHER_APP, id: survey.id }))
          .then(afterGatherDelete)
          // ignore Gather errors (it might not exist)
          .catch(afterGatherDelete)
      })
      .catch(error => { this.handleError(error, 'delete') })
  }

  onSubmit (event) {
    event.preventDefault()

    const { formatMessage } = this.props.intl
    const survey = {
      id: this.state.id,
      name: this.state.name
    }

    const saveMethod = (survey.id ? putData : postData)
    const url = getSurveysAPIPath({ id: survey.id })

    this.setState({
      errors: {},
      isUpdating: true,
      actionsInProgress: [
        formatMessage(MESSAGES.saveKernelSurvey, { name: survey.name })
      ]
    })

    saveMethod(url, survey)
      .then(response => {
        this.setState({
          // update state with new values
          ...response,
          actionsInProgress: [
            ...this.state.actionsInProgress,
            formatMessage(MESSAGES.handleDone)
          ]
        }, () => {
          if (!this.props.settings.ODK_ACTIVE) {
            return this.backToView()
          }

          if (!this.props.survey) {
            // replace history in address bar in case of adding with the new id
            // https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_replaceState()_method
            const newUrl = getSurveysPath({ action: 'edit', id: response.id })
            window.history.replaceState(null, '', newUrl)
          }

          this.onSubmitODK()
        })
      })
      .catch(this.handleError.bind(this))
  }

  onSubmitODK () {
    const { formatMessage } = this.props.intl
    const survey = this.state.odk

    // save changes in ODK
    const saveMethod = (survey.project_id ? putData : postData)
    const saveUrl = getSurveysAPIPath({ app: ODK_APP, id: survey.project_id })

    const odkSurvey = {
      project_id: this.state.id,
      name: this.state.name,
      surveyors: this.state.odk.surveyors
    }

    this.setState({
      actionsInProgress: [
        ...this.state.actionsInProgress,
        formatMessage(MESSAGES.saveODKSurvey, { name: odkSurvey.name })
      ]
    })

    saveMethod(saveUrl, odkSurvey)
      .then(response => {
        this.setState({
          odk: {
            ...this.state.odk,
            // update state with new values
            project_id: response.project_id,
            name: response.name,
            surveyors: response.surveyors
          },
          actionsInProgress: [
            ...this.state.actionsInProgress,
            formatMessage(MESSAGES.handleDone)
          ]
        }, () => {
          // continue with xforms and artefacts
          this.onSubmitODKXForms()
        })
      })
      .catch(error => {
        this.setState({ isUpdating: false, actionsInProgress: [] })

        if (error.content) {
          this.setState({ errors: { odk: error.content } })
        } else {
          const generic = [formatMessage(MESSAGES.submitError, { name: odkSurvey.name })]
          this.setState({ errors: { odk: { generic } } })
        }
      })
  }

  onSubmitODKXForms () {
    const { formatMessage } = this.props.intl

    // creates/updates/deletes the xforms+media files sequentially
    const actions = [] // list of actions to execute

    const formerXForms = (this.props.odkSurvey && this.props.odkSurvey.xforms) || []
    const currentXForms = this.state.odk.xforms || []

    // handle current xforms
    currentXForms.forEach(xform => {
      actions.push({
        key: xform.key,
        message: formatMessage(MESSAGES.saveODKXForm, { name: xform.title }),
        method: xform.id ? putData : postData,
        url: getXFormsAPIPath({ id: xform.id }),
        data: {
          ...xform,
          xml_file: xform.file,
          project: this.state.id
        },
        options: { multipart: !!xform.file }
      })

      if (!xform.id) {
        // new one, nothing else to do
        return
      }

      const mediaFiles = xform.media_files || []

      // create new media files
      mediaFiles
        .filter(mf => mf.file)
        .forEach(mf => {
          actions.push({
            key: xform.key,
            message: formatMessage(MESSAGES.saveODKMediaFile, { name: mf.name }),
            method: postData,
            url: getMediaFileAPIPath({}),
            data: {
              name: mf.name,
              media_file: mf.file,
              xform: xform.id
            },
            options: { multipart: true }
          })
        })

      // get the list of deleted media files (they are not in the current list)
      const formerXForm = formerXForms.find(former => xform.id === former.id)
      const deletedMediaFiles = (formerXForm.media_files || [])
        .filter(former => !mediaFiles.find(current => current.id === former.id))

      // delete missing media files
      deletedMediaFiles
        .forEach(mf => {
          actions.push({
            key: xform.key,
            message: formatMessage(MESSAGES.deleteODKMediaFile, { name: mf.name }),
            method: deleteData,
            url: getMediaFileAPIPath({ id: mf.id })
          })
        })
    })

    // get the list of deleted xforms (they are not in the current list)
    const deletedXforms = formerXForms
      .filter(former => !currentXForms.find(current => current.id === former.id))

    // delete them
    deletedXforms.forEach(xform => {
      actions.push({
        key: xform.key,
        message: formatMessage(MESSAGES.deleteODKXForm, { name: xform.title }),
        method: deleteData,
        url: getXFormsAPIPath({ id: xform.id })
      })
    })

    // The last action is to propagate ODK Project artefacts to Kernel
    actions.push({
      message: formatMessage(MESSAGES.propagateODKSurvey, { name: this.state.name }),
      method: patchData,
      url: getSurveysAPIPath({ app: ODK_APP, id: this.state.id, action: 'propagate' })
    })

    const executeActions = () => {
      if (!actions.length) {
        return this.backToView()
      }

      // execute next action
      const action = actions.shift()
      this.setState({ actionsInProgress: [
        ...this.state.actionsInProgress,
        action.message
      ] })
      action.method(action.url, action.data, action.options)
        .then(response => {
          this.setState({
            actionsInProgress: [
              ...this.state.actionsInProgress,
              formatMessage(MESSAGES.handleDone)
            ]
          })

          // recursive call
          executeActions()
        })
        .catch(error => {
          this.setState({ isUpdating: false, actionsInProgress: [] })
          const generic = [formatMessage(MESSAGES.errorWhile, { action: action.message })]
          const content = error.content || { generic: [error.message] }

          if (action.key) {
            this.setState({ errors: { odk: { generic, [action.key]: { ...content } } } })
          } else {
            // this is the propagation error
            this.setState({ errors: { generic, odk: content } })
          }
        })
    }
    executeActions()
  }

  handleError (error, action) {
    const { formatMessage } = this.props.intl
    this.setState({ isUpdating: false, actionsInProgress: [] })

    if (error.content) {
      this.setState({ errors: error.content })
    } else {
      const actionMessage = (action === 'delete')
        ? MESSAGES.deleteError
        : MESSAGES.submitError
      const generic = [formatMessage(actionMessage, { ...this.state })]
      this.setState({ errors: { generic } })
    }
  }

  backToView () {
    // navigate to Survey view page
    window.location.assign(getSurveysPath({ action: 'view', id: this.state.id }))
  }

  backToList () {
    // navigate to Surveys list page
    window.location.assign(getSurveysPath({ action: 'list' }))
  }
}

// Include this to enable `this.props.intl` for this component.
export default injectIntl(SurveyForm)
