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

/* global describe, it, beforeEach, afterEach, jest */

import assert from 'assert'

const TEST_ENV = process.env

describe('environment constants', () => {
  describe('with ODK', () => {
    beforeEach(() => {
      // necessary to remove `require` cache
      jest.resetModules()

      // assign default environment variables
      process.env = Object.assign(
        {},
        process.env,
        {
          AETHER_MODULES: 'kernel,odk',
          AETHER_KERNEL_URL: 'http://kernel-test:9001',
          AETHER_ODK_URL: 'http://odk-test:9002',

          CSV_HEADER_RULES: 'replace;.;:;',
          CSV_HEADER_RULES_SEP: ';',
          CSV_MAX_ROWS_SIZE: null
        }
      )
    })

    afterEach(() => {
      process.env = TEST_ENV
    })

    it('should take environment variables', () => {
      const envWithODK = require('./env')

      assert(envWithODK.ODK_ACTIVE)

      assert.deepEqual(envWithODK.AETHER_KERNEL_URL, 'http://kernel-test:9001')
      assert.deepEqual(envWithODK.AETHER_ODK_URL, 'http://odk-test:9002')

      assert.deepEqual(envWithODK.CSV_HEADER_RULES, 'replace;.;:;')
      assert.deepEqual(envWithODK.CSV_HEADER_RULES_SEP, ';')
      assert.deepEqual(envWithODK.CSV_MAX_ROWS_SIZE, 0)
    })
  })

  describe('without ODK', () => {
    beforeEach(() => {
      // necessary to remove `require` cache
      jest.resetModules()

      // assign default environment variables
      process.env = Object.assign(
        {},
        process.env,
        {
          AETHER_MODULES: null,
          AETHER_KERNEL_URL: 'http://kernel-test:9001',
          AETHER_ODK_URL: 'http://odk-test:9002',

          CSV_HEADER_RULES: 'replace¬.¬:¬',
          CSV_HEADER_RULES_SEP: '¬',
          CSV_MAX_ROWS_SIZE: '123456'
        }
      )
    })

    afterEach(() => {
      process.env = TEST_ENV
    })

    it('should take environment variables', () => {
      const envWithoutODK = require('./env')

      assert(!envWithoutODK.ODK_ACTIVE)

      assert.deepEqual(envWithoutODK.AETHER_KERNEL_URL, 'http://kernel-test:9001')
      assert.deepEqual(envWithoutODK.AETHER_ODK_URL, null)

      assert.deepEqual(envWithoutODK.CSV_HEADER_RULES, 'replace¬.¬:¬')
      assert.deepEqual(envWithoutODK.CSV_HEADER_RULES_SEP, '¬')
      assert.deepEqual(envWithoutODK.CSV_MAX_ROWS_SIZE, 123456)
    })
  })
})
