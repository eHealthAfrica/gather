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

import { clone, deepEqual, generateRandomId, goTo } from '../utils'
import { deleteData, postData, putData, patchData } from '../utils/request'
import {
  getMediaFileAPIPath,
  getSurveysAPIPath,
  getSurveysPath,
  getXFormsAPIPath,
  getMediaFileContentPath
} from '../utils/paths'

import { ODK_APP, GATHER_APP } from '../utils/constants'

import {
  ConfirmButton,
  ErrorAlert,
  HelpMessage,
  MultiSelect,
  Portal,
  RelativeTime
} from '../components'

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
  deleteXFormConfirm: {
    defaultMessage: 'Are you sure you want to delete the xForm “{title}”?',
    id: 'survey.odk.form.xform.action.delete.confirm'
  },
  deleteMediafileConfirm: {
    defaultMessage: 'Are you sure you want to delete the media file “{name}”?',
    id: 'survey.odk.form.xform.media.file.action.delete.confirm'
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
  },

  newForm: {
    defaultMessage: 'new',
    id: 'survey.odk.form.xform.new'
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
      const odk = { ...clone(props.odkSurvey || {}) }

      const xforms = (odk.xforms || [])
        .map(xform => ({
          ...xform,
          key: xform.id,
          media_files: (xform.media_files || []).sort((a, b) => a.name > b.name) // order by name
        }))
        // order by title + created_at
        .sort((a, b) => (
          (a.title > b.title) ||
          (a.title === b.title && a.created_at > b.created_at)
        ))

      const availableSurveyors = props.surveyors.results || []
      const surveyors = availableSurveyors
        .filter(surveyor => (odk.surveyors || []).indexOf(surveyor.id) > -1)
        .map(surveyor => surveyor.id)

      this.state.odk = { ...odk, xforms, surveyors }
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
        <h3 className='page-title'>{this.renderTitle()}</h3>

        <ErrorAlert errors={errors.generic} />
        {isUpdating && this.renderUpdating()}

        <form onSubmit={this.onSubmit.bind(this)} encType='multipart/form-data'>
          {this.renderName()}
          {this.renderODK()}
          {this.renderButtons()}
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
          defaultMessage='New survey'
        />
      )
    } else {
      return (
        <span>
          <FormattedMessage
            id='survey.form.title.edit'
            defaultMessage='Edit survey'
          />
          <span className='survey-name ml-1'>{survey.name}</span>
        </span>
      )
    }
  }

  renderName () {
    const survey = this.state
    const { errors } = survey

    const onInputChange = (event) => {
      event.preventDefault()
      this.setState({ [event.target.name]: event.target.value })
    }

    return (
      <div className={`form-group big-input ${errors.name ? 'error' : ''}`}>
        <label className='form-control-label title'>
          <FormattedMessage
            id='survey.form.name'
            defaultMessage='Name'
          />
        </label>
        <input
          name='name'
          type='text'
          className='form-control'
          required
          value={survey.name || ''}
          onChange={onInputChange}
        />
        <ErrorAlert errors={errors.name} />
      </div>
    )
  }

  renderODK () {
    if (!this.props.settings.ODK_ACTIVE) {
      return ''
    }

    const dataQA = (!this.state.odk.project_id
      ? 'survey-odk-add'
      : `survey-odk-edit-${this.state.odk.project_id}`
    )

    return (
      <div data-qa={dataQA}>
        {this.renderODKCollectTitle()}
        {this.renderSurveyors()}
        {this.renderXForms()}
      </div>
    )
  }

  renderODKCollectTitle () {
    const errors = this.state.errors.odk || {}

    return (
      <div className='survey-section'>
        <label>
          <FormattedMessage
            id='survey.odk.form.odk'
            defaultMessage='ODK Collect'
          />
        </label>
        <HelpMessage>
          <FormattedMessage
            id='survey.odk.form.odk.help.odk'
            defaultMessage={`
              Open Data Kit (or ODK for short) is an open-source suite of tools
              that helps organizations author, collect, and manage mobile data
              collection solutions.
            `}
          />
          <br />
          <a
            href='https://opendatakit.org/'
            target='_blank'
            rel='noopener noreferrer nofollow external'
          >
            <FormattedMessage
              id='survey.odk.form.odk.help.odk.link'
              defaultMessage='Click here to see more about Open Data Kit'
            />
          </a>
        </HelpMessage>
        <ErrorAlert errors={errors.generic} />
      </div>
    )
  }

  renderSurveyors () {
    const errors = this.state.errors.odk || {}
    const availableSurveyors = this.props.surveyors.results || []
    const selectedSurveyors = availableSurveyors
      .filter(surveyor => this.state.odk.surveyors.indexOf(surveyor.id) > -1)
    const onChange = (surveyors) => {
      this.setState({
        odk: {
          ...this.state.odk,
          surveyors: surveyors.map(surveyor => surveyor.id)
        }
      })
    }

    return (
      <div className={`form-group ${errors.surveyors ? 'error' : ''}`}>
        <label className='form-control-label title'>
          <FormattedMessage
            id='survey.odk.form.surveyors'
            defaultMessage='Granted Surveyors'
          />
        </label>
        <MultiSelect
          selected={selectedSurveyors}
          options={availableSurveyors}
          valueProp='id'
          textProp='username'
          onChange={onChange}
        />
        <ErrorAlert errors={errors.surveyors} />
      </div>
    )
  }

  renderXForms () {
    const errors = this.state.errors.odk || {}
    const { xforms } = this.state.odk

    const onFileChange = (event) => {
      event.preventDefault()
      const newXForms = []
      const { formatMessage } = this.props.intl

      // https://developer.mozilla.org/en-US/docs/Web/API/FileList
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files.item(i)
        newXForms.push({
          key: generateRandomId(),
          active: true,
          title: file.name,
          version: formatMessage(MESSAGES.newForm),
          file
        })
      }

      this.setState({
        odk: {
          ...this.state.odk,
          xforms: [...this.state.odk.xforms, ...newXForms]
        }
      })
    }

    return (
      <>
        <div className='my-3'>
          <label className='form-control-label title'>
            <FormattedMessage
              id='survey.odk.form.xforms.list'
              defaultMessage='xForms'
            />
          </label>
          <HelpMessage>
            <div className='mb-2'>
              <FormattedMessage
                id='survey.odk.form.xform.file.help'
                defaultMessage={`
                  XLSForm is a form standard created to help simplify the authoring of forms in Excel.
                  Authoring is done in a human readable format using a familiar tool that almost
                  everyone knows - Excel. XLSForms provide a practical standard for sharing and
                  collaborating on authoring forms.
                `}
              />
              <br />
              <a
                href='http://xlsform.org/'
                target='_blank'
                rel='noopener noreferrer nofollow external'
              >
                <FormattedMessage
                  id='survey.odk.form.odk.help.xlsform.link'
                  defaultMessage='Click here to see more about XLSForm'
                />
              </a>
            </div>
            <div>
              <FormattedMessage
                id='survey.odk.form.xform.odk.help'
                defaultMessage={`
                  The ODK XForms specification is used by tools in the Open Data Kit ecosystem.
                  It is a subset of the far larger W3C XForms 1.0 specification and
                  also contains a few additional features not found in the W3C XForms specification.
                `}
              />
              <br />
              <a
                href='http://opendatakit.github.io/xforms-spec/'
                target='_blank'
                rel='noopener noreferrer nofollow external'
              >
                <FormattedMessage
                  id='survey.odk.form.odk.help.xform.link'
                  defaultMessage='Click here to see more about XForm specification'
                />
              </a>
            </div>
          </HelpMessage>
        </div>

        <div className='form-items'>
          {
            xforms.map((xform, index) => {
              const onChange = (changedXForm) => {
                this.setState({
                  odk: {
                    ...this.state.odk,
                    xforms: [
                      ...xforms.filter((_, jndex) => jndex < index),
                      changedXForm,
                      ...xforms.filter((_, jndex) => jndex > index)
                    ]
                  }
                })
              }

              const onRemove = () => {
                this.setState({
                  odk: {
                    ...this.state.odk,
                    xforms: xforms.filter((_, jndex) => jndex !== index)
                  }
                })
              }

              return this.renderXForm(xform, errors[xform.key], onChange, onRemove)
            })
          }
        </div>

        <div className='form-group mt-4'>
          <label className='btn btn-secondary' htmlFor='xFormFiles'>
            <FormattedMessage
              id='survey.odk.form.xforms.file'
              defaultMessage='Add xForm / XLSForm files'
            />
          </label>
          <input
            name='files'
            id='xFormFiles'
            type='file'
            multiple
            className='hidden-file'
            accept='.xls,.xlsx,.xml'
            onChange={onFileChange}
          />
        </div>
      </>
    )
  }

  renderXForm (xform, errors, onChange, onRemove) {
    const { formatMessage } = this.props.intl

    const allErrors = []
    Object.keys(errors || {}).forEach(key => { allErrors.push(errors[key]) })

    const date = (xform.id
      ? (
        <small className='mr-3'>
          (<RelativeTime date={xform.created_at} />)
        </small>
      )
      : ''
    )

    const title = (
      <span title={xform.description} className='form-title'>
        <i className='fas fa-file mr-2' />
        {xform.title}
        <span className='badge badge-default mx-2'>
          <FormattedMessage
            id='survey.odk.form.xform.version'
            defaultMessage='version'
          />: {xform.version}
        </span>
      </span>
    )

    const onFileChange = (event) => {
      event.preventDefault()
      onChange({ ...xform, file: event.target.files.item(0) })
    }

    const removeFile = (event) => {
      event.preventDefault()
      onChange({ ...xform, file: undefined })
    }

    const onChangeMediaFiles = (mediaFiles) => {
      onChange({ ...xform, media_files: mediaFiles })
    }

    const toggleFlagActive = (event) => {
      event.preventDefault()
      onChange({ ...xform, active: !xform.active })
    }
    const activeStatus = xform.active ? 'on' : 'off'

    return (
      <div key={xform.key} className={`form-item ${activeStatus}`}>
        <ErrorAlert errors={allErrors} />

        <div className='row-xform'>
          {title}
          {date}
          {
            xform.id &&
              <>
                {
                  !xform.file &&
                    <div className='upload-new'>
                      <label className='btn btn-default' htmlFor='xFormFile'>
                        <FormattedMessage
                          id='survey.odk.form.xform.file'
                          defaultMessage='Upload new version'
                        />
                      </label>
                      <input
                        name='file'
                        id='xFormFile'
                        type='file'
                        className='hidden-file'
                        accept='.xls,.xlsx,.xml'
                        onChange={onFileChange}
                      />
                    </div>
                }
                {
                  xform.file &&
                    <>
                      <small>| New form version: </small>
                      <span className='ml-2 badge badge-default'>
                        <span>{xform.file.name}</span>
                        <button
                          type='button'
                          className='btn btn-sm icon-only btn-danger ml-2'
                          onClick={removeFile}
                        >
                          <i className='fas fa-times' />
                        </button>
                      </span>
                    </>
                }
              </>
          }

          <ConfirmButton
            className='btn btn-sm icon-only btn-danger delete-form-button mr-2'
            cancelable
            condition={() => xform.id}
            onConfirm={onRemove}
            title={title}
            message={formatMessage(MESSAGES.deleteXFormConfirm, { ...xform })}
            buttonLabel={<i className='fas fa-times' />}
          />
        </div>

        <div className='row-mediafiles'>
          {
            xform.id
              ? this.renderMediaFiles(xform, title, onChangeMediaFiles)
              : (
                <small className='ml-4'>
                  <FormattedMessage
                    id='survey.odk.form.xforms.file.media.files'
                    defaultMessage='To add media files you need to save the survey first'
                  />
                </small>
              )
          }
        </div>

        {
          xform.id &&
            <div className='row-extras'>
              <div
                className={`form-toggle ${activeStatus} float-right`}
                onClick={toggleFlagActive}
              >
                {
                  xform.active
                    ? (
                      <FormattedMessage
                        id='survey.odk.form.xforms.active'
                        defaultMessage='active'
                      />
                    )
                    : (
                      <FormattedMessage
                        id='survey.odk.form.xforms.inactive'
                        defaultMessage='inactive'
                      />
                    )
                }
                <i className={`ml-1 fas fa-toggle-${activeStatus}`} />
              </div>
            </div>
        }
      </div>
    )
  }

  renderMediaFiles (xform, title, onChange) {
    const inputFileId = `media-files-${xform.id}`

    const onFileChange = (event) => {
      event.preventDefault()
      const mediaFiles = []

      // https://developer.mozilla.org/en-US/docs/Web/API/FileList
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files.item(i)
        // do not duplicate media files
        if (!xform.media_files.find(mf => mf.name === file.name)) {
          mediaFiles.push({
            name: file.name,
            file
          })
        }
      }

      onChange([...xform.media_files, ...mediaFiles])
    }

    const onRemoveMediaFile = (mediaFile) => {
      onChange(xform.media_files.filter(mf => mf.name !== mediaFile.name))
    }

    return (
      <div className=''>
        {
          (xform.media_files || [])
            .map(mediaFile => this.renderMediaFile(mediaFile, title, onRemoveMediaFile))
        }

        <label className='btn btn-default' htmlFor={inputFileId}>
          <i className='fas fa-plus-circle fa-lg mr-1' />
          <FormattedMessage
            id='survey.odk.form.xform.media.files.add'
            defaultMessage='Add media files'
          />
        </label>
        <input
          name='files'
          id={inputFileId}
          type='file'
          multiple
          className='hidden-file'
          onChange={onFileChange}
        />
      </div>
    )
  }

  renderMediaFile (mediaFile, title, onRemove) {
    const { formatMessage } = this.props.intl

    return (
      <span key={mediaFile.name} className='ml-2 mb-1 badge badge-default'>
        {
          mediaFile.id
            ? (
              <a
                className='btn-link text-primary'
                href={getMediaFileContentPath(mediaFile)}
                target='_blank'
                rel='noopener noreferrer nofollow external'
              >
                {mediaFile.name}
              </a>
            )
            : mediaFile.name
        }

        <ConfirmButton
          className='btn btn-sm icon-only btn-danger ml-2'
          cancelable
          condition={() => mediaFile.id}
          onConfirm={() => { onRemove(mediaFile) }}
          title={title}
          message={formatMessage(MESSAGES.deleteMediafileConfirm, { ...mediaFile })}
          buttonLabel={<i className='fas fa-times' />}
        />
      </span>
    )
  }

  renderButtons () {
    const { formatMessage } = this.props.intl

    return (
      <div className='actions'>
        {
          this.state.id &&
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
              defaultMessage='Save survey'
            />
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
          <div className='modal-dialog modal-dialog-scrollable modal-md'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>{this.renderTitle()}</h5>
              </div>

              <div className='modal-body'>
                <i className='fas fa-spin fa-cog mr-2' />
                <FormattedMessage
                  id='survey.form.action.updating'
                  defaultMessage='Saving data in progress…'
                />
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
        options: { multipart: !!xform.file },
        // set the id to the new xform
        onSuccess: (response) => {
          if (!xform.id) {
            this.setState({
              odk: {
                ...this.state.odk,
                xforms: this.state.odk.xforms.map(xf => xf.key === xform.key
                  ? ({ ...xf, id: response.id, media_files: [] })
                  : xf
                )
              }
            })
          }
        }
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
            options: { multipart: true },
            // set the id to the new media file
            onSuccess: (response) => {
              if (!mf.id) {
                this.setState({
                  odk: {
                    ...this.state.odk,
                    xforms: this.state.odk.xforms.map(xf => xf.key === xform.key
                      ? ({
                        ...xf,
                        media_files: xform.media_files.map(mf2 => mf2.key === mf.key
                          ? ({ ...mf2, id: response.id })
                          : mf2
                        )
                      })
                      : xf
                    )
                  }
                })
              }
            }
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
      this.setState({
        actionsInProgress: [
          ...this.state.actionsInProgress,
          action.message
        ]
      })
      action.method(action.url, action.data, action.options)
        .then(response => {
          this.setState({
            actionsInProgress: [
              ...this.state.actionsInProgress,
              formatMessage(MESSAGES.handleDone)
            ]
          }, () => {
            if (action.onSuccess) {
              action.onSuccess(response)
            }
          })

          executeActions() // recursive call
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

    executeActions() // start
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
    goTo(getSurveysPath({ action: 'view', id: this.state.id }))
  }

  backToList () {
    // navigate to Surveys list page
    goTo(getSurveysPath({ action: 'list' }))
  }
}

// Include this to enable `this.props.intl` for this component.
export default injectIntl(SurveyForm)
