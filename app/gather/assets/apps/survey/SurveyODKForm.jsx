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
import {
  defineMessages,
  injectIntl,
  FormattedMessage,
  FormattedRelativeTime
} from 'react-intl'
import { selectUnit } from '@formatjs/intl-utils'

import { clone, generateRandomId } from '../utils'
import {
  ConfirmButton,
  ErrorAlert,
  HelpMessage,
  MultiSelect
} from '../components'

import { getMediaFileContentPath } from '../utils/paths'

const MESSAGES = defineMessages({
  newForm: {
    defaultMessage: 'new',
    id: 'survey.odk.form.xform.new'
  },
  deleteConfirm: {
    defaultMessage: 'Are you sure you want to delete the xForm “{title}”?',
    id: 'survey.odk.form.xform.action.delete.confirm'
  },
  deleteMediaConfirm: {
    defaultMessage: 'Are you sure you want to delete the media file “{name}”?',
    id: 'survey.odk.form.xform.media.file.action.delete.confirm'
  }
})

class SurveyODKForm extends Component {
  constructor (props) {
    super(props)

    const xforms = [...(props.survey.xforms || [])].map(xform => ({ ...xform, key: xform.id }))
    xforms.sort((a, b) => (
      (a.title > b.title) ||
      (a.title === b.title && a.created_at > b.created_at)
    )) // sort by title + created_at

    this.state = {
      xforms,
      surveyors: [...(props.survey.surveyors || [])],
      availableSurveyors: clone(props.surveyors.results || [])
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState !== this.state) {
      this.props.onChange({
        ...this.props.survey,
        surveyors: [...this.state.surveyors],
        xforms: [...this.state.xforms]
      })
    }
  }

  render () {
    const dataQA = (!this.props.survey.project_id
      ? 'survey-odk-add'
      : `survey-odk-edit-${this.props.survey.project_id}`
    )

    return (
      <div data-qa={dataQA}>
        {this.renderODK()}
        {this.renderSurveyors()}
        {this.renderXForms()}
      </div>
    )
  }

