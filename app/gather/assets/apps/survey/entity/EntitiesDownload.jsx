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
  FormattedNumber
} from 'react-intl'

import { Portal } from '../../components'

import { MAX_PAGE_SIZE, EXPORT_CSV_FORMAT, EXPORT_EXCEL_FORMAT } from '../../utils/constants'
import { getEntitiesAPIPath } from '../../utils/paths'
import { postData } from '../../utils/request'

const MESSAGES = defineMessages({
  delimiterHint: {
    defaultMessage: 'Write «T» and press «Ctrl+Enter» to use «TAB» as delimiter',
    id: 'export.csv.delimiter.hint.first'
  },
  noAttachments: {
    defaultMessage: 'Found no attachments to download',
    id: 'export.no.attachments'
  }
})

const ODK_SUBMISSION_REGEX = '\\.xml$'
const ODK_AUDIT_REGEX = 'audit\\.csv$'

class EntitiesDownload extends Component {
  constructor (props) {
    super(props)

    this.state = {
      task: null,
      open: false,

      // default export options
      page: 1,
      generateRecords: true,
      dataFormat: 'split',
      fileFormat: EXPORT_CSV_FORMAT,
      headerContent: 'labels',
      headerSeparator: '/',
      headerFull: true,
      csvEscape: '\\',
      csvSeparator: ',',
      csvQuote: '"',
      generateAttachments: false,
      excludeFiles: props.settings.ODK_ACTIVE ? [ODK_SUBMISSION_REGEX, ODK_AUDIT_REGEX] : []
    }
  }

  render () {
    return (
      <>
        {this.renderDownloadButton()}
        {this.renderOptions()}
        {this.renderError()}
        {this.renderTask()}
      </>
    )
  }

  renderDownloadButton () {
    return (
      <button
        type='button'
        className='btn btn-primary'
        onClick={() => { this.setState({ open: true }) }}
      >
        <i className='fas fa-download mr-2' />
        <FormattedMessage
          id='entities.download.title'
          defaultMessage='Generate file for download'
        />
      </button>
    )
  }

