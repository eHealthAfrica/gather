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

import React from 'react'
import ReactDOM from 'react-dom'
import { hot } from 'react-hot-loader'

import { AppIntl } from './components'
import { getSettings } from './utils/settings'
import MobileUserDispatcher from './mobile-user'

/*
This is the mobile users app
*/

getSettings().then(settings => {
  if (settings.COUCHDB_SYNC_ACTIVE) {
    const appElement = document.getElementById('mobile-users-app')
    const mobileUserId = appElement.getAttribute('data-mobile-user-id')
    const action = appElement.getAttribute('data-action')

    const dispatcher = (
      <AppIntl>
        <MobileUserDispatcher
          settings={settings}
          action={action}
          mobileUserId={mobileUserId}
        />
      </AppIntl>
    )

    ReactDOM.render(dispatcher, appElement)

    // Include this to enable HMR for this module
    hot(module)(dispatcher)
  }
})
