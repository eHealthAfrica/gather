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

import { getData } from './request'
import { ODK_APP } from './constants'

const DEFAULT_SETTINGS = {
  ODK_ACTIVE: true,

  CSV_HEADER_RULES: 'remove-prefix;payload.,remove-prefix;None.,replace;.;:;',
  CSV_HEADER_RULES_SEP: ';',
  CSV_MAX_ROWS_SIZE: 0
}

export const getSettings = () => new Promise(resolve => {
  getData('/assets-settings')
    .then(response => {
      resolve({
        ODK_ACTIVE: (response.aether_apps || []).indexOf(ODK_APP) > -1,

        CSV_HEADER_RULES: response.csv_header_rules,
        CSV_HEADER_RULES_SEP: response.csv_header_rules_sep,
        CSV_MAX_ROWS_SIZE: response.csv_max_rows_size
      })
    })
    .catch(() => {
      // use default values
      resolve(DEFAULT_SETTINGS)
    })
})
