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
import { deleteData, postData, putData } from '../utils/request'
import {
  getMediaFileAPIPath,
  getSurveysAPIPath,
  getSurveysPath,
  getXFormsAPIPath
} from '../utils/paths'
import { ODK_ACTIVE } from '../utils/env'
import { ODK_APP } from '../utils/constants'

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
      actionsInProgress: [],
      project: props.project
    }

    if (ODK_ACTIVE) {
      this.state.odk = {...clone(props.odkSurvey || {})}
    }
  }

  render () {
    const survey = this.state
    const {errors, isUpdating} = survey
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
            ODK_ACTIVE &&
            <SurveyODKForm
              survey={this.state.odk}
              surveyors={this.props.surveyors}
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
    const {errors} = survey

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
    const {formatMessage} = this.props.intl

    return (
      <div className='actions'>
        { (this.props.survey && this.props.survey.id) &&
          <div>
            <ConfirmButton
              className='btn btn-delete'
              cancelable
              onConfirm={this.onDelete.bind(this)}
              title={this.renderTitle()}
              message={formatMessage(MESSAGES.deleteConfirm, {...this.props.survey})}
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
    const {actionsInProgress} = this.state
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
    if (this.props.survey) {
      // navigate to Survey view page
      window.location.pathname = getSurveysPath({action: 'view', id: this.props.survey.id})
    } else {
      // navigate to Surveys list page
      window.location.pathname = getSurveysPath({action: 'list'})
    }
  }

  onSubmit (event) {
    event.preventDefault()
    this.setState({ errors: {} })

    const {formatMessage} = this.props.intl
    const survey = {
      definition: {},
      id: this.state.id,
      name: this.state.name,
      project: this.props.project.id,
      // FIXME: "revision" field refers to Aether mapping revisions.
      // This should be auto-incremented every time the Survey/Mapping
      // edited.
      // See: https://jira.ehealthafrica.org/browse/AET-124
      revision: '1'
    }

    const saveMethod = (survey.id ? putData : postData)
    const url = getSurveysAPIPath({id: survey.id})

    this.setState({
      isUpdating: true,
      actionsInProgress: [
        formatMessage(MESSAGES.saveKernelSurvey, {name: survey.name})
      ]
    })
    return saveMethod(url, survey)
      .then(response => {
        if (ODK_ACTIVE) {
          this.setState({
            id: response.id, // update state with new id
            actionsInProgress: [
              ...this.state.actionsInProgress,
              formatMessage(MESSAGES.handleDone),
              formatMessage(MESSAGES.saveODKSurvey, {name: survey.name})
            ]
          })

          return this.onSubmitODK(response)
        } else {
          this.backToView(response)
        }
      })
      .catch(this.handleError.bind(this))
  }

  onDelete () {
    const {formatMessage} = this.props.intl
    const {survey} = this.props
    const handleError = (error) => { this.handleError(error, 'delete') }

    this.setState({
      isUpdating: true,
      actionsInProgress: [
        formatMessage(MESSAGES.deleteKernelSurvey, {name: survey.name})
      ]
    })

    return deleteData(getSurveysAPIPath({id: survey.id}))
      .then(() => {
        if (ODK_ACTIVE) {
          // remove it also in ODK
          this.setState({ actionsInProgress: [
            ...this.state.actionsInProgress,
            formatMessage(MESSAGES.handleDone),
            formatMessage(MESSAGES.deleteODKSurvey, {name: survey.name})
          ] })

          return this.onDeleteODK()
        } else {
          this.backToList()
        }
      })
      .catch(handleError)
  }

  onSubmitODK (kernelSurvey) {
    const survey = this.state.odk

    // save changes in ODK
    const saveMethod = (survey.mapping_id ? putData : postData)
    const saveUrl = getSurveysAPIPath({app: ODK_APP, id: survey.mapping_id})

    const odkSurvey = {
      mapping_id: kernelSurvey.id,
      name: kernelSurvey.name,
      surveyors: this.state.odk.surveyors
    }

    return saveMethod(saveUrl, odkSurvey)
      .then(this.onSubmitODKXForms.bind(this))
      .catch(this.handleODKError.bind(this))
  }

  onSubmitODKXForms (odkSurvey) {
    const {formatMessage} = this.props.intl
    this.setState({ odk: { ...this.state.odk, id: odkSurvey.mapping_id } }) // update state with new id

    // creates/updates/deletes the xforms+media files sequentially
    const actions = [] // list of actions to execute

    const formerXForms = (this.props.odkSurvey && this.props.odkSurvey.xforms) || []
    const currentXForms = this.state.odk.xforms || []

    // handle current xforms
    currentXForms.forEach(xform => {
      actions.push({
        message: formatMessage(MESSAGES.saveODKXForm, {name: xform.title}),
        method: xform.id ? putData : postData,
        url: getXFormsAPIPath({ id: xform.id }),
        data: {
          ...xform,
          xml_file: xform.file,
          mapping: odkSurvey.mapping_id
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
            message: formatMessage(MESSAGES.saveODKMediaFile, {name: mf.name}),
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
            message: formatMessage(MESSAGES.deleteODKMediaFile, {name: mf.name}),
            method: deleteData,
            url: getMediaFileAPIPath({ id: mf.id })
          })
        })
    })

    // get the list of deleted xforms (they are not in the current list)
    const deletedXforms = formerXForms.filter(former => !currentXForms.find(current => current.id === former.id))

    // delete them
    deletedXforms.forEach(xform => {
      actions.push({
        message: formatMessage(MESSAGES.deleteODKXForm, {name: xform.title}),
        method: deleteData,
        url: getXFormsAPIPath({ id: xform.id })
      })
    })

    if (actions.length === 0) {
      this.backToView(odkSurvey)
      return
    }

    return Promise.all(actions.map(action => {
      this.setState({ actionsInProgress: [
        ...this.state.actionsInProgress,
        formatMessage(MESSAGES.handleDone),
        action.message
      ] })

      return action.method(action.url, action.data, action.options)
    }))
      .then(() => { this.backToView(odkSurvey) })
      .catch(this.handleODKError.bind(this))
  }

  onDeleteODK () {
    return deleteData(getSurveysAPIPath({app: ODK_APP, id: this.props.survey.id}))
      .then(this.backToList)
      .catch(this.backToList) // ignore ODK errors???
  }

  handleODKError (error) {
    return this.handleError(error, 'submit', 'odk')
  }

  handleError (error, action, nestedProperty) {
    /**
     * Handles the given error during the execution of the specific action.
     * The error response object is assigned to `errors` or to some of its
     * nested objects (defined by `nestedProperty`)
     */
    const {formatMessage} = this.props.intl

    this.setState({ isUpdating: false, actionsInProgress: [] })

    if (!error.message) {
      console.log(error)
      if (nestedProperty) {
        this.setState({ errors: { [nestedProperty]: error } })
      } else {
        this.setState({ errors: error })
      }
      return
    }

    if (error.content) {
      if (nestedProperty) {
        this.setState({ errors: { [nestedProperty]: error.content } })
      } else {
        this.setState({ errors: error.content })
      }
    } else {
      const actionMessage = (action === 'delete')
        ? MESSAGES.deleteError
        : MESSAGES.submitError
      const generic = [formatMessage(actionMessage, {...this.state})]

      if (nestedProperty) {
        this.setState({ errors: { [nestedProperty]: { generic } } })
      } else {
        this.setState({ errors: { generic } })
      }
    }
  }

  backToView (survey) {
    // navigate to Survey view page
    window.location.pathname = getSurveysPath({action: 'view', id: (survey.id || survey.mapping_id)})
  }

  backToList () {
    // navigate to Surveys list page
    window.location.pathname = getSurveysPath({action: 'list'})
  }
}

// Include this to enable `this.props.intl` for this component.
export default injectIntl(SurveyForm)
