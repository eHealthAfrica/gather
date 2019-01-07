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
import { hot } from 'react-hot-loader/root'

import { FetchUrlsContainer, PaginationContainer } from '../components'
import { getSurveyorsAPIPath, getSurveysAPIPath } from '../utils/paths'
import { ODK_APP } from '../utils/constants'

import Survey from './Survey'
import SurveyForm from './SurveyForm'
import SurveysList from './SurveysList'

class SurveyDispatcher extends Component {
  render () {
    const { action, surveyId } = this.props
    const { ODK_ACTIVE } = this.props.settings
    // include settings in response
    const handleResponse = (response) => ({ ...response, settings: this.props.settings })

    switch (action) {
      case 'add':
        const addUrls = []

        if (ODK_ACTIVE) {
          const odkAddUrls = [
            {
              name: 'surveyors',
              url: getSurveyorsAPIPath({ page: 1, pageSize: 1000 })
            }
          ]
          // add odk urls to edit ones
          odkAddUrls.forEach(url => addUrls.push(url))
        }

        return (
          <FetchUrlsContainer
            urls={addUrls}
            targetComponent={SurveyForm}
            handleResponse={handleResponse}
          />
        )

      case 'edit':
        const editUrls = [
          {
            name: 'survey',
            url: getSurveysAPIPath({ id: surveyId })
          }
        ]

        if (ODK_ACTIVE) {
          const odkEditUrls = [
            {
              name: 'odkSurvey',
              url: getSurveysAPIPath({ app: ODK_APP, id: surveyId }),
              force: {
                url: getSurveysAPIPath({ app: ODK_APP }),
                data: { project_id: surveyId }
              }
            },
            {
              name: 'surveyors',
              url: getSurveyorsAPIPath({ page: 1, pageSize: 1000 })
            }
          ]

          // add odk urls to edit ones
          odkEditUrls.forEach(url => editUrls.push(url))
        }

        return (
          <FetchUrlsContainer
            urls={editUrls}
            targetComponent={SurveyForm}
            handleResponse={handleResponse}
          />
        )

      case 'view':
        const viewUrls = [
          {
            name: 'survey',
            url: getSurveysAPIPath({ id: surveyId, withStats: true })
          },
          {
            name: 'skeleton',
            url: getSurveysAPIPath({ id: surveyId, action: 'schemas-skeleton' })
          }
        ]

        return (
          <FetchUrlsContainer
            urls={viewUrls}
            targetComponent={Survey}
            handleResponse={handleResponse}
          />
        )

      default:
        return (
          <PaginationContainer
            pageSize={12}
            url={getSurveysAPIPath({ withStats: true })}
            position='top'
            listComponent={SurveysList}
            search
            showPrevious
            showNext
          />
        )
    }
  }
}

// Include this to enable HMR for this module
export default hot(SurveyDispatcher)
