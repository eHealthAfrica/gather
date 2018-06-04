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

import { flatten, inflate } from '../utils/types'
import {
  JSONViewer,
  FullDateTime,
  LinksList,
  normalizeLinksList
} from '../components'

export default class SubmissionsList extends Component {
  render () {
    const {list} = this.props

    if (list.length === 0) {
      return <div data-qa='submissions-list-empty' />
    }

    return (
      <div data-qa='submissions-list' className='x-0'>
        <div className='survey-content'>
          <table className='table table-sm'>
            { this.renderHeader() }
            <tbody>
              { list.map((submission, index) => this.renderSubmission(submission, index)) }
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  renderHeader () {
    /****************************************************************
    Data
    ====
    {
      a: {
        b: {
          c: 1,
          d: 2
        },
        e: {
          f: true
        },
        g: []
      },
      h: 0
    }

    Columns
    =======
    [
      'a.b.c',
      'a.b.d',
      'a.e.f',
      'a.g',
      'h'
    ]

    Table header
    ============
    +---+------------++----------------+---+
    | # | Submitted  | A              | H |
    |   |            +-------+---+----+   |
    |   |            | B     | E | G  |   |
    |   |            +---+---+---+    |   |
    |   |            | C | D | F |    |   |
    +---+------------+---+---+---+----+---+
    | 1 | 1999-01-01 | 1 | 2 | T | [] | 0 |
    +---+------------+---+---+---+----+---+

    ****************************************************************/

    const {columns, separator} = this.props
    const headers = inflate(columns, separator)
    const rows = headers.length

    return (
      <thead>
        <tr key={0}>
          <th rowSpan={rows || 1} />
          <th rowSpan={rows || 1}>
            <FormattedMessage
              id='submission.list.table.date'
              defaultMessage='Submitted' />
          </th>
          <th rowSpan={rows || 1}>
            <FormattedMessage
              id='submission.list.table.revision'
              defaultMessage='Revision' />
          </th>
          <th rowSpan={rows || 1}>
            <FormattedMessage
              id='submission.list.table.survey.revision'
              defaultMessage='Survey revision' />
          </th>
          <th rowSpan={rows || 1}>
            <FormattedMessage
              id='submission.list.table.attachments'
              defaultMessage='Attachments' />
          </th>

          {
            headers
              .filter((row, index) => index === 0)
              .map((row, index) => (
                Object.keys(row).map(column => (
                  <th
                    key={row[column].key}
                    title={row[column].path}
                    rowSpan={row[column].isLeaf ? rows : 1}
                    colSpan={row[column].siblings}>
                    { row[column].label }
                  </th>
                ))
              ))
          }
        </tr>

        {
          headers
            .filter((row, index) => index > 0)
            .map((row, index) => (
              <tr key={index}>
                {
                  Object.keys(row).map(column => (
                    <th
                      key={row[column].key}
                      title={row[column].path}
                      rowSpan={row[column].isLeaf ? (rows - index - 1) : 1}
                      colSpan={row[column].siblings}>
                      { row[column].label }
                    </th>
                  ))
                }
              </tr>
            ))
        }
      </thead>
    )
  }

  renderSubmission (submission, index) {
    const {columns, separator} = this.props
    const flattenPayload = flatten({...submission.payload}, separator)
    const links = normalizeLinksList(submission.attachments)

    return (
      <tr data-qa={`submission-row-${submission.id}`} key={submission.id}>
        <td scope='row'>{this.props.start + index}</td>
        <td>
          <FullDateTime date={submission.date} />
        </td>
        <td>
          {submission.revision}
        </td>
        <td>
          {submission.map_revision}
        </td>
        <td>
          <LinksList list={links} />
        </td>

        {
          columns.map(key => (
            <td key={key}>
              <JSONViewer data={flattenPayload[key]} links={links} />
            </td>
          ))
        }
      </tr>
    )
  }
}
