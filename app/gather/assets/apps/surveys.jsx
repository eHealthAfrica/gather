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

import 'react-hot-loader'
import React from 'react'
import ReactDOM from 'react-dom'

import { AppIntl } from './components'
import { getSettings } from './utils/settings'
import SurveyDispatcher from './survey'

/*
This is the projects/surveys app.

An Aether "Project" is equivalent to a Gather "Survey".
*/

getSettings().then(settings => {
  const appElement = document.getElementById('surveys-app')
  const surveyId = appElement.getAttribute('data-survey-id')
  const action = appElement.getAttribute('data-action')

  const dispatcher = (
    <AppIntl>
      <SurveyDispatcher
        settings={settings}
        action={action}
        surveyId={surveyId}
      />
    </AppIntl>
  )

  ReactDOM.render(dispatcher, appElement)
})
