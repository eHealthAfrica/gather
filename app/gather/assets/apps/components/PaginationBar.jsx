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
import { hot } from 'react-hot-loader/root'

const MESSAGES = defineMessages({
  first: {
    defaultMessage: 'First',
    id: 'pagination.first'
  },
  last: {
    defaultMessage: 'Last',
    id: 'pagination.last'
  },

  previous: {
    defaultMessage: 'Previous',
    id: 'pagination.previous'
  },
  next: {
    defaultMessage: 'Next',
    id: 'pagination.next'
  },

  search: {
    defaultMessage: 'Search…',
    id: 'pagination.search'
  },

  record: {
    defaultMessage: 'Record {current} of {total}',
    id: 'pagination.type.record'
  },
  page: {
    defaultMessage: 'Page {current} of {total}',
    id: 'pagination.type.page'
  }
})

const getNumberOfPages = (props) => {
  return Math.ceil(props.records / props.pageSize)
}

/**
 * PaginationBar component.
 *
 * Renders the bar with:
 *  - the search input (optional),
 *  - the list with the available page sizes,
 *  - the current page, an interactive input to go to the indicated page, and
 *  - the pagination buttons:
 *     - FIRST,
 *     - PREVIOUS,
 *     - NEXT and
 *     - LAST.
 */

class PaginationBar extends Component {
  constructor (props) {
    super(props)

    this.state = {
      initialPage: props.currentPage,
      currentPage: props.currentPage
    }
  }

  static getDerivedStateFromProps (props, state) {
    if (props.currentPage !== state.initialPage) {
      return {
        initialPage: props.currentPage,
        currentPage: Math.min(Math.max(1, props.currentPage), getNumberOfPages(props))
      }
    }
    return null
  }

  render () {
    const showNavigationButtons = (this.props.records > this.props.pageSize)
    const showPageSizesSelect = (
      this.props.sizes &&
      this.props.sizes.length > 1 &&
      this.props.records > this.props.sizes[0]
    )

    const componentShouldRender = () => {
      if (this.props.search && this.state.search) {
        return true // searching, no matter the number of records
      }

      if (this.props.records === 0) {
        return false // nothing to display, we do not need the bar
      }

      return this.props.search || showNavigationButtons || showPageSizesSelect
    }

    if (!componentShouldRender()) {
      return <div />
    }

    return (
      <nav data-qa='data-pagination' className='pagination-bar'>
        {/* render SEARCH */}
        {this.props.search && this.renderSearchBar()}
        {/* render NAVIGATION BUTTONS and CURRENT PAGE input */}
        {showNavigationButtons && this.renderNavigationButtons()}
        {/* render PAGE SIZE options */}
        {showPageSizesSelect && this.renderPageSizes()}
      </nav>
    )
  }

  renderSearchBar () {
    const onChange = (event) => {
      this.setState({ [event.target.name]: event.target.value })
    }
    const onKeyUp = (event) => {
      if (event.key === 'Enter') {
        this.props.onSearch(this.state.search)
        this.state.currentSearch = this.state.search
      }
    }
    const { formatMessage } = this.props.intl

    return (
      <div data-qa='data-pagination-search' className='search'>
        <input
          type='search'
          name='search'
          placeholder={formatMessage(MESSAGES.search)}
          value={this.state.search || ''}
          className={(this.state.search ? 'value' : '')}
          onChange={onChange}
          onKeyUp={onKeyUp}
        />
      </div>
    )
  }

  renderNavigationButtons () {
    return (
      <ul data-qa='data-pagination-buttons' className='pagination'>
        {/* go to FIRST page */}
        {this.renderLinkToPage('first')}

        {/* go to PREVIOUS page */}
        {this.renderLinkToPage('previous')}

        {/* CURRENT page */}
        <li className='page-item disabled'>
          <FormattedMessage
            {...MESSAGES[(this.props.pageSize === 1 ? 'record' : 'page')]}
            values={{
              current: this.renderCurrentPage(),
              total: this.renderNumberOfPages()
            }}
          />
        </li>

        {/* go to NEXT page */}
        {this.renderLinkToPage('next')}

        {/* go to LAST page */}
        {this.renderLinkToPage('last')}
      </ul>
    )
  }

