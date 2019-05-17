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

import { getData } from './request'
import { ODK_APP, COUCHDB_SYNC_APP } from './constants'

const DEFAULT_SETTINGS = {
  ODK_ACTIVE: true,
  COUCHDB_SYNC_ACTIVE: false,
  EXPORT_MAX_ROWS_SIZE: 0
}

export const getSettings = () => new Promise(resolve => {
  getData('/assets-settings')
    .then(response => {
      resolve({
        ODK_ACTIVE: (response.aether_apps || []).indexOf(ODK_APP) > -1,
        COUCHDB_SYNC_ACTIVE: (response.aether_apps || []).indexOf(COUCHDB_SYNC_APP) > -1,
        EXPORT_MAX_ROWS_SIZE: response.export_max_rows_size || DEFAULT_SETTINGS.EXPORT_MAX_ROWS_SIZE
      })
    })
    .catch(() => {
      // use default values
      resolve(DEFAULT_SETTINGS)
    })
})