  renderOptions () {
    if (!this.state.open) {
      return ''
    }

    const { EXPORT_MAX_ROWS_SIZE } = this.props.settings
    const { formatMessage } = this.props.intl
    const { total, filename } = this.props
    const { page } = this.state

    const pageSize = Math.min(EXPORT_MAX_ROWS_SIZE || MAX_PAGE_SIZE, MAX_PAGE_SIZE)
    const pages = Math.ceil(total / pageSize)

    if (page < 1 || page > pages) { // unlikely
      this.setState({ page: 1 })
      return ''
    }

    const { survey } = this.props
    const params = {
      project: survey.id,
      format: '',
      action: this.state.fileFormat,
      page,
      pageSize
    }

    const download = () => {
      this.setState({ task: null, open: false, error: null })

      let payload = {
        background: 'true',
        filename: total > pageSize ? `${filename}-${page}` : filename,
        generate_records: 'f',
        generate_attachments: 'f'
      }
      if (this.state.generateRecords) {
        payload = {
          ...payload,
          generate_records: 't',
          paths: this.props.paths,
          labels: this.props.labels,
          data_format: this.state.dataFormat,
          header_content: this.state.headerContent,
          header_separator: this.state.headerSeparator,
          header_shorten: this.state.headerFull ? 'no' : 'yes',
          csv_escape: this.state.csvEscape,
          csv_separator: this.state.csvSeparator === 'TAB' ? '\t' : this.state.csvSeparator.charAt(0),
          csv_quote: this.state.csvQuote
        }
      }
      if (this.state.generateAttachments) {
        payload = {
          ...payload,
          generate_attachments: 't'
        }

        const { excludeFiles } = this.state
        if (excludeFiles.length > 0) {
          payload.exclude_files = '(' + excludeFiles.join('|') + ')'
        }
      }

      return postData(getEntitiesAPIPath(params), payload)
        .then(response => {
          if (!response) {
            // no attachments found
            this.setState({
              task: null,
              error: {
                content: {
                  detail: formatMessage(MESSAGES.noAttachments)
                }
              }
            })
          } else {
            const { task } = response
            this.setState({ task, error: null })
          }
        })
        .catch(error => {
          if (error.name === 'AbortError') {
            this.setState({ task: null, error: null })
          } else {
            this.setState({ task: null, error })
          }
        })
    }

    const onInputChange = (event) => {
      event.preventDefault()
      this.setState({ [event.target.name]: event.target.value })
    }

    const onKeyUp = (event) => {
      // change to TAB if the input value is "t" or "T" and key pressed is Ctrl+Enter
      if (
        ['t', 'T'].indexOf(this.state[event.target.name]) > -1 &&
        event.ctrlKey && event.key === 'Enter'
      ) {
        event.preventDefault()
        this.setState({ [event.target.name]: 'TAB' })
      }
    }

    const DATA_FORMATS = [
      {
        id: 'split',
        label: (
          <FormattedMessage
            id='entities.download.data.format.split'
            defaultMessage='Normalised into multiple files (better for importing into a relational database)'
          />
        )
      },
      {
        id: 'flatten',
        label: (
          <FormattedMessage
            id='entities.download.data.format.flatten'
            defaultMessage='Flattened into a single file (better for manual analysis and some other tools)'
          />
        )
      }
    ]

    const HEADERS = [
      {
        id: 'labels',
        label: (
          <FormattedMessage
            id='entities.download.headers.labels'
            defaultMessage='Labels'
          />
        )
      },
      {
        id: 'paths',
        label: (
          <FormattedMessage
            id='entities.download.headers.paths'
            defaultMessage='Names'
          />
        )
      },
      {
        id: 'both',
        label: (
          <FormattedMessage
            id='entities.download.headers.both'
            defaultMessage='Both'
          />
        )
      }
    ]

    const FILE_FORMATS = [
      {
        id: EXPORT_EXCEL_FORMAT,
        label: EXPORT_EXCEL_FORMAT.toUpperCase()
      },
      {
        id: EXPORT_CSV_FORMAT,
        label: EXPORT_CSV_FORMAT.toUpperCase(),
        // in case of checked, render the CSV options
        renderChecked: () => (
          <div className='ml-5 form-inline'>
            <div className='form-group mr-5'>
              <label
                className='form-control-label label mr-2'
                title={formatMessage(MESSAGES.delimiterHint)}
              >
                <FormattedMessage
                  id='entities.download.csv.separator'
                  defaultMessage='Delimiter'
                />
                <sup className='ml-1'><b>(*)</b></sup>
              </label>
              <input
                name='csvSeparator'
                type='text'
                className='form-control'
                size={3}
                maxLength={1}
                value={this.state.csvSeparator || ''}
                onChange={onInputChange}
                onKeyUp={onKeyUp}
              />
            </div>
            <div className='form-group mr-5'>
              <label className='form-control-label label mr-2'>
                <FormattedMessage
                  id='entities.download.csv.quote'
                  defaultMessage='Quote'
                />
              </label>
              <input
                name='csvQuote'
                type='text'
                className='form-control'
                size={3}
                maxLength={1}
                value={this.state.csvQuote || ''}
                onChange={onInputChange}
              />
            </div>
            <div className='form-group mr-5'>
              <label className='form-control-label label mr-2'>
                <FormattedMessage
                  id='entities.download.csv.escape'
                  defaultMessage='Escape'
                />
              </label>
              <input
                name='csvEscape'
                type='text'
                className='form-control'
                size={3}
                maxLength={1}
                value={this.state.csvEscape || ''}
                onChange={onInputChange}
              />
            </div>
          </div>
        )
      }
    ]

    const EXCLUDE_FILES = []
    if (this.props.settings.ODK_ACTIVE) {
      EXCLUDE_FILES.push({
        id: ODK_SUBMISSION_REGEX,
        label: (
          <FormattedMessage
            id='entities.download.exclude.files.xml'
            defaultMessage='ODK Collect submission file'
          />
        )
      })

      EXCLUDE_FILES.push({
        id: ODK_AUDIT_REGEX,
        label: (
          <FormattedMessage
            id='entities.download.exclude.files.audit'
            defaultMessage='ODK Collect audit file'
          />
        )
      })
    }

    const close = () => { this.setState({ open: false }) }
    const noDownload = !this.state.generateRecords && !this.state.generateAttachments

    return (
      <Portal onEscape={close} onEnter={download}>
        <div className='modal show'>
          <div className='modal-dialog modal-dialog-centered modal-lg'>
            <div className='modal-content modal-options'>
              {this.renderPortalHeader(close)}

              <div className='modal-body'>
                {/* ------------------------------------------------------ */}
                {/* Blocks */}
                {/* ------------------------------------------------------ */}
                <div className='m-3'>
                  <h4 className='title mb-3'>
                    <FormattedMessage
                      id='entities.download.data.content.title'
                      defaultMessage='Content'
                    />
                  </h4>
                  <div className='d-flex'>
                    {
                      page > 1 &&
                        <button
                          type='button'
                          className='btn'
                          onClick={() => { this.setState({ page: page - 1 }) }}
                        >
                          <i className='fa fa-angle-double-left' />
                        </button>
                    }

                    <div className='flex-grow-1 text-center'>
                      <FormattedMessage
                        id='entities.download.page.from'
                        defaultMessage='From record'
                      />
                      <b className='mr-1 ml-1'>
                        <FormattedNumber value={(page - 1) * pageSize + 1} />
                      </b>

                      <FormattedMessage
                        id='entities.download.page.to'
                        defaultMessage='to record'
                      />
                      <b className='ml-1'>
                        <FormattedNumber value={Math.min((page) * pageSize, total)} />
                      </b>

                      {
                        pages > 1 &&
                          <>
                            <b className='mr-2 ml-2'>&ndash;</b>
                            <FormattedMessage
                              id='entities.download.page.current'
                              defaultMessage='Block'
                            />
                            <b className='mr-1 ml-1'>
                              <FormattedNumber value={page} />
                            </b>
                            <FormattedMessage
                              id='entities.download.page.of'
                              defaultMessage='of'
                            />
                            <b className='mr-1 ml-1'>
                              <FormattedNumber value={pages} />
                            </b>
                          </>
                      }
                    </div>

                    {
                      page < pages &&
                        <button
                          type='button'
                          className='btn'
                          onClick={() => { this.setState({ page: page + 1 }) }}
                        >
                          <i className='fa fa-angle-double-right' />
                        </button>
                    }
                  </div>
                </div>

                {/* ------------------------------------------------------ */}
                {/* Records */}
                {/* ------------------------------------------------------ */}
                <div className='m-3'>
                  <h4 className='title mb-3'>
                    <FormattedMessage
                      id='entities.download.data.records'
                      defaultMessage='Records'
                    />
                  </h4>

                  <div
                    className='form-group mt-2 ml-2'
                    onClick={() => { this.setState({ generateRecords: !this.state.generateRecords }) }}
                  >
                    <i
                      className={`fa ${this.state.generateRecords ? 'fa-toggle-on' : 'fa-toggle-off'}`}
                    />
                    <label className='form-control-label ml-2'>
                      <FormattedMessage
                        id='entities.download.records.include'
                        defaultMessage='Generate file with records'
                      />
                    </label>
                  </div>
                </div>

                {
                  this.state.generateRecords &&
                    <>
                      <div className='m-3'>
                        <h5 className='title mb-3'>
                          <FormattedMessage
                            id='entities.download.data.format.title'
                            defaultMessage='Data format'
                          />
                        </h5>
                        {this.renderChoices(DATA_FORMATS, 'dataFormat')}
                      </div>

                      <div className='m-3'>
                        <h5 className='title mb-3'>
                          <FormattedMessage
                            id='entities.download.headers.title'
                            defaultMessage='Headers'
                          />
                        </h5>

                        {this.renderChoices(HEADERS, 'headerContent', 'd-inline mr-5')}

                        <div className='form-inline p-2'>
                          <div
                            className='form-group mt-2 ml-2'
                            onClick={() => { this.setState({ headerFull: !this.state.headerFull }) }}
                          >
                            <i
                              className={`fa ${this.state.headerFull ? 'fa-toggle-on' : 'fa-toggle-off'}`}
                            />
                            <label className='form-control-label ml-2'>
                              <FormattedMessage
                                id='entities.download.headers.full'
                                defaultMessage='Show full path in headers'
                              />
                            </label>
                          </div>

                          {
                            this.state.headerFull &&
                              <div className='form-group ml-5'>
                                <label className='form-control-label label mr-2'>
                                  <FormattedMessage
                                    id='entities.download.headers.separator'
                                    defaultMessage='Delimiter'
                                  />
                                </label>
                                <input
                                  name='headerSeparator'
                                  type='text'
                                  className='form-control'
                                  size={3}
                                  maxLength={1}
                                  value={this.state.headerSeparator || ''}
                                  onChange={onInputChange}
                                />
                              </div>
                          }
                        </div>
                      </div>

                      <div className='m-3'>
                        <h5 className='title mb-3'>
                          <FormattedMessage
                            id='entities.download.file.format.title'
                            defaultMessage='File format'
                          />
                        </h5>

                        {this.renderChoices(FILE_FORMATS, 'fileFormat')}
                      </div>
                    </>
                }

                {/* ------------------------------------------------------ */}
                {/* Attachments */}
                {/* ------------------------------------------------------ */}
                <div className='m-3'>
                  <h4 className='title mb-3'>
                    <FormattedMessage
                      id='entities.download.data.attachments'
                      defaultMessage='Attachments'
                    />
                  </h4>

                  <div
                    className='form-group mt-2 ml-2'
                    onClick={() => { this.setState({ generateAttachments: !this.state.generateAttachments }) }}
                  >
                    <i
                      className={`fa ${this.state.generateAttachments ? 'fa-toggle-on' : 'fa-toggle-off'}`}
                    />
                    <label className='form-control-label ml-2'>
                      <FormattedMessage
                        id='entities.download.attachments.full'
                        defaultMessage='Generate zip file with all attachments'
                      />
                    </label>
                  </div>
                </div>

                {
                  this.state.generateAttachments && EXCLUDE_FILES.length > 0 &&
                    <div className='m-3'>
                      <h5 className='title mb-3'>
                        <FormattedMessage
                          id='entities.download.data.exclude.file'
                          defaultMessage='Exclude the following files'
                        />
                      </h5>
                      {this.renderToggles(EXCLUDE_FILES, 'excludeFiles')}
                    </div>
                }
              </div>

              <div className='modal-footer'>
                <div className='w-100 actions'>
                  <div>
                    <button
                      type='button'
                      className='btn btn-cancel btn-block'
                      onClick={close}
                    >
                      <FormattedMessage
                        id='entities.download.cancel'
                        defaultMessage='Cancel'
                      />
                    </button>
                  </div>

                  <div>
                    <button
                      type='button'
                      className={`btn ${noDownload ? 'btn-cancel' : 'btn-primary'} btn-block`}
                      disabled={noDownload}
                      onClick={() => { download() }}
                    >
                      <FormattedMessage
                        id='entities.download.prepare'
                        defaultMessage='Prepare file(s)'
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    )
  }

