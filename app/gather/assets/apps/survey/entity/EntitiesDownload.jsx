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
import { FormattedMessage, FormattedNumber } from 'react-intl'

import { Portal } from '../../components'

import { range } from '../../utils'
import { MAX_PAGE_SIZE, EXPORT_CSV_FORMAT, EXPORT_EXCEL_FORMAT } from '../../utils/constants'
import { getEntitiesAPIPath } from '../../utils/paths'
import { postData } from '../../utils/request'

export default class EntitiesDownload extends Component {
  constructor (props) {
    super(props)

    const { EXPORT_MAX_ROWS_SIZE } = props.settings
    const pageSize = Math.min(EXPORT_MAX_ROWS_SIZE || MAX_PAGE_SIZE, MAX_PAGE_SIZE)

    this.state = {
      pageSize,
      controller: false,

      // default export options
      dataFormat: 'split',
      fileFormat: EXPORT_CSV_FORMAT,
      headerContent: 'labels',
      headerSeparator: '/',
      headerFull: true,
      csvEscape: '\\',
      csvSeparator: ',',
      csvQuote: '"'
    }
  }

  render () {
    const { total, filename } = this.props
    const { pageSize, controller } = this.state

    let downloadButton
    if (controller) { // download in progress
      downloadButton = (
        <button
          type='button'
          className='tab'
          onClick={() => { controller.abort() }}
        >
          <i className='fa fa-spinner fa-pulse mr-2' />
          <FormattedMessage
            id='entities.download.cancel'
            defaultMessage='Cancel download' />
        </button>
      )
    } else {
      if (total < pageSize) { // only one call
        downloadButton = (
          <button
            type='button'
            className='tab'
            onClick={() => { this.setState({ page: 1, filename }) }}
          >
            <i className='fas fa-download mr-2' />
            <FormattedMessage
              id='entities.download.title'
              defaultMessage='Download' />
          </button>
        )
      } else { // too much data
        const dropdown = 'downloadLinkChoices'
        const pages = range(1, Math.ceil(total / pageSize) + 1)
          .map(index => ({
            page: index,
            filename: `${filename}-${index}`
          }))

        downloadButton = (
          <div className='dropdown'>
            <button
              type='button'
              className='tab'
              id={dropdown}
              data-toggle='dropdown'
            >
              <i className='fas fa-download mr-2' />
              <FormattedMessage
                id='entities.download.title'
                defaultMessage='Download' />
            </button>

            <div
              className='dropdown-menu'
              aria-labelledby={dropdown}
            >
              <div className='dropdown-list'>
                {
                  pages.map(pageOptions => (
                    <button
                      key={pageOptions.page}
                      type='button'
                      className='dropdown-item'
                      onClick={() => { this.setState({ ...pageOptions }) }}
                    >
                      { this.renderInterval(pageOptions.page) }
                    </button>
                  ))
                }
              </div>
            </div>
          </div>
        )
      }
    }

    return (
      <React.Fragment>
        { this.renderError() }
        { this.renderOptions() }
        { downloadButton }
      </React.Fragment>
    )
  }

  renderInterval (page) {
    const { total } = this.props
    const { pageSize } = this.state

    return (
      <React.Fragment>
        <FormattedMessage
          id='entities.download.page.from'
          defaultMessage='from record' />
        <b className='mr-2 ml-2'>
          <FormattedNumber value={(page - 1) * pageSize + 1} />
        </b>

        <FormattedMessage
          id='entities.download.page.to'
          defaultMessage='to record' />
        <b className='ml-2'>
          <FormattedNumber value={Math.min((page) * pageSize, total)} />
        </b>
      </React.Fragment>
    )
  }

  renderOptions () {
    const { page, pageSize, filename } = this.state

    if (!page) {
      return ''
    }

    const { survey } = this.props
    const params = {
      project: survey.id,
      format: '',
      action: this.state.fileFormat,
      pageSize
    }

    const download = () => {
      const controller = new window.AbortController()
      this.setState({ controller, page: 0, error: null })

      return postData(
        getEntitiesAPIPath({ ...params, page }),
        {
          paths: this.props.paths,
          labels: this.props.labels,
          data_format: this.state.dataFormat,
          header_content: this.state.headerContent,
          header_separator: this.state.headerSeparator,
          header_shorten: this.state.headerFull ? 'no' : 'yes',
          csv_escape: this.state.csvEscape,
          csv_separator: this.state.csvSeparator === 'TAB' ? '\t' : this.state.csvSeparator.charAt(0),
          csv_quote: this.state.csvQuote,
          filename
        },
        { download: true, signal: controller.signal }
      )
        .then(() => {
          this.setState({ controller: null, error: null })
        })
        .catch(error => {
          if (error.name === 'AbortError') {
            this.setState({ controller: null, error: null })
          } else {
            this.setState({ controller: null, error })
          }
        })
    }

    const onInputChange = (event) => {
      event.preventDefault()
      this.setState({ [event.target.name]: event.target.value })
    }

    const onKeyPress = (event) => {
      // change to TAB if the input value is "t" or "T" and key pressed is Ctrl+Enter
      if (['t', 'T'].indexOf(this.state[event.target.name]) > -1 && event.ctrlKey && event.charCode === 13) {
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
            defaultMessage='Normalised into multiple files (better for importing into a relational database)' />
        )
      },
      {
        id: 'flatten',
        label: (
          <FormattedMessage
            id='entities.download.data.format.flatten'
            defaultMessage='Flattened into a single file (better for manual analysis and some other tools)' />
        )
      }
    ]

