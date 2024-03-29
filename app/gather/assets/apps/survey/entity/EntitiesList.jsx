/*
 * Copyright (C) 2023 by eHealth Africa : http://www.eHealthAfrica.org
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

import React from 'react'
import { FormattedMessage } from 'react-intl'

import { attachmentsToLinks } from './utils'
import { flatten, inflate, getLabel } from '../../utils/types'
import { JSONViewer, LinksList } from '../../components'

/**
 *  Data
 *  ====
 *  {
 *    a: {
 *      b: {
 *        c: 1,
 *        d: 2
 *      },
 *      e: {
 *        f: true
 *      },
 *      g: []
 *    },
 *    h: 0
 *  }
 *
 *  Paths
 *  =====
 *  [
 *    'a.b.c',
 *    'a.b.d',
 *    'a.e.f',
 *    'a.g',
 *    'h'
 *  ]
 *
 *  Table header
 *  ============
 *  +---+------------+----------------+---+
 *  | # | Submitted  | A              | H |
 *  |   |            +-------+---+----+   |
 *  |   |            | B     | E | G  |   |
 *  |   |            +---+---+---+    |   |
 *  |   |            | C | D | F |    |   |
 *  +---+------------+---+---+---+----+---+
 *  | 1 | 1999-01-01 | 1 | 2 | T | [] | 0 |
 *  +---+------------+---+---+---+----+---+
 *
 */
const Header = ({ paths, labels }) => {
  const headers = inflate(paths)
  const rows = headers.length

  return (
    <thead>
      <tr key={0}>
        <th rowSpan={rows || 1} />
        <th rowSpan={rows || 1}>
          <FormattedMessage
            id='entity.list.table.status'
            defaultMessage='Status'
          />
        </th>
        <th rowSpan={rows || 1}>
          <FormattedMessage
            id='entity.list.table.attachments'
            defaultMessage='Attachments'
          />
        </th>

        {
          headers
            .filter((_, index) => index === 0)
            .map(row => (
              Object.keys(row).map(column => (
                <th
                  key={row[column].key}
                  title={row[column].path}
                  rowSpan={row[column].isLeaf ? rows : 1}
                  colSpan={row[column].siblings}
                >
                  {getLabel(row[column].path, labels)}
                </th>
              ))
            ))
        }
      </tr>

      {
        headers
          .filter((_, index) => index > 0)
          .map((row, index) => (
            <tr key={index}>
              {
                Object.keys(row).map(column => (
                  <th
                    key={row[column].key}
                    title={row[column].path}
                    rowSpan={row[column].isLeaf ? (rows - index - 1) : 1}
                    colSpan={row[column].siblings}
                  >
                    {getLabel(row[column].path, labels)}
                  </th>
                ))
              }
            </tr>
          ))
      }
    </thead>
  )
}

const Row = ({ paths, labels, row, number }) => {
  const flattenPayload = flatten({ ...row.payload })
  const attachments = attachmentsToLinks(row.attachments)

  return (
    <tr data-qa={`entity-row-${row.id}`}>
      <td scope='row'>{number}</td>
      <td>
        {row.status}
      </td>
      <td>
        <LinksList list={attachments} />
      </td>

      {
        paths.map(key => (
          <td key={key}>
            <JSONViewer
              data={flattenPayload[key]}
              labels={labels}
              labelRoot={key + '.'}
              links={attachments}
            />
          </td>
        ))
      }
    </tr>
  )
}

const Table = ({ list, paths, labels, start }) => {
  if (list.length === 0) {
    return <div data-qa='entities-list-empty' />
  }

  return (
    <div data-qa='entities-list' className='x-0'>
      <div className='survey-content'>
        <table className='table table-sm table-hover'>
          <Header paths={paths} labels={labels} />
          <tbody>
            {
              list.map((row, index) => (
                <Row
                  key={start + index}
                  paths={paths}
                  labels={labels}
                  row={row}
                  number={start + index}
                />
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table
