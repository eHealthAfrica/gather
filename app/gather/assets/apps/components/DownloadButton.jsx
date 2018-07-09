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

import React, {Component} from 'react'
import { FormattedMessage } from 'react-intl'

import ErrorAlert from './ErrorAlert'
import Portal from './Portal'

import { getData } from '../utils/request'
import { buildQueryString } from '../utils/paths'
import { isMounted } from '../utils/dom'
import { generateFileContent, downloadContent } from '../utils/download'

const PAGE_SIZE = 5000

/**
 * DownloadButton component.
 *
 * Renders a button that will create an CSV/XLSX file with
 * the data fetched from the given url.
 */

export default class DownloadButton extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <React.Fragment>
        <button
          data-qa='download-button'
          type='button'
          disabled={this.state.inProgress}
          className={this.props.className || 'btn btn-primary'}
          onClick={this.startDownload.bind(this)}>
          <i className='fas fa-download mr-2' />
          { this.props.buttonLabel ||
            <FormattedMessage
              id='download.button.action.download'
              defaultMessage='Download' />
          }
        </button>
        { this.renderDownloadState() }
      </React.Fragment>
    )
  }

  renderDownloadState () {
    const {inProgress, error} = this.state
    if (!inProgress && !error) {
      return ''
    }

    return (
      <Portal>
        <div className='modal show'>
          <div className='modal-dialog modal-md'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>
                  <i className='fas fa-download mr-2' />
                  <FormattedMessage
                    id='download.action.title'
                    defaultMessage='Download data' />
                </h5>
                { error &&
                  <button
                    data-qa='download-close-x'
                    type='button'
                    className='close'
                    onClick={() => { this.setState({ inProgress: false, error: null }) }}>
                    <span className='pull-right'>&times;</span>
                  </button>
                }
              </div>

              <div className='modal-body'>
                { inProgress &&
                  <div data-qa='download-inprogress' className='container-fluid'>
                    <p>
                      <i className='fas fa-spin fa-cog mr-2' />
                      <FormattedMessage
                        id='download.action.inprogress'
                        defaultMessage='Preparing data in progress…' />
                    </p>
                    <p className='mt-2'>
                      <FormattedMessage
                        id='download.action.page'
                        defaultMessage='Processing page: {page}'
                        values={{page: this.state.page}}
                      />
                    </p>
                    <p className='mt-2'>
                      <FormattedMessage
                        id='download.action.page.size'
                        defaultMessage='Page size: {size} records'
                        values={{size: PAGE_SIZE}}
                      />
                    </p>
                  </div>
                }

                { error &&
                  <div data-qa='download-erred' className='container-fluid'>
                    <p>
                      <i className='fas fa-exclamation-triangle mr-1' />
                      <FormattedMessage
                        id='download.action.error'
                        defaultMessage={`
                          Download was not successful, maybe requested resource does
                          not exists or there was a server error while requesting for it.
                        `}
                      />
                    </p>
                    <ErrorAlert errors={error.message} />
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </Portal>
    )
  }

  startDownload () {
    this.setState({
      inProgress: true,
      page: 1,
      content: {},
      error: null
    }, this.loadData)
  }

  loadData () {
    const {page} = this.state
    const urlSep = this.props.url.indexOf('?') > -1 ? '&' : '?'
    const url = `${this.props.url}${urlSep}${buildQueryString({page, pageSize: PAGE_SIZE})}`

    return getData(url)
      .then(response => {
        const results = this.props.parser
          ? response.results.map(this.props.parser)
          : response.results
        const content = generateFileContent(results, this.state.content)

        isMounted(this) && this.setState({
          content,
          page: page + 1, // next bunch of records
          inProgress: response.next !== null, // something else?
          error: null
        }, () => {
          if (!this.state.inProgress) {
            downloadContent(this.state.content, this.props.filePrefix, this.props.labels)
          } else {
            this.loadData()
          }
        })
      })
      .catch(error => {
        isMounted(this) && this.setState({
          inProgress: false,
          error
        })
      })
  }
}
