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

import React from 'react'
import { FormattedMessage, FormattedNumber, FormattedRelativeTime } from 'react-intl'
import { selectUnit } from '@formatjs/intl-utils'
import { getFileName, selectDigitalUnit } from '../../utils'

export default ({ start, list }) => list.length === 0
  ? <div data-qa='tasks-list-empty' />
  : (
    <div data-qa='tasks-list' className='tasks-list'>
      <table className='table table-hover'>
        <thead>
          <tr>
            <th scope='col' />
            <th scope='col'>
              <FormattedMessage
                id='entities.download.task.list.id'
                defaultMessage='Task ID'
              />
            </th>
            <th scope='col'>
              <FormattedMessage
                id='entities.download.task.list.user'
                defaultMessage='Requested By'
              />
            </th>
            <th scope='col'>
              <FormattedMessage
                id='entities.download.task.list.date'
                defaultMessage='When'
              />
            </th>
            <th scope='col'>
              <FormattedMessage
                id='entities.download.task.list.status.records'
                defaultMessage='Status records'
              />
            </th>
            <th scope='col'>
              <FormattedMessage
                id='entities.download.task.list.status.attachments'
                defaultMessage='Status attachments'
              />
            </th>
            <th scope='col'>
              <FormattedMessage
                id='entities.download.task.list.files'
                defaultMessage='Files'
              />
            </th>
          </tr>
        </thead>

        <tbody className='tasks'>
          {
            list.map((task, index) => {
              const { value, unit } = selectUnit(new Date(task.created))
              return (
                <tr key={task.id} data-qa='task-item'>
                  <td scope='row'>{(start || 0) + index}</td>
                  <td data-qa='id'>
                    {task.id}
                  </td>
                  <td>
                    <i className='fas fa-user mr-2' />
                    {task.created_by}
                  </td>
                  <td>
                    <i className='fas fa-clock mr-2' />
                    <FormattedRelativeTime value={value} unit={unit} />
                  </td>
                  <td className={`status ${(task.status_records || '').toLowerCase()}`}>
                    {task.status_records || '—'}
                  </td>
                  <td className={`status ${(task.status_attachments || '').toLowerCase()}`}>
                    {task.status_attachments || '—'}
                  </td>
                  <td>
                    <ul data-qa='task-files' className='files'>
                      {
                        task.files.map((file, jndex) => {
                          const { unit, value } = selectDigitalUnit(file.size)
                          return (
                            <li key={jndex} className='mb-2'>
                              <a href={file.file_url} className='mr-2'>
                                <i className='fas fa-download mr-2' />
                                {getFileName(file.name)}
                              </a>
                              <div className='ml-4'>
                                (
                                <small title={`${file.size} bytes`}>
                                  <FormattedMessage
                                    id='entities.download.task.list.file.size'
                                    defaultMessage='size'
                                  />:&nbsp;
                                  <FormattedNumber
                                    maximumFractionDigits='1'
                                    style='unit'
                                    unit={unit}
                                    unitDisplay='narrow'
                                    value={value}
                                  />
                                </small>,
                                <small className='ml-2'>
                                  <FormattedMessage
                                    id='entities.download.task.list.file.md5'
                                    defaultMessage='md5'
                                  />: {file.md5sum}
                                </small>
                                )
                              </div>
                            </li>
                          )
                        })
                      }
                    </ul>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  )
