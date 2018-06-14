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

/* global describe, it, jest, beforeEach, afterEach */

import assert from 'assert'

import { downloadFile, generateFileContent } from './download'

const TEST_ENV = process.env
const WINDOW_URL = window.URL
const DOCUMENT_BODY_APPEND = document.body.appendChild
const DOCUMENT_BODY_REMOVE = document.body.removeChild

describe('download utils', () => {
  describe('downloadFile', () => {
    afterEach(() => {
      window.URL = WINDOW_URL
      document.body.appendChild = DOCUMENT_BODY_APPEND
      document.body.removeChild = DOCUMENT_BODY_REMOVE
    })

    it('should create a link to download the content', () => {
      let createObjectURLCalled = false
      let revokeObjectURLCalled = false
      let appendChildCalled = false
      let removeChildCalled = false
      let addedElement = null

      const blob = 'abc'
      const filename = 'file.txt'

      window.URL = {
        createObjectURL: (content) => {
          assert.equal(content, blob)
          createObjectURLCalled = true
        },
        revokeObjectURL: (url) => {
          assert(url)
          revokeObjectURLCalled = true
        }
      }

      document.body.appendChild = (element) => {
        addedElement = element
        assert.equal(element.download, filename)
        appendChildCalled = true
      }

      document.body.removeChild = (element) => {
        assert.equal(element, addedElement)
        assert.equal(element.download, filename)
        removeChildCalled = true
      }

      downloadFile(blob, filename)

      assert(createObjectURLCalled, 'createObjectURL was called')
      assert(revokeObjectURLCalled, 'revokeObjectURL was called')
      assert(appendChildCalled, 'appendChild was called')
      assert(removeChildCalled, 'removeChild was called')
    })

    it('should create a link to download the content and assign a default filename', () => {
      let createObjectURLCalled = false
      let revokeObjectURLCalled = false
      let appendChildCalled = false
      let removeChildCalled = false
      let addedElement = null

      const blob = 'abc'
      const filename = 'download' // default file name

      window.URL = {
        createObjectURL: (content) => {
          assert.equal(content, blob)
          createObjectURLCalled = true
        },
        revokeObjectURL: (url) => {
          assert(url)
          revokeObjectURLCalled = true
        }
      }

      document.body.appendChild = (element) => {
        addedElement = element
        assert.equal(element.download, filename)
        appendChildCalled = true
      }

      document.body.removeChild = (element) => {
        assert.equal(element, addedElement)
        assert.equal(element.download, filename)
        removeChildCalled = true
      }

      downloadFile(blob)

      assert(createObjectURLCalled, 'createObjectURL was called')
      assert(revokeObjectURLCalled, 'revokeObjectURL was called')
      assert(appendChildCalled, 'appendChild was called')
      assert(removeChildCalled, 'removeChild was called')
    })
  })

  describe('generateFileContent', () => {
    it('should parse any kind of value', () => {
      const results = [
        {
          numeric: {
            int: 1,
            float: 3.5
          },
          bool: {
            yes: true,
            no: false
          },
          string: 'a',
          dates: {
            date: '1999-01-01',
            datetime: '1999-01-01T23:59:59.9+01:00',
            time: '23:59:59'
          },
          blank: null
        }
      ]
      const expected = {
        '$': {
          headers: [
            'numeric.int',
            'numeric.float',
            'bool.yes',
            'bool.no',
            'string',
            'dates.date',
            'dates.datetime',
            'dates.time',
            'blank'
          ],
          data: [
            {
              'numeric.int': '1',
              'numeric.float': '3.500000',
              'bool.yes': 1,
              'bool.no': 0,
              'string': 'a',
              'dates.date': '1999-01-01',
              'dates.datetime': '1999-01-01 22:59:59.900000+0000',
              'dates.time': '23:59:59',
              'blank': ''
            }
          ]
        }
      }
      assert.deepEqual(generateFileContent(results), expected)
    })

    it('should create entries for simple objects', () => {
      const results = [
        { a: 1, b: { c: 2 } },
        { a: 3, b: { c: 4 } },
        { a: 5, b: { c: 6 } },
        { a: 7, b: { c: 8 } }
      ]
      const expected = {
        '$': {
          headers: [ 'a', 'b.c' ],
          data: [
            { a: '1', 'b.c': '2' },
            { a: '3', 'b.c': '4' },
            { a: '5', 'b.c': '6' },
            { a: '7', 'b.c': '8' }
          ]
        }
      }
      assert.deepEqual(generateFileContent(results), expected)
    })

    it('should create entries for empy arrays', () => {
      const results = [
        { a: 1, b: { c: 2 }, d: [] },
        { a: 3, b: { c: 4 }, d: [] },
        { a: 5, b: { c: 6 }, d: [] },
        { a: 7, b: { c: 8 }, d: [] }
      ]
      const expected = {
        '$': {
          headers: [ 'a', 'b.c' ],
          data: [
            { a: '1', 'b.c': '2' },
            { a: '3', 'b.c': '4' },
            { a: '5', 'b.c': '6' },
            { a: '7', 'b.c': '8' }
          ]
        },
        '$.d': {
          headers: [],
          data: []
        }
      }
      assert.deepEqual(generateFileContent(results), expected)
    })

    it('should create entries for arrays of simple types', () => {
      const results = [
        { '@': 1, a: 1, b: { c: 2 }, d: [1] },
        { '@': 2, a: 3, b: { c: 4 }, d: [2, 3] },
        { '@': 3, a: 5, b: { c: 6 }, d: [4, 5] },
        { '@': 4, a: 7, b: { c: 8 }, d: [6, 7, 8] }
      ]
      const expected = {
        '$': {
          headers: [ '@', 'a', 'b.c' ],
          data: [
            { '@': '1', a: '1', 'b.c': '2' },
            { '@': '2', a: '3', 'b.c': '4' },
            { '@': '3', a: '5', 'b.c': '6' },
            { '@': '4', a: '7', 'b.c': '8' }
          ]
        },
        '$.d': {
          headers: [ '@', '@$.d', 'value' ],
          data: [
            { '@': '1', '@$.d': '0', value: '1' },
            { '@': '2', '@$.d': '0', value: '2' },
            { '@': '2', '@$.d': '1', value: '3' },
            { '@': '3', '@$.d': '0', value: '4' },
            { '@': '3', '@$.d': '1', value: '5' },
            { '@': '4', '@$.d': '0', value: '6' },
            { '@': '4', '@$.d': '1', value: '7' },
            { '@': '4', '@$.d': '2', value: '8' }
          ]
        }
      }
      assert.deepEqual(generateFileContent(results), expected)
    })

    it('should create entries for arrays of objects', () => {
      const results = [
        { '@': 1, a: 1, b: { c: 2 }, d: [{e: 1}] },
        { '@': 2, a: 3, b: { c: 4 }, d: [{e: 2}, {e: 3}] },
        { '@': 3, a: 5, b: { c: 6 }, d: [{e: 4}, {e: 5}] },
        { '@': 4, a: 7, b: { c: 8 }, d: [{e: 6}, {e: 7}, {e: 8}] }
      ]
      const expected = {
        '$': {
          headers: [ '@', 'a', 'b.c' ],
          data: [
            { '@': '1', a: '1', 'b.c': '2' },
            { '@': '2', a: '3', 'b.c': '4' },
            { '@': '3', a: '5', 'b.c': '6' },
            { '@': '4', a: '7', 'b.c': '8' }
          ]
        },
        '$.d': {
          headers: [ '@', '@$.d', 'e' ],
          data: [
            { '@': '1', '@$.d': '0', e: '1' },
            { '@': '2', '@$.d': '0', e: '2' },
            { '@': '2', '@$.d': '1', e: '3' },
            { '@': '3', '@$.d': '0', e: '4' },
            { '@': '3', '@$.d': '1', e: '5' },
            { '@': '4', '@$.d': '0', e: '6' },
            { '@': '4', '@$.d': '1', e: '7' },
            { '@': '4', '@$.d': '2', e: '8' }
          ]
        }
      }
      assert.deepEqual(generateFileContent(results), expected)
    })

    it('should create entries for nested arrays', () => {
      const results = [
        { '@': 1, a: 1, b: { c: 2 }, d: [{e: 1, f: [{g: true}]}] },
        { '@': 2, a: 3, b: { c: 4 }, d: [{e: 2}, {e: 3, f: [{g: true}]}] },
        { '@': 3, a: 5, b: { c: 6 }, d: [{e: 4}, {e: 5}] },
        { '@': 4, a: 7, b: { c: 8 }, d: [{e: 6}, {e: 7, f: [{g: false}, {g: true}]}, {e: 8, f: [{g: false}]}] }
      ]
      const expected = {
        '$': {
          headers: [ '@', 'a', 'b.c' ],
          data: [
            { '@': '1', a: '1', 'b.c': '2' },
            { '@': '2', a: '3', 'b.c': '4' },
            { '@': '3', a: '5', 'b.c': '6' },
            { '@': '4', a: '7', 'b.c': '8' }
          ]
        },
        '$.d': {
          headers: [ '@', '@$.d', 'e' ],
          data: [
            { '@': '1', '@$.d': '0', e: '1' },
            { '@': '2', '@$.d': '0', e: '2' },
            { '@': '2', '@$.d': '1', e: '3' },
            { '@': '3', '@$.d': '0', e: '4' },
            { '@': '3', '@$.d': '1', e: '5' },
            { '@': '4', '@$.d': '0', e: '6' },
            { '@': '4', '@$.d': '1', e: '7' },
            { '@': '4', '@$.d': '2', e: '8' }
          ]
        },
        '$.d.f': {
          headers: [ '@', '@$.d', '@$.d.f', 'g' ],
          data: [
            { '@': '1', '@$.d': '0', '@$.d.f': '0', g: 1 },
            { '@': '2', '@$.d': '1', '@$.d.f': '0', g: 1 },
            { '@': '4', '@$.d': '1', '@$.d.f': '0', g: 0 },
            { '@': '4', '@$.d': '1', '@$.d.f': '1', g: 1 },
            { '@': '4', '@$.d': '2', '@$.d.f': '0', g: 0 }
          ]
        }
      }
      assert.deepEqual(generateFileContent(results), expected)
    })
  })

  describe('downloadContent', () => {
    const CONTENT = {
      '$': {
        headers: [ 'a', 'b', 'c' ],
        data: [
          { a: '1', b: '2' },
          { a: '3', b: '4', c: 'a' },
          { a: '5', b: '6' },
          { a: '7', b: '8', c: 'b' }
        ]
      },
      '$.d': {
        headers: [],
        data: []
      },
      '$.f': {
        headers: [ 'a', 'b', 'c' ],
        data: [
          { a: '1', b: '2' },
          { a: '3', b: '4', c: 'a' },
          { a: '5', b: '6' },
          { a: '7', b: '8', c: 'b' }
        ]
      }
    }

    describe('downloadCsv', () => {
      beforeEach(() => {
        // necessary to remove `require` cache
        jest.resetModules()

        process.env = Object.assign(
          {},
          process.env,
          {
            EXPORT_FORMAT: 'csv',
            CSV_SEPARATOR: ','
          }
        )
      })

      afterEach(() => {
        process.env = TEST_ENV
        window.URL = WINDOW_URL
        document.body.appendChild = DOCUMENT_BODY_APPEND
        document.body.removeChild = DOCUMENT_BODY_REMOVE
      })

      it('should create a CSV file with the content', () => {
        let createObjectURLCalled = 0
        let revokeObjectURLCalled = 0
        let appendChildCalled = 0
        let removeChildCalled = 0
        let addedElement = null

        const filename = 'file'

        window.URL = {
          createObjectURL: (content) => {
            assert(content)
            createObjectURLCalled++
          },
          revokeObjectURL: (url) => {
            assert(url)
            revokeObjectURLCalled++
          }
        }

        document.body.appendChild = (element) => {
          addedElement = element
          assert(element.download.startsWith(filename + '-'))
          if (appendChildCalled === 0) {
            // the main file
            assert(!element.download.startsWith(filename + '-1-'))
          } else {
            // the array file
            assert(element.download.startsWith(filename + '-1-'))
          }
          assert(element.download.endsWith('.csv'))
          assert(element.download.indexOf('$') === -1)
          appendChildCalled++
        }

        document.body.removeChild = (element) => {
          assert.equal(element, addedElement)
          assert(element.download.startsWith(filename + '-'))
          if (removeChildCalled === 0) {
            // the main file
            assert(!element.download.startsWith(filename + '-1-'))
          } else {
            // the array file
            assert(element.download.startsWith(filename + '-1-'))
          }
          assert(element.download.endsWith('.csv'))
          assert(element.download.indexOf('$') === -1)
          removeChildCalled++
        }

        const downloadContent = require('./download').downloadContent

        downloadContent(CONTENT, filename)

        assert.equal(createObjectURLCalled, 2, 'createObjectURL was called twice')
        assert.equal(revokeObjectURLCalled, 2, 'revokeObjectURL was called twice')
        assert.equal(appendChildCalled, 2, 'appendChild was called twice')
        assert.equal(removeChildCalled, 2, 'removeChild was called twice')
      })
    })

    describe('downloadExcel', () => {
      beforeEach(() => {
        // necessary to remove `require` cache
        jest.resetModules()

        process.env = Object.assign(
          {},
          process.env,
          { EXPORT_FORMAT: 'xls' }
        )
      })

      afterEach(() => {
        process.env = TEST_ENV
      })

      it('should create an XLS file with the content', () => {
        let mockBookNewCalled = 0
        let mockJsonToSheet = 0
        let mockBookAppendSheet = 0
        let mockWriteFileCalled = 0

        jest.mock('xlsx', () => ({
          utils: {
            book_new: jest.fn(() => {
              mockBookNewCalled++
            }),
            json_to_sheet: jest.fn(() => {
              mockJsonToSheet++
            }),
            book_append_sheet: jest.fn(() => {
              mockBookAppendSheet++
            })
          },
          writeFile: jest.fn(() => {
            mockWriteFileCalled++
          })
        }))
        const downloadContent = require('./download').downloadContent
        downloadContent(CONTENT)

        assert.equal(mockBookNewCalled, 1, 'book_new was called once')
        assert.equal(mockJsonToSheet, 2, 'json_to_sheet was called twice')
        assert.equal(mockBookAppendSheet, 2, 'book_append_sheet was called twice')
        assert.equal(mockWriteFileCalled, 1, 'writeFile was called once')
      })
    })
  })
})
