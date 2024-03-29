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

// The list of current apps that DO need Hot Module Replacement in development mode
const apps = [
  {
    name: 'styles',
    path: './css/index.scss'
  },
  {
    name: 'home',
    path: './apps/home'
  },
  {
    name: 'surveys',
    path: './apps/surveys'
  },
  {
    name: 'surveyors',
    path: './apps/surveyors'
  }
]

const buildEntries = (hmr) => {
  const list = {
    // the apps that DO NOT need Hot Module Replacement in development mode
    common: [
      'bootstrap',
      'whatwg-fetch',
      'abortcontroller-polyfill/dist/polyfill-patch-fetch'
    ]
  }

  apps.forEach(app => {
    list[app.name] = (hmr ? [hmr, app.path] : app.path)
  })

  return list
}

module.exports = buildEntries