  renderChoices (list, name, className) {
    return list.map(option => (
      <div
        key={option.id}
        className={`p-2 ${className || ''} ${this.state[name] === option.id ? 'selected' : ''}`}
      >
        <div
          className='d-inline-flex'
          onClick={() => { this.setState({ [name]: option.id }) }}
        >
          <div className='radio' />
          <label className='ml-1'>
            {option.label}
          </label>
        </div>

        {
          this.state[name] === option.id &&
          option.renderChecked &&
            <div className='d-inline-flex'>
              {option.renderChecked()}
            </div>
        }
      </div>
    ))
  }

  renderToggles (list, name, className) {
    return list.map(option => (
      <div
        key={option.id}
        className='form-group mt-2 ml-2'
        onClick={() => {
          const choices = this.state[name]
          if (choices.indexOf(option.id) > -1) {
            this.setState({ [name]: choices.filter(c => c !== option.id) })
          } else {
            this.setState({ [name]: [...choices, option.id] })
          }
        }}
      >
        <i
          className={`fas ${this.state[name].indexOf(option.id) > -1 ? 'fa-toggle-on' : 'fa-toggle-off'}`}
        />
        <label className='ml-1'>
          {option.label}
        </label>
      </div>
    ))
  }

  renderError () {
    const renderBody = (error) => (
      <>
        <p>
          <i className='fas fa-exclamation-triangle mr-1' />
          <FormattedMessage
            id='entities.download.error'
            defaultMessage={`
              Download was not successful,
              maybe there was a server error while requesting for it.
            `}
          />
        </p>
        {
          error.content && error.content.detail &&
            <p>
              <i className='fas fa-exclamation-triangle mr-1' />
              {error.content.detail}
            </p>
        }
      </>
    )
    return this.renderPortal('error', renderBody)
  }

