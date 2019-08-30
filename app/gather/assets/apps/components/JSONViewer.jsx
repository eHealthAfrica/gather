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
  FormattedDate,
  FormattedMessage,
  FormattedNumber,
  FormattedTime
} from 'react-intl'
import { hot } from 'react-hot-loader/root'

import { getLabel, getType } from '../utils/types'
import Link from './Link'

/**
 * JSONViewer component.
 *
 * Renders a JSON object in "pretty" format.
 *
 * Properties:
 *   - `data`:        The object.
 *   - `links`:       The list of links ({url, name}) associated with this object.
 *                    Take a look at the `renderString` method.
 *   - `labels`:      A map with the possible object labels.
 *                    The keys are the jsonpaths and the values the labels.
 *   - `labelRoot`:   The prefix needed to look for the associated label.
 */

class JSONViewer extends Component {
  render () {
    const { data } = this.props

    return (
      <div data-qa='json-data' className='data'>
        {this.renderValue(data)}
      </div>
    )
  }

  renderValue (value) {
    if (!getType(value)) {
      return this.renderEmptyValue()
    }

    // check the object type
    switch (getType(value)) {
      case 'array':
        return this.renderArray(value)

      case 'object':
        return this.renderObject(value)

      case 'int':
        return this.renderInteger(value)

      case 'float':
        return this.renderFloat(value)

      case 'bool':
        return this.renderBoolean(value)

      case 'datetime':
        return this.renderDateTime(value)

      case 'date':
        return this.renderDate(value)

      case 'time':
        // special case with `react-intl`, it needs the full date with time
        // workaround: print it as it comes
        return this.renderString(value)

      default:
        return this.renderString(value)
    }
  }

  renderEmptyValue () {
    return (
      <span className='empty'>
        –
      </span>
    )
  }

  renderString (value) {
    // There is an special case with strings,
    // they can also be one of the linked attachments.
    // In those case we should be able to replace
    // the text value with the link.
    // Assumption: there are no duplicated attachment entries
    if (this.props.links && this.props.links.length > 0) {
      const link = this.props.links.find(l => l.name === value)
      if (link) {
        return <Link className='value' link={link} />
      }
    }
    return <span className='value'>{value}</span>
  }

  renderInteger (value) {
    return (
      <span className='value' title={value}>
        <FormattedNumber value={value} />
      </span>
    )
  }

  renderFloat (value) {
    return (
      <span className='value' title={value}>
        <FormattedNumber
          value={value}
          style='decimal'
          minimumFractionDigits={6}
        />
      </span>
    )
  }

  renderDateTime (value) {
    return (
      <span className='value' title={value}>
        {this.renderDate(value)}
        {' - '}
        {this.renderTime(value)}
      </span>
    )
  }

  renderDate (value) {
    return (
      <span className='value' title={value}>
        <FormattedDate
          value={value}
          year='numeric'
          month='long'
          day='numeric'
        />
      </span>
    )
  }

  renderTime (value) {
    return (
      <span className='value' title={value}>
        <FormattedTime
          value={value}
          hour12={false}
          hour='2-digit'
          minute='2-digit'
          second='2-digit'
          timeZoneName='short'
        />
      </span>
    )
  }

  renderBoolean (value) {
    return (
      <span className='value' title={value.toString()}>
        {
          value
            ? <FormattedMessage id='json.viewer.boolean.true' defaultMessage='Yes' />
            : <FormattedMessage id='json.viewer.boolean.false' defaultMessage='No' />
        }
      </span>
    )
  }

  renderArray (values) {
    return (
      <JSONArrayViewer
        values={values}
        links={this.props.links}
        labels={this.props.labels}
        labelRoot={(this.props.labelRoot || '') + '#.'}
      />
    )
  }

  renderObject (value) {
    return (
      <JSONObjectViewer
        value={value}
        links={this.props.links}
        labels={this.props.labels}
        labelRoot={(this.props.labelRoot || '')}
        collapsible={this.props.collapsible}
      />
    )
  }
}

class JSONObjectViewer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      collapsed: props.collapsible
    }
  }

  render () {
    const { collapsed } = this.state
    const { value, collapsible } = this.props

    if (collapsible && collapsed) {
      return (
        <div>
          <button
            type='button'
            className='btn icon-only btn-expand'
            onClick={this.toggleView.bind(this)}
          >
            <i className='fas fa-plus' />
          </button>
          <span className='badge'>…</span>
        </div>
      )
    }

    return (
      <div>
        {
          collapsible &&
            <button
              type='button'
              className='btn icon-only btn-collapse'
              onClick={this.toggleView.bind(this)}
            >
              <i className='fas fa-minus' />
            </button>
        }
        {
          Object.keys(value).map(key => (
            <div key={key} className={`property ${getType(value[key]) || ''}`}>
              <div className={`property-title ${getType(value[key]) ? '' : 'empty'}`}>
                {getLabel(this.props.labelRoot + key, this.props.labels)}
              </div>
              <div className='property-value'>
                <JSONViewer
                  data={value[key]}
                  links={this.props.links}
                  labels={this.props.labels}
                  labelRoot={this.props.labelRoot + key + '.'}
                  collapsible
                />
              </div>
            </div>
          ))
        }
      </div>
    )
  }

  toggleView () {
    this.setState({ collapsed: !this.state.collapsed })
  }
}

class JSONArrayViewer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      collapsed: true
    }
  }

  render () {
    const { collapsed } = this.state
    const { values } = this.props

    if (collapsed) {
      return (
        <div>
          <button
            type='button'
            className='btn icon-only btn-expand'
            onClick={this.toggleView.bind(this)}
          >
            <i className='fas fa-plus' />
          </button>

          <span className='badge'>
            <FormattedNumber value={values.length} />
          </span>
        </div>
      )
    }

    return (
      <div>
        <button
          type='button'
          className='btn icon-only btn-collapse'
          onClick={this.toggleView.bind(this)}
        >
          <i className='fas fa-minus' />
        </button>
        <ol className='property-list'>
          {
            values.map((value, index) => (
              <li key={index} className='property-item'>
                <JSONViewer
                  data={value}
                  links={this.props.links}
                  labels={this.props.labels}
                  labelRoot={this.props.labelRoot}
                />
              </li>
            ))
          }
        </ol>
      </div>
    )
  }

  toggleView () {
    this.setState({ collapsed: !this.state.collapsed })
  }
}

// Include this to enable HMR for this module
export default hot(JSONViewer)
