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
import {
  defineMessages,
  injectIntl,
  FormattedMessage,
  FormattedNumber
} from 'react-intl'

import { getFileName, selectDigitalUnit } from '../../utils'
import { getExportTasksAPIPath } from '../../utils/paths'
import { deleteData } from '../../utils/request'

import { ConfirmButton, RelativeTime } from '../../components'

const MESSAGES = defineMessages({
  deleteButton: {
    defaultMessage: 'Delete task',
    id: 'task.item.action.delete'
  },
  deleteConfirm: {
    defaultMessage: 'Are you sure you want to delete the task “{id}”?',
    id: 'task.item.action.delete.confirm'
  },
  deleteError: {
    defaultMessage: 'An error occurred while deleting the task “{id}”.',
    id: 'task.list.action.delete.error'
  }
})

const EntitiesDownloadTaskList = ({
  start,
  list,
  refresh,
  intl: { formatMessage }
}) => list.length === 0
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
            <th />
          </tr>
        </thead>

        <tbody className='tasks'>
          {
            list.map((task, index) => (
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
                  <RelativeTime date={task.created} />
                </td>
                <td
                  className={`status ${(task.status_records || '').toLowerCase()}`}
                  title={task.error_records || ''}
                >
                  {task.error_records && <i className='mr-2 fas fa-exclamation-triangle' />}
                  {task.status_records || '—'}
                </td>
                <td
                  className={`status ${(task.status_attachments || '').toLowerCase()}`}
                  title={task.error_attachments || ''}
                >
                  {task.error_attachments && <i className='mr-2 fas fa-exclamation-triangle' />}
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
                <td>
                  <ConfirmButton
                    className='btn btn-sm icon-only btn-danger delete-form-button mr-2'
                    cancelable
                    onConfirm={() => {
                      const url = getExportTasksAPIPath({ id: task.id })
                      return deleteData(url)
                        .then(() => {
                          refresh()
                        })
                        .catch(() => {
                          window.alert(formatMessage(MESSAGES.deleteError, { ...task }))
                          refresh()
                        })
                    }}
                    title={
                      <span>
                        <i className='fas fa-trash mr-1' />
                        <FormattedMessage
                          id='task.item.delete.title'
                          defaultMessage='Delete task'
                        />
                      </span>
                    }
                    message={formatMessage(MESSAGES.deleteConfirm, { ...task })}
                    buttonLabel={<i className='fas fa-times' />}
                  />
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )

// Include this to enable `this.props.intl` for this component.
export default injectIntl(EntitiesDownloadTaskList)
