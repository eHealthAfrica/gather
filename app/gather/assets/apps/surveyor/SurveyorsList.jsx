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
import { FormattedMessage } from 'react-intl'
import { getSurveyorsPath } from '../utils/paths'

export default ({ list }) => list.length ? (
  <div data-qa='surveyors-list' className='surveyors-list'>
    <div className='content'>
      <div className='row header'>
        <div className='col-4'>
          <h4 className='title'>
            <FormattedMessage
              id='surveyor.list.title.surveyors'
              defaultMessage='Surveyors'
            />
          </h4>
        </div>
        <div className='col-6'>
          <h4 className='title'>
            <FormattedMessage
              id='surveyor.list.title.surveys'
              defaultMessage='Assigned Surveys'
            />
          </h4>
        </div>
        <div className='col-2' />
      </div>
      <div className='surveyors'>
        {
          list.map(({ id, username, project_names: projects }) => (
            <div key={id} data-qa='surveyor-list-item' className='row'>
              <div data-qa='surveyor-name' className='col-4'>
                <i className='fas fa-user mr-2' />
                {username}
              </div>
              <div data-qa='surveyor-projects' className='col-6 surveys'>
                {projects && projects.length ? projects.join(', ') : '-'}
              </div>
              <div className='col-2'>
                <a
                  href={getSurveyorsPath({ action: 'edit', id })}
                  role='button'
                  className='btn btn-sm btn-secondary icon-only float-right'
                >
                  <i className='fas fa-pencil-alt' />
                </a>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  </div>
) : <div data-qa='surveyors-list-empty' />