  renderTask () {
    const renderBody = (task) => (
      <>
        <p>
          <FormattedMessage
            id='entities.download.task.warning.1'
            defaultMessage='Download was started in background mode.'
          />
          <br />
          <FormattedMessage
            id='entities.download.task.warning.2'
            defaultMessage='Check the given task id within the generated files list.'
          />
        </p>
        <p>
          <FormattedMessage
            id='entities.download.task.id'
            defaultMessage='Task ID'
            values={{ task }}
          />: <b>{task}</b>
        </p>
      </>
    )
    return this.renderPortal('task', renderBody)
  }

  renderPortal (property, renderBody) {
    const value = this.state[property]
    if (!value) {
      return ''
    }

    const close = () => { this.setState({ [property]: null }) }

    return (
      <Portal onEscape={close} onEnter={close}>
        <div className='modal show'>
          <div className='modal-dialog modal-md'>
            <div className='modal-content'>
              {this.renderPortalHeader(close)}

              <div className='modal-body'>
                {renderBody(value)}
              </div>
            </div>
          </div>
        </div>
      </Portal>
    )
  }

  renderPortalHeader (close) {
    return (
      <div className='modal-header'>
        <h5 className='modal-title'>
          <i className='fas fa-download mr-2' />
          <FormattedMessage
            id='entities.download.title'
            defaultMessage='Download'
          />
        </h5>
        <button
          data-qa='confirm-button-close'
          type='button'
          className='close'
          onClick={close}
        >
          &times;
        </button>
      </div>
    )
  }
}

export default injectIntl(EntitiesDownload)
