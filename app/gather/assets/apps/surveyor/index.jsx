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

import { FetchUrlsContainer, PaginationContainer } from '../components'
import { getSurveyorsAPIPath, getSurveysAPIPath } from '../utils/paths'
import { ODK_APP, MAX_FETCH_SIZE } from '../utils/constants'

import SurveyorForm from './SurveyorForm'
import SurveyorsList from './SurveyorsList'

const SurveyorDispatcher = ({ action, surveyorId }) => {
  switch (action) {
    case 'add': {
      const addUrls = [
        {
          name: 'surveys',
          url: getSurveysAPIPath({
            app: ODK_APP,
            fields: ['project_id', 'name'].join(','),
            page: 1,
            pageSize: MAX_FETCH_SIZE
          })
        }
      ]

      return <FetchUrlsContainer urls={addUrls} targetComponent={SurveyorForm} />
    }

    case 'edit': {
      const editUrls = [
        {
          name: 'surveyor',
          url: getSurveyorsAPIPath({ id: surveyorId })
        },
        {
          name: 'surveys',
          url: getSurveysAPIPath({
            app: ODK_APP,
            fields: ['project_id', 'name'].join(','),
            page: 1,
            pageSize: MAX_FETCH_SIZE
          })
        }
      ]

      return <FetchUrlsContainer urls={editUrls} targetComponent={SurveyorForm} />
    }

    default:
      return (
        <PaginationContainer
          pageSize={36}
          url={getSurveyorsAPIPath({})}
          position='top'
          listComponent={SurveyorsList}
          search
          showPrevious
          showNext
        />
      )
  }
}

export default SurveyorDispatcher
