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
import { FormattedDate, FormattedMessage, FormattedNumber } from 'react-intl'
import moment from 'moment'

export default class SurveyDates extends Component {
  render () {
    const { survey } = this.props

    return (
      <div
        data-qa={`survey-dates-${survey.id}`}
        className='card-block'>
        <p className='card-text small'>
          <span className='card-dates pr-2'>
            <span className='label mr-1'>
              <FormattedMessage
                id='survey.dates.created'
                defaultMessage='Created at' />
            </span>
            <FormattedDate
              value={survey.created}
              year='numeric'
              month='short'
              day='numeric' />
          </span>

          { survey.submissions_count === 0 && this.renderNoSubmissions() }
          { survey.submissions_count > 0 && this.renderSubmissions() }
          {
            survey.submissions_count > 0 &&
            this.props.showDuration &&
            this.renderSubmissionsDuration()
          }
        </p>
      </div>
    )
  }

  renderNoSubmissions () {
    return (
      <span className='label mr-1'>
        <FormattedMessage
          id='survey.dates.submissions.zero'
          defaultMessage='no data entry' />
      </span>
    )
  }

  renderSubmissions () {
    const { survey } = this.props
    const days = moment(survey.last_submission).diff(moment(survey.first_submission), 'days')

    if (days === 0) {
      return (
        <span className='card-dates pr-2'>
          <span className='label mr-1'>
            <FormattedMessage
              id='survey.dates.submissions.on'
              defaultMessage='data entry on' />
          </span>
          <FormattedDate
            value={survey.first_submission}
            year='numeric'
            month='short'
            day='numeric' />
        </span>
      )
    }

    return (
      <span className='card-dates pr-2'>
        <span className='label mr-1'>
          <FormattedMessage
            id='survey.dates.submissions.from'
            defaultMessage='data entry from' />
        </span>
        <FormattedDate
          value={survey.first_submission}
          year='numeric'
          month='short'
          day='numeric' />
        <span className='label mr-1'>
          <FormattedMessage
            id='survey.dates.submissions.to'
            defaultMessage='to' />
        </span>
        <FormattedDate
          value={survey.last_submission}
          year='numeric'
          month='short'
          day='numeric' />
      </span>
    )
  }

  renderSubmissionsDuration () {
    const { survey } = this.props
    const days = moment(survey.last_submission).diff(moment(survey.first_submission), 'days') + 1

    return (
      <span className='card-dates'>
        <span className='label mr-1'>
          <FormattedMessage
            id='survey.dates.submissions.duration'
            defaultMessage='duration' />
        </span>
        <FormattedNumber value={days} />
        <span className='ml-1'>
          <FormattedMessage
            id='survey.dates.submissions.duration.days'
            defaultMessage='days' />
        </span>
      </span>
    )
  }
}
