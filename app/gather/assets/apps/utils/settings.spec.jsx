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
          aether_apps: ['kernel', 'odk'],
          export_max_rows_size: 10000,
          es_consumer_url: 'http://localhost:5601/'
        })

      return getSettings().then(settings => {
        assert.deepStrictEqual(settings, {
          ODK_ACTIVE: true,
          EXPORT_MAX_ROWS_SIZE: 10000,
          ES_CONSUMER_URL: 'http://localhost:5601/'
        })
      })
    })

    it('should return the given settings II', () => {
      nock('http://localhost')
        .get('/assets-settings')
        .reply(200, {
          csv_max_rows_size: 10000
        })

      return getSettings().then(settings => {
        assert.deepStrictEqual(settings, {
          ODK_ACTIVE: false,
          EXPORT_MAX_ROWS_SIZE: 0,
          ES_CONSUMER_URL: null
        })
      })
    })

    it('should return the default settings if request fails', () => {
      nock('http://localhost')
        .get('/assets-settings')
        .reply(500)

      return getSettings().then(settings => {
        assert.deepStrictEqual(settings, {
          ODK_ACTIVE: true,
          EXPORT_MAX_ROWS_SIZE: 0,
          ES_CONSUMER_URL: null
        })
      })
    })
  })
})