  renderODK () {
    const errors = this.props.errors || {}
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
    const errors = this.props.errors || {}
    const { surveyors, availableSurveyors } = this.state
    const selectedSurveyors = availableSurveyors.filter(surveyor => surveyors.indexOf(surveyor.id) > -1)
    const onChange = (surveyors) => {
      this.setState({
        surveyors: surveyors.map(surveyor => surveyor.id)
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
    const { xforms, surveyors } = this.state
    const errors = this.props.errors || {}

    return (
      <div>
        <div>
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
            xforms.map((xform, index) => (
              <XFormIntl
                key={xform.key}
                xform={xform}
                errors={errors[xform.key]}
                surveyors={surveyors}
                onRemove={() => {
                  this.setState({
                    xforms: xforms.filter((_, jndex) => jndex !== index)
                  })
                }}
                onChange={(changedXForm) => {
                  this.setState({
                    xforms: [
                      ...xforms.filter((_, jndex) => jndex < index),
                      changedXForm,
                      ...xforms.filter((_, jndex) => jndex > index)
                    ]
                  })
                }}
              />
            ))
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
            onChange={this.onFileChange.bind(this)}
          />
        </div>
      </div>
    )
  }

  onFileChange (event) {
    event.preventDefault()
    const xforms = []
    const { formatMessage } = this.props.intl

    // https://developer.mozilla.org/en-US/docs/Web/API/FileList
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files.item(i)
      xforms.push({
        key: generateRandomId(),
        title: file.name,
        version: formatMessage(MESSAGES.newForm),
        file
      })
    }

    this.setState({ xforms: [...this.state.xforms, ...xforms] })
  }
}

class XForm extends Component {
  constructor (props) {
    super(props)

    this.state = {
      ...clone(props.xform)
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState !== this.state) {
      this.props.onChange(this.state)
    }
  }

  render () {
    const { formatMessage } = this.props.intl
    const xform = this.state
    const errors = this.props.errors || {}

    const allErrors = []
    Object.keys(errors).forEach(key => { allErrors.push(errors[key]) })

    const { value, unit } = selectUnit(new Date(xform.created_at))
    const date = (xform.id
      ? (
        <small className='mr-4'>
          (<FormattedRelativeTime value={value} unit={unit} />)
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

    return (
      <>
        <ErrorAlert errors={allErrors} />

        <div className='form-item'>
          <div className='row-xform'>
            {title}
            {date}

            <div className='d-inline float-right'>
              {
                xform.id &&
                  <>
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
                      onChange={this.onFileChange.bind(this)}
                    />
                    {
                      xform.file &&
                        <span className='ml-2 badge badge-default'>
                          <span>{xform.file.name}</span>
                          <button
                            type='button'
                            className='btn btn-sm icon-only btn-danger ml-2'
                            onClick={this.removeFile.bind(this)}
                          >
                            <i className='fas fa-times' />
                          </button>
                        </span>
                    }
                  </>
              }

              <ConfirmButton
                className='btn btn-sm icon-only btn-danger mx-2'
                cancelable
                condition={() => xform.id}
                onConfirm={this.props.onRemove}
                title={title}
                message={formatMessage(MESSAGES.deleteConfirm, { ...xform })}
                buttonLabel={<i className='fas fa-times' />}
              />
            </div>
          </div>

          <div className='row-mediafiles'>
            {
              xform.id
                ? (
                  <MediaFileIntl
                    id={xform.id}
                    title={title}
                    mediaFiles={xform.media_files}
                    onChange={(mediaFiles) => { this.setState({ media_files: mediaFiles }) }}
                  />
                )
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
        </div>
      </>
    )
  }

  onInputChange (event) {
    event.preventDefault()
    this.setState({ [event.target.name]: event.target.value })
  }

  onFileChange (event) {
    event.preventDefault()
    this.setState({ [event.target.name]: event.target.files.item(0) })
  }

  removeFile (event) {
    event.preventDefault()
    this.setState({ file: undefined })
  }
}

class MediaFile extends Component {
  constructor (props) {
    super(props)
    this.state = {
      mediaFiles: props.mediaFiles.map(mediaFile => ({ ...mediaFile, key: mediaFile.name }))
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState !== this.state) {
      this.props.onChange(this.state.mediaFiles)
    }
  }

  render () {
    const { mediaFiles } = this.state
    const inputFileId = `media-files-${this.props.id}`

    return (
      <div className=''>
        {mediaFiles.map(mediaFile => this.renderMediaFile(mediaFile))}

        <label className='btn btn-default' htmlFor={inputFileId}>
          <i className='fas fa-plus mr-2' />
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
          onChange={this.onFileChange.bind(this)}
        />
      </div>
    )
  }

  renderMediaFile (mediaFile) {
    const { formatMessage } = this.props.intl

    return (
      <span key={mediaFile.id || mediaFile.key} className='ml-2 mb-1 badge badge-default'>
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
          onConfirm={() => {
            this.setState({
              mediaFiles: this.state.mediaFiles.filter(mf => mf.key !== mediaFile.key)
            })
          }}
          title={this.props.title}
          message={formatMessage(MESSAGES.deleteMediaConfirm, { ...mediaFile })}
          buttonLabel={<i className='fas fa-times' />}
        />
      </span>
    )
  }

  onFileChange (event) {
    event.preventDefault()
    const mediaFiles = []

    // https://developer.mozilla.org/en-US/docs/Web/API/FileList
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files.item(i)
      mediaFiles.push({
        key: generateRandomId(),
        name: file.name,
        file
      })
    }

    this.setState({ mediaFiles: [...this.state.mediaFiles, ...mediaFiles] })
  }
}

// Include this to enable `this.props.intl` for this component.
export default injectIntl(SurveyODKForm)
const XFormIntl = injectIntl(XForm)
const MediaFileIntl = injectIntl(MediaFile)
