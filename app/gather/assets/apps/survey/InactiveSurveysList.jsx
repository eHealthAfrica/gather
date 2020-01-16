/*
 * Copyright (C) 2019 by eHealth Africa : http://www.eHealthAfrica.org
 *
 * See the NOTICE file distributed with this work for additional information
 * regarding copyright ownership.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react'
import moment from 'moment'
import { FormattedMessage, FormattedNumber, FormattedDate } from 'react-intl'
import { getSurveysPath } from '../utils/paths'

const InactiveSurveysList = ({ list }) => (
  <div data-qa='surveys-list-inactive' className='surveys-list inactive-surveys-list'>
    <div className='section-title title'>
      <FormattedMessage
        id='surveys.list.inactive.title'
        defaultMessage='Inactive Surveys'
      />
    </div>

    <div className='content'>
      <div className='row headers'>
        <div className='col-6' />
        <div className='col-2'>
          <h4 className='title vline'>
            <FormattedMessage
              id='surveys.list.inactive.first.data.entry'
              defaultMessage='first data entry'
            />
          </h4>
        </div>
        <div className='col-2'>
          <h4 className='title vline'>
            <FormattedMessage
              id='surveys.list.inactive.last.data.entry'
              defaultMessage='last data entry'
            />
          </h4>
        </div>
        <div className='col-1'>
          <h4 className='title'>
            <FormattedMessage
              id='surveys.list.inactive.duration'
              defaultMessage='duration'
            />
          </h4>
        </div>
        <div className='col-1'>
          <h4 className='title records'>
            <FormattedMessage
              id='surveys.list.inactive.records'
              defaultMessage='records'
            />
          </h4>
        </div>
      </div>

      {
        list.map(({
          id,
          name,
          first_submission: firstSubmission,
          last_submission: lastSubmission,
          entities_count: entitiesCount,
          submissions_count: submissionsCount
        }) => (
          <div key={id} data-qa='inactive-survey' className='row entries'>
            <div className='col-6 name'>
              <a href={getSurveysPath({ action: 'view', id })}>{name}</a>
            </div>
            <div className='col-2 title'>
              {
                submissionsCount ? (
                  <FormattedDate
                    value={firstSubmission}
                    year='numeric'
                    month='short'
                    day='numeric'
                  />
                ) : '-'
              }
            </div>
            <div className='col-2 title'>
              {
                submissionsCount ? (
                  <FormattedDate
                    value={lastSubmission}
                    year='numeric'
                    month='short'
                    day='numeric'
                  />
                ) : '-'
              }
            </div>
            <div className='col-1 title vline'>
              {
                submissionsCount ? (
                  <>
                    <FormattedNumber
                      value={
                        moment(lastSubmission).diff(moment(firstSubmission), 'days') + 1
                      }
                    />
                    <span className='ml-1'>
                      <FormattedMessage
                        id='surveys.list.inactive.duration.days'
                        defaultMessage='days'
                      />
                    </span>
                  </>
                ) : '-'
              }
            </div>
            <div className='col-1 record'>
              <FormattedNumber value={entitiesCount} />
            </div>
          </div>
        ))
      }
    </div>
  </div>
)

export default InactiveSurveysList