    const HEADERS = [
      {
        id: 'labels',
        label: (
          <FormattedMessage
            id='entities.download.headers.labels'
            defaultMessage='Labels' />
        )
      },
      {
        id: 'paths',
        label: (
          <FormattedMessage
            id='entities.download.headers.paths'
            defaultMessage='Names' />
        )
      },
      {
        id: 'both',
        label: (
          <FormattedMessage
            id='entities.download.headers.both'
            defaultMessage='Both' />
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
              <label className='form-control-label title mr-2'>
                <FormattedMessage
                  id='entities.download.csv.separator'
                  defaultMessage='Delimiter' />
              </label>
              <input
                name='csvSeparator'
                type='text'
                className='form-control'
                size={3}
                maxLength={1}
                value={this.state.csvSeparator || ''}
                onChange={onInputChange}
                onKeyPress={onKeyPress}
              />
            </div>
            <div className='form-group mr-5'>
              <label className='form-control-label title mr-2'>
                <FormattedMessage
                  id='entities.download.csv.quote'
                  defaultMessage='Quote' />
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
              <label className='form-control-label title mr-2'>
                <FormattedMessage
                  id='entities.download.csv.escape'
                  defaultMessage='Escape' />
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

    return (
      <Portal>
        <div className='modal show'>
          <div className='modal-dialog modal-dialog-centered modal-lg'>
            <div className='modal-content modal-options'>
              <div className='modal-header'>
                <h5 className='modal-title'>
                  <FormattedMessage
                    id='entities.download.options.title'
                    defaultMessage='Download data' />: { this.renderInterval(page) }
                </h5>
                <button
                  data-qa='confirm-button-close'
                  type='button'
                  className='close'
                  onClick={() => { this.setState({ page: 0, filename: null }) }}>
                  &times;
                </button>
              </div>

              <div className='modal-body'>
                <div className='m-3'>
                  <h6 className='border-bottom p-2 mb-3'>
                    <FormattedMessage
                      id='entities.download.data.format.title'
                      defaultMessage='Data format' />
                  </h6>
                  { this.renderChoices(DATA_FORMATS, 'dataFormat') }
                </div>

                <div className='m-3'>
                  <h6 className='border-bottom p-2 mb-3'>
                    <FormattedMessage
                      id='entities.download.headers.title'
                      defaultMessage='Headers' />
                  </h6>

                  { this.renderChoices(HEADERS, 'headerContent', 'd-inline mr-5') }

                  <div className='ml-5 form-inline'>
                    <div
                      className='form-group mt-2'
                      onClick={() => { this.setState({ headerFull: !this.state.headerFull }) }}>
                      <i
                        className={`fa ${this.state.headerFull ? 'fa-toggle-on' : 'fa-toggle-off'}`}
                      />
                      <label className='form-control-label title ml-2'>
                        <FormattedMessage
                          id='entities.download.headers.full'
                          defaultMessage='Show full path in headers' />
                      </label>
                    </div>

                    { this.state.headerFull &&
                      <div className='form-group ml-5'>
                        <label className='form-control-label title mr-2'>
                          <FormattedMessage
                            id='entities.download.headers.separator'
                            defaultMessage='Delimiter' />
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
                  <h6 className='border-bottom p-2 mb-3'>
                    <FormattedMessage
                      id='entities.download.file.format.title'
                      defaultMessage='File format' />
                  </h6>

                  { this.renderChoices(FILE_FORMATS, 'fileFormat') }
                </div>
              </div>

              <div className='modal-footer'>
                <div className='w-100 actions'>
                  <div>
                    <button
                      type='button'
                      className='btn btn-cancel btn-block'
                      onClick={() => { this.setState({ page: 0, filename: null }) }}>
                      <FormattedMessage
                        id='entities.download.cancel'
                        defaultMessage='Cancel' />
                    </button>
                  </div>

                  <div>
                    <button
                      type='button'
                      className='btn btn-primary btn-block'
                      onClick={() => { download() }}>
                      <FormattedMessage
                        id='entities.download.prepare'
                        defaultMessage='Prepare' />
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
        className={`p-2 ${className || ''} ${this.state[name] === option.id ? 'selected' : ''}`}>
        <div
          className='d-inline-flex'
          onClick={() => { this.setState({ [name]: option.id }) }}>
          <div className='radio' />
          <label className='ml-1'>
            { option.label }
          </label>
        </div>

        { this.state[name] === option.id &&
          option.renderChecked &&
          <div className='d-inline-flex'>
            { option.renderChecked() }
          </div>
        }
      </div>
    ))
  }

  renderError () {
    const { error } = this.state
    if (!error) {
      return ''
    }

    return (
      <Portal>
        <div className='modal show'>
          <div className='modal-dialog modal-md'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>
                  <FormattedMessage
                    id='entities.download.title'
                    defaultMessage='Download' />
                </h5>
                <button
                  data-qa='confirm-button-close'
                  type='button'
                  className='close'
                  onClick={() => { this.setState({ error: null }) }}>
                  &times;
                </button>
              </div>

              <div className='modal-body'>
                <p>
                  <i className='fas fa-exclamation-triangle mr-1' />
                  <FormattedMessage
                    id='entities.download.error'
                    defaultMessage={`
                      Download was not successful,
                      maybe there was a server error while requesting for it.
                    `} />
                </p>
                { error.content && error.content.detail &&
                  <p>
                    <i className='fas fa-exclamation-triangle mr-1' />
                    { error.content.detail }
                  </p>
                }
              </div>
            </div>
          </div>
        </div>
      </Portal>
    )
  }
}
