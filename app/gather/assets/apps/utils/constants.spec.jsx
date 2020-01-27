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

/* global describe, it */

import assert from 'assert'

import * as constants from './constants'

describe('constants', () => {
  it('should define app constants', () => {
    assert(constants.MAX_PAGE_SIZE > 0)

    assert.deepStrictEqual(constants.EXPORT_CSV_FORMAT, 'csv')
    assert.deepStrictEqual(constants.EXPORT_EXCEL_FORMAT, 'xlsx')

    assert.deepStrictEqual(constants.KERNEL_APP, 'kernel')
    assert.deepStrictEqual(constants.ODK_APP, 'odk')
    assert.deepStrictEqual(constants.GATHER_APP, 'gather')
  })
})
