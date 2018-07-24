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

/* global describe, it, beforeEach, afterEach */

import assert from 'assert'
import nock from 'nock'

import { getSettings } from './settings'

describe('Settings utils', () => {
  describe('getSettings', () => {
    beforeEach(() => {
      nock.cleanAll()
    })

    afterEach(() => {
      nock.isDone()
      nock.cleanAll()
    })

    it('should return the given settings I', () => {
      nock('http://localhost')
        .get('/assets-settings')
        .reply(200, {
          kernel_url: 'http://kernel.server.url',
          odk_url: 'http://odk.server.url',
          csv_header_rules: 'rules#rules#more-rules',
          csv_header_rules_sep: '#',
          csv_max_rows_size: 10000
        })

      return getSettings().then(settings => {
        assert.deepEqual(settings, {
          AETHER_KERNEL_URL: 'http://kernel.server.url',
          AETHER_ODK_URL: 'http://odk.server.url',
          ODK_ACTIVE: true,
          CSV_HEADER_RULES: 'rules#rules#more-rules',
          CSV_HEADER_RULES_SEP: '#',
          CSV_MAX_ROWS_SIZE: 10000
        })
      })
    })

    it('should return the given settings II', () => {
      nock('http://localhost')
        .get('/assets-settings')
        .reply(200, {
          kernel_url: 'http://kernel.server.url',
          csv_max_rows_size: 10000
        })

      return getSettings().then(settings => {
        assert.deepEqual(settings, {
          AETHER_KERNEL_URL: 'http://kernel.server.url',
          AETHER_ODK_URL: undefined,
          ODK_ACTIVE: false,
          CSV_HEADER_RULES: undefined,
          CSV_HEADER_RULES_SEP: undefined,
          CSV_MAX_ROWS_SIZE: 10000
        })
      })
    })

    it('should return the default settings if request fails', () => {
      nock('http://localhost')
        .get('/assets-settings')
        .reply(500)

      return getSettings().then(settings => {
        assert.deepEqual(settings, {
          AETHER_KERNEL_URL: '/kernel',
          AETHER_ODK_URL: '/odk',
          ODK_ACTIVE: true,
          CSV_HEADER_RULES: 'remove-prefix;payload.,remove-prefix;None.,replace;.;:;',
          CSV_HEADER_RULES_SEP: ';',
          CSV_MAX_ROWS_SIZE: 0
        })
      })
    })
  })
})