  renderNumberOfPages () {
    return (
      <span data-qa='data-pagination-total'>
        <FormattedNumber value={getNumberOfPages(this.props)} />
      </span>
    )
  }

  renderCurrentPage () {
    const numberOfPages = getNumberOfPages(this.props)

    // indicates if the value in the input reflects the current page or
    // if it is still pending.
    const isPending = (this.state.currentPage !== this.props.currentPage)

    const onChangePage = (event) => {
      const newPage = parseInt(event.target.value || 0, 10)
      const currentPage = Math.min(Math.max(1, newPage), numberOfPages)
      this.setState({ currentPage })
    }

    const onBlurPage = () => {
      if (this.state.currentPage !== this.props.currentPage) {
        this.props.goToPage(this.state.currentPage)
      }
    }

    const onKeyUp = (event) => {
      if (event.key === 'Enter') {
        onBlurPage()
      }
    }

    return (
      <span
        data-qa='data-pagination-page'
        className={`current-page ${isPending ? 'pending' : ''}`}
      >
        <input
          type='number'
          name='currentPage'
          value={this.state.currentPage}
          maxLength={Math.ceil(numberOfPages / 10) + 1}
          min={1}
          max={numberOfPages}
          onChange={onChangePage}
          onKeyUp={onKeyUp}
          onBlur={onBlurPage}
        />
      </span>
    )
  }

  renderLinkToPage (pageName) {
    const { formatMessage } = this.props.intl
    const { currentPage } = this.props
    const numberOfPages = getNumberOfPages(this.props)
    let newPage = currentPage

    switch (pageName) {
      case 'first':
        // condition: show FIRST link and current PAGE > 1
        if (this.props.showFirst && currentPage > 1) {
          newPage = 1
        }
        break

      case 'previous':
        // condition: show NEXT link and current PAGE > 1
        // except: show FIRST and current PAGE = 2
        if (this.props.showPrevious && currentPage > 1 &&
          !(this.props.showFirst && currentPage === 2)) {
          newPage = currentPage - 1
        }
        break

      case 'next':
        // condition: show NEXT link and current PAGE < total PAGES
        // except: show LAST and current PAGE = total PAGES - 1
        if (this.props.showNext && currentPage < numberOfPages &&
          !(this.props.showLast && currentPage === numberOfPages - 1)) {
          newPage = currentPage + 1
        }
        break

      case 'last':
        // condition: show LAST link and current PAGE < total PAGES
        if (this.props.showLast && currentPage < numberOfPages) {
          newPage = numberOfPages
        }
        break
    }

    if (newPage === currentPage) {
      return ''
    }

    return (
      <li data-qa={`data-pagination-${pageName}`} className='page-item'>
        <button
          type='button'
          className='page-link'
          onClick={() => this.props.goToPage(newPage)}
          aria-label={formatMessage(MESSAGES[pageName])}
        >
          <FormattedMessage {...MESSAGES[pageName]} />
        </button>
      </li>
    )
  }

  renderPageSizes () {
    const onChange = (event) => {
      const newPageSize = parseInt(event.target.value, 10)

      if (newPageSize !== this.props.pageSize) {
        this.props.setPageSize(newPageSize)
      }
    }

    return (
      <div data-qa='data-pagination-sizes' className='sizes'>
        <FormattedMessage
          id='pagination.sizes.select'
          defaultMessage='Choose size'
        />
        <select value={this.props.pageSize} onChange={onChange}>
          {
            this.props.sizes.map(size => (
              <option
                key={size}
                value={size}
                data-qa={`data-pagination-size-${size}`}
              >
                {size}
              </option>
            ))
          }
        </select>
      </div>
    )
  }
}

// Include this to enable `this.props.intl` for this component.
// Include this to enable HMR for this module
export default hot(injectIntl(PaginationBar))
