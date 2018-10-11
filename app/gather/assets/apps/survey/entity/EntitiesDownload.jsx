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
import { FormattedMessage } from 'react-intl'

import { Portal } from '../../components'

import { range } from '../../utils'
import { MAX_PAGE_SIZE } from '../../utils/constants'
import { getEntitiesAPIPath } from '../../utils/paths'
import { postData } from '../../utils/request'

export default class EntitiesDownload extends Component {
  constructor (props) {
    super(props)

    this.state = {
      preparing: false
    }
  }

  render () {
    const { survey, total } = this.props
    const { EXPORT_FORMAT, EXPORT_MAX_ROWS_SIZE } = this.props.settings

    const pageSize = Math.min(EXPORT_MAX_ROWS_SIZE || MAX_PAGE_SIZE, MAX_PAGE_SIZE)
    const params = {
      project: survey.id,
      format: '',
      action: EXPORT_FORMAT,
      pageSize
    }

    const download = (page, filename) => {
      this.setState({ preparing: true, error: null })

      return postData(
        getEntitiesAPIPath({ ...params, page }),
        {
          paths: this.props.paths,
          headers: this.props.labels,
          filename
        },
        { download: true }
      )
        .then(() => {
          this.setState({ preparing: false, error: null })
        })
        .catch(error => {
          this.setState({ preparing: false, error })
        })
    }

    const icon = this.state.preparing
      ? <i className='fa fa-spinner fa-pulse mr-2' />
      : <i className='fas fa-download mr-2' />

    if (total < pageSize) {
      return (
        <React.Fragment>
          { this.renderError() }
          <button
            type='button'
            className='tab'
            disabled={this.state.preparing}
            onClick={() => { download(1, this.props.filename) }}
          >
            { icon }
            <FormattedMessage
              id='entities.download.title'
              defaultMessage='Download' />
          </button>
        </React.Fragment>
      )
    }

    const dropdown = 'downloadLinkChoices'
    const pages = range(1, Math.ceil(total / pageSize) + 1)
      .map(index => ({
        currentPage: index,
        filename: `${this.props.filename}-${index}`
      }))

    return (
      <div className='dropdown'>
        { this.renderError() }
        <button
          type='button'
          className='tab'
          disabled={this.state.preparing}
          id={dropdown}
          data-toggle='dropdown'
        >
          { icon }
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
                  key={pageOptions.currentPage}
                  type='button'
                  className='dropdown-item'
                  onClick={() => { download(pageOptions.currentPage, pageOptions.filename) }}
                >
                  { pageOptions.filename }
                </button>
              ))
            }
          </div>
        </div>
      </div>
    )
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
