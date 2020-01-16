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

import SurveyCard from './SurveyCard'

const ActiveSurveys = ({ list }) => list.length ? (
  <div data-qa='active-surveys' className='active-surveys-list'>
    <h4 className='title'>
      <FormattedMessage
        id='surveys.list.active.title'
        defaultMessage='Active Surveys'
      />
    </h4>

    <div className='surveys-list-cards'>
      {
        list.map(survey => (
          <SurveyCard
            key={survey.id}
            className='col-6 col-sm-4 col-md-3'
            survey={survey}
          />
        ))
      }
    </div>
  </div>
) : <div data-qa='active-surveys-empty' />

export default ActiveSurveys
