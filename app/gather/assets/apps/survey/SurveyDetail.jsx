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
import { FormattedMessage, FormattedNumber } from 'react-intl'

import SurveyDates from './SurveyDates'

export default class SurveyDetail extends Component {
  render () {
    const {survey} = this.props

    return (
      <div data-qa={`survey-detail-${survey.id}`} className='survey-detail'>
        <div className='survey-dates'>
          <h5 className='title'>
            <FormattedMessage
              id='survey.detail.date'
              defaultMessage='Dates' />
          </h5>
          <SurveyDates survey={survey} showDuration />
        </div>

        <div className='survey-records'>
          <span className='record-number mr-1'>
            <FormattedNumber value={survey.submission_count} />
          </span>
          <FormattedMessage
            id='survey.detail.submissions'
            defaultMessage='records' />
        </div>
      </div>
    )
  }
}
