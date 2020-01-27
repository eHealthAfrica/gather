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

import React, { useState } from 'react'
import {
  FormattedDate,
  FormattedMessage,
  FormattedNumber,
  FormattedTime
} from 'react-intl'

import { BLANK, DASH } from '../utils/constants'
import { getLabel, getType } from '../utils/types'
import Link from './Link'

const EmptyValue = () => (
  <span className='empty'>
    {BLANK}
  </span>
)

const IntegerValue = ({ value }) => (
  <span className='value' title={value}>
    <FormattedNumber value={value} />
  </span>
)

const FloatValue = ({ value }) => (
  <span className='value' title={value}>
    <FormattedNumber
      value={value}
      style='decimal'
      minimumFractionDigits={6}
    />
  </span>
)

const BoolValue = ({ value }) => (
  <span className='value' title={value.toString()}>
    {
      value
        ? <FormattedMessage id='json.viewer.boolean.true' defaultMessage='Yes' />
        : <FormattedMessage id='json.viewer.boolean.false' defaultMessage='No' />
    }
  </span>
)

const DateValue = ({ value }) => (
  <span className='value' title={value}>
    <FormattedDate
      value={value}
      year='numeric'
      month='long'
      day='numeric'
    />
  </span>
)

const TimeValue = ({ value }) => (
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

const DateTimeValue = ({ value }) => (
  <span className='value' title={value}>
    <DateValue value={value} /> {DASH} <TimeValue value={value} />
  </span>
)

const StringValue = ({ value, links }) => {
  // There is an special case with strings,
  // they can also be one of the linked attachments.
  // In those case we should be able to replace
  // the text value with the link.
  // Assumption: there are no duplicated attachment entries
  if (links && links.length > 0) {
    const link = links.find(l => l.name === value)
    if (link) {
      return <Link className='value' link={link} />
    }
  }
  return <span className='value'>{value}</span>
}

const ArrayValue = ({ values, links, labels, labelRoot }) => {
  const [collapsed, toggle] = useState(true)

  if (collapsed) {
    return (
      <div>
        <button
          type='button'
          className='btn icon-only btn-expand'
          onClick={() => { toggle(!collapsed) }}
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
        onClick={() => { toggle(!collapsed) }}
      >
        <i className='fas fa-minus' />
      </button>
      <ol className='property-list'>
        {
          values.map((value, index) => (
            <li key={index} className='property-item'>
              <JSONViewer
                data={value}
                links={links}
                labels={labels}
                labelRoot={(labelRoot || '') + '#.'}
              />
            </li>
          ))
        }
      </ol>
    </div>
  )
}

const ObjectValue = ({ value, links, labels, labelRoot, collapsible }) => {
  const [collapsed, toggle] = useState(collapsible)

  if (collapsible && collapsed) {
    return (
      <div>
        <button
          type='button'
          className='btn icon-only btn-expand'
          onClick={() => { toggle(!collapsed) }}
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
            onClick={() => { toggle(!collapsed) }}
          >
            <i className='fas fa-minus' />
          </button>
      }
      {
        Object.keys(value).map(key => (
          <div key={key} className={`property ${getType(value[key]) || ''}`}>
            <div className={`property-title ${getType(value[key]) ? '' : 'empty'}`}>
              {getLabel((labelRoot || '') + key, labels)}
            </div>
            <div className='property-value'>
              <JSONViewer
                data={value[key]}
                links={links}
                labels={labels}
                labelRoot={(labelRoot || '') + key + '.'}
                collapsible
              />
            </div>
          </div>
        ))
      }
    </div>
  )
}

const Value = ({ value, links, labels, labelRoot, collapsible }) => {
  if (!getType(value)) {
    return <EmptyValue />
  }

  // check the object type
  switch (getType(value)) {
    case 'int':
      return <IntegerValue value={value} />

    case 'float':
      return <FloatValue value={value} />

    case 'bool':
      return <BoolValue value={value} />

    case 'date':
      return <DateValue value={value} />

    case 'time':
      // special case with `react-intl`, it needs the full date with time
      // workaround: print it as it comes
      return <StringValue value={value} />

    case 'datetime':
      return <DateTimeValue value={value} />

    case 'array':
      return (
        <ArrayValue
          values={value}
          links={links}
          labels={labels}
          labelRoot={labelRoot}
        />
      )

    case 'object':
      return (
        <ObjectValue
          value={value}
          links={links}
          labels={labels}
          labelRoot={labelRoot}
          collapsible={collapsible}
        />
      )

    default:
      return <StringValue value={value} links={links} />
  }
}

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
 *   - `collapsible`: Indicates if the object properties can be collapsed.
 */

const JSONViewer = ({ data, links, labels, labelRoot, collapsible }) => (
  <div data-qa='json-data' className='data'>
    <Value
      value={data}
      links={links}
      labels={labels}
      labelRoot={labelRoot}
      collapsible={collapsible}
    />
  </div>
)

export default JSONViewer
