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
import { FormattedMessage, FormattedNumber } from 'react-intl'

import { getSurveysPath } from '../utils/paths'
import SurveyDates from './SurveyDates'

const SurveyCard = ({ survey }) => (
  <a
    data-qa={`survey-card-${survey.id}`}
    href={getSurveysPath({ action: 'view', id: survey.id })}
    className='card'
  >
    <h3 className='card-header'>{survey.name}</h3>
    <div className='card-block'>
      <SurveyDates survey={survey} />

      <p className='card-display text-center'>
        <span className='card-number'>
          <FormattedNumber value={survey.entities_count} />

          {survey.pending_submissions_count > 0 && (
            <small>
              (<FormattedNumber value={survey.pending_submissions_count} />)
            </small>
          )}
        </span>
        <FormattedMessage
          id='survey.card.entities'
          defaultMessage='records'
        />
      </p>
    </div>
  </a>
)

export default SurveyCard
