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
import { defineMessages, injectIntl } from 'react-intl'

import { PaginationContainer } from '../components'
import { getSurveysAPIPath } from '../utils/paths'

import SurveysListCards from './SurveysListCards'
import SurveysListTable from './SurveysListTable'

const MESSAGES = defineMessages({
  active: {
    defaultMessage: 'Active Surveys',
    id: 'surveys.list.active.title'
  },
  inactive: {
    defaultMessage: 'Inactive Surveys',
    id: 'surveys.list.inactive.title'
  }
})

const SurveysList = ({ intl: { formatMessage } }) => (
  <div className='surveys-list'>
    <div data-qa='surveys-active'>
      <h4 className='title'>
        {formatMessage(MESSAGES.active)}
      </h4>

      <PaginationContainer
        pageSize={12}
        url={getSurveysAPIPath({ withStats: true, active: true })}
        position='bottom'
        listComponent={SurveysListCards}
        titleBar={formatMessage(MESSAGES.active)}
        search
        showPrevious
        showNext
      />
    </div>

    <div data-qa='surveys-inactive' className='mt-5'>
      <h4 className='section-title title'>
        {formatMessage(MESSAGES.inactive)}
      </h4>

      <PaginationContainer
        pageSize={10}
        url={getSurveysAPIPath({ withStats: true, active: false })}
        position='bottom'
        listComponent={SurveysListTable}
        titleBar={formatMessage(MESSAGES.inactive)}
        search
        showPrevious
        showNext
      />
    </div>
  </div>
)

// Include this to enable `props.intl` for this component.
export default injectIntl(SurveysList)
