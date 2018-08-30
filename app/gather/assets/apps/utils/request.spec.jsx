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

import {
  deleteData,
  fetchUrls,
  forceGetData,
  getData,
  patchData,
  postData,
  putData
} from './request'

const handleUnexpectedBody = (body) => { assert(!!body, `Unexpected response ${body}`) }
const handleUnexpectedError = (error) => { assert(!!error, `Unexpected error ${error}`) }

describe('request utils', () => {
  describe('request', () => {
    describe('implemented HTTP methods', () => {
      beforeEach(() => {
        nock.cleanAll()
      })

      afterEach(() => {
        nock.isDone()
        nock.cleanAll()
      })

      it('should do a GET request', () => {
        nock('http://localhost')
          .get('/get')
          .reply(200, { get: true })

        return getData('http://localhost/get')
          .then(
            (body) => { assert(body.get, 'GET request should work') },
            handleUnexpectedError
          )
          .catch(handleUnexpectedError)
      })

      it('should do a POST request', () => {
        nock('http://localhost')
          .post('/post', { foo: 'bar' })
          .reply(200, { post: true })

        return postData('http://localhost/post', { foo: 'bar' })
          .then(
            (body) => { assert(body.post, 'POST request should work') },
            handleUnexpectedError
          )
          .catch(handleUnexpectedError)
      })

      it('should do a PUT request', () => {
        nock('http://localhost')
          .put('/put', { foo: 'bar' })
          .reply(200, { put: true })

        return putData('http://localhost/put', { foo: 'bar' })
          .then(
            (body) => { assert(body.put, 'PUT request should work') },
            handleUnexpectedError
          )
          .catch(handleUnexpectedError)
      })

      it('should do a PUT request using FormData', () => {
        nock('http://localhost')
          .put('/put-form')
          .reply(200, { putForm: true })

        return putData(
          'http://localhost/put-form',
          { foo: 'bar', list: [1, 2, 3], useless: null, nothing: undefined },
          { multipart: true }
        )
          .then(
            (body) => { assert(body.putForm, 'PUT request using FormData should work') },
            handleUnexpectedError
          )
          .catch(handleUnexpectedError)
      })

      it('should do a fake PUT request', () => {
        nock('http://localhost')
          .put('/fake-put')
          .reply(200, { put: true })

        return postData('http://localhost/fake-put', { foo: 'bar' }, { multipart: true })
          .then(
            (body) => { assert(body.put, 'Fake PUT request should work') },
            handleUnexpectedError
          )
          .catch(handleUnexpectedError)
      })

      it('should do a PATCH request', () => {
        nock('http://localhost')
          .patch('/patch', { foo: 'bar' })
          .reply(200, { patch: true })

        return patchData('http://localhost/patch', { foo: 'bar' })
          .then(
            (body) => { assert(body.patch, 'PATCH request should work') },
            handleUnexpectedError
          )
          .catch(handleUnexpectedError)
      })

      it('should do a DELETE request', () => {
        nock('http://localhost')
          .delete('/del')
          .reply(204)

        return deleteData('http://localhost/del')
          .then(
            (body) => { assert(!body, 'DELETE request should work') },
            handleUnexpectedError
          )
          .catch(handleUnexpectedError)
      })
    })

    describe('download response as file', () => {
      beforeEach(() => {
        nock.cleanAll()
      })

      afterEach(() => {
        nock.isDone()
        nock.cleanAll()
      })

      it('should do a GET request and download response', () => {
        nock('http://localhost')
          .get('/down')
          .reply(200, 'content text')

        let createObjectURLCalled = false
        let revokeObjectURLCalled = false
        let appendChildCalled = false
        let removeChildCalled = false
        let addedElement = null

        window.URL = {
          createObjectURL: (content) => {
            assert(content)
            createObjectURLCalled = true
          },
          revokeObjectURL: (url) => {
            assert(url)
            revokeObjectURLCalled = true
          }
        }

        document.body.appendChild = (element) => {
          addedElement = element
          assert.strictEqual(element.download, 'download')
          appendChildCalled = true
        }

        document.body.removeChild = (element) => {
          assert.strictEqual(element, addedElement)
          assert.strictEqual(element.download, 'download')
          removeChildCalled = true
        }

        return getData('http://localhost/down', { download: true })
          .then(
            (body) => {
              assert(!body, `No expected response ${body}`)
              assert(createObjectURLCalled, 'createObjectURL was called')
              assert(revokeObjectURLCalled, 'revokeObjectURL was called')
              assert(appendChildCalled, 'appendChild was called')
              assert(removeChildCalled, 'removeChild was called')
            },
            handleUnexpectedError
          )
          .catch(handleUnexpectedError)
      })

      it('should do a GET request and download response with the given file name', () => {
        nock('http://localhost')
          .get('/down')
          .reply(200, 'content text')

        let createObjectURLCalled = false
        let revokeObjectURLCalled = false
        let appendChildCalled = false
        let removeChildCalled = false
        let addedElement = null

        window.URL = {
          createObjectURL: (content) => {
            assert(content)
            createObjectURLCalled = true
          },
          revokeObjectURL: (url) => {
            assert(url)
            revokeObjectURLCalled = true
          }
        }

        document.body.appendChild = (element) => {
          addedElement = element
          assert.strictEqual(element.download, 'my-file.txt')
          appendChildCalled = true
        }

        document.body.removeChild = (element) => {
          assert.strictEqual(element, addedElement)
          assert.strictEqual(element.download, 'my-file.txt')
          removeChildCalled = true
        }

        return getData('http://localhost/down', { download: true, fileName: 'my-file.txt' })
          .then(
            (body) => {
              assert(!body, `No expected response ${body}`)
              assert(createObjectURLCalled, 'createObjectURL was called')
              assert(revokeObjectURLCalled, 'revokeObjectURL was called')
              assert(appendChildCalled, 'appendChild was called')
              assert(removeChildCalled, 'removeChild was called')
            },
            handleUnexpectedError
          )
          .catch(handleUnexpectedError)
      })
    })

    describe('error handling', () => {
      beforeEach(() => {
        nock.cleanAll()
      })

      afterEach(() => {
        nock.isDone()
        nock.cleanAll()
      })

      it('should throw an error with JSON content', () => {
        nock('http://localhost')
          .get('/error-404')
          .reply(404, { message: 'something went wrong' })

        return getData('http://localhost/error-404')
          .then(
            handleUnexpectedBody,
            (error) => {
              assert(error, 'Expected error')
              assert.strictEqual(error.message, 'Not Found', '404 error message')
              assert.strictEqual(error.content.message, 'something went wrong')
            }
          )
          .catch(handleUnexpectedError)
      })

      it('should throw an error and ignore TEXT content', () => {
        nock('http://localhost')
          .get('/error-400')
          .reply(400, 'something went wrong')

        return getData('http://localhost/error-400')
          .then(
            handleUnexpectedBody,
            (error) => {
              assert(error, 'Expected error')
              assert.strictEqual(error.message, 'Bad Request', '400 error message')
              assert.strictEqual(error.content, null)
            }
          )
          .catch(handleUnexpectedError)
      })
    })
  })

  describe('CSRF Token', () => {
    beforeEach(() => {
      nock.cleanAll()
    })

    afterEach(() => {
      nock.isDone()
      nock.cleanAll()
    })

    it('should do a GET request with the indicated CSRF token', () => {
      const tokenValue = 'CSRF-Token-Value'

      const element = document.createElement('div')
      element.value = tokenValue

      nock('http://localhost', {
        reqheaders: {
          'X-CSRFToken': tokenValue,
          'X-METHOD': 'GET'
        }
      })
        .get('/get')
        .reply(200, { get: true })

      document.querySelector = (selector) => {
        assert.strictEqual(selector, '[name=csrfmiddlewaretoken]')
        return element
      }

      return getData('http://localhost/get')
        .then(
          (body) => { assert(body.get, 'GET request should work') },
          handleUnexpectedError
        )
        .catch(handleUnexpectedError)
    })
  })

  describe('forceGetData', () => {
    beforeEach(() => {
      nock.cleanAll()
    })

    afterEach(() => {
      nock.isDone()
      nock.cleanAll()
    })

    it('should return a GET request', () => {
      nock('http://localhost')
        .get('/force-get-no-post')
        .reply(200, { forceGet: true })

      return forceGetData(
        'http://localhost/force-get-no-post',
        'http://localhost/force-get-post',
        { foo: 'bar' }
      )
        .then(
          (body) => { assert(body.forceGet, 'Force GET request should work') },
          handleUnexpectedError
        )
        .catch(handleUnexpectedError)
    })

    it('should force a GET request', () => {
      nock('http://localhost')
        .get('/force-get')
        .reply(404, { message: 'something went wrong' })

      nock('http://localhost')
        .post('/force-post', { foo: 'bar' })
        .reply(201, { forcePost: true })

      nock('http://localhost')
        .get('/force-get')
        .reply(200, { forceGet: true })

      return forceGetData(
        'http://localhost/force-get',
        'http://localhost/force-post',
        { foo: 'bar' }
      )
        .then(
          (body) => { assert(body.forceGet, 'Force GET request should work') },
          handleUnexpectedError
        )
        .catch(handleUnexpectedError)
    })
  })

  describe('fetchUrls', () => {
    beforeEach(() => {
      nock.cleanAll()
    })

    afterEach(() => {
      nock.isDone()
      nock.cleanAll()
    })

    it('should do a GET request', () => {
      nock('http://localhost')
        .get('/first-url')
        .reply(200, { content: 'first' })

      return fetchUrls([{
        name: 'first',
        url: 'http://localhost/first-url'
      }])
        .then(
          (body) => {
            assert.deepStrictEqual(body.first, { content: 'first' })
          },
          handleUnexpectedError
        )
        .catch(handleUnexpectedError)
    })

    it('should force a GET request', () => {
      nock('http://localhost')
        .get('/first-force-get')
        .reply(404, { message: 'something went wrong' })

      nock('http://localhost')
        .post('/first-force-post', { foo: 'bar' })
        .reply(201, { forcePost: true })

      nock('http://localhost')
        .get('/first-force-get')
        .reply(200, { forceGet: true })

      return fetchUrls([{
        name: 'first',
        url: 'http://localhost/first-force-get',
        force: {
          url: 'http://localhost/first-force-post',
          data: { foo: 'bar' }
        }
      }])
        .then(
          (body) => { assert(body.first.forceGet, 'Force GET request should work') },
          handleUnexpectedError
        )
        .catch(handleUnexpectedError)
    })

    it('should do more than one GET request', () => {
      nock('http://localhost')
        .get('/first-get')
        .reply(200, { content: 'first' })
      nock('http://localhost')
        .get('/second-get')
        .reply(200, { content: 'second' })

      return fetchUrls([
        {
          name: 'first',
          url: 'http://localhost/first-get',
          force: {
            url: 'http://localhost/first-get-post',
            data: { foo: 'bar' }
          }
        },
        {
          name: 'second',
          url: 'http://localhost/second-get'
        }
      ])
        .then(
          (body) => {
            assert.deepStrictEqual(body, {
              first: { content: 'first' },
              second: { content: 'second' }
            })
          },
          handleUnexpectedError
        )
        .catch(handleUnexpectedError)
    })

    it('should throw an error', () => {
      nock('http://localhost')
        .get('/first-error')
        .reply(400, { message: 'something went wrong' })
      nock('http://localhost')
        .get('/second-error')
        .reply(404, 'something went really wrong')

      return fetchUrls([
        {
          name: 'first',
          url: 'http://localhost/first-error'
        },
        {
          name: 'second',
          url: 'http://localhost/second-error'
        }
      ])
        .then(
          handleUnexpectedBody,
          (error) => {
            assert(error, 'Expected error')
            // it throws the first error and does not continue with the rest of Promises
            assert.strictEqual(error.message, 'Bad Request', '400 error message')
            assert.strictEqual(error.content.message, 'something went wrong')
          }
        )
        .catch(handleUnexpectedError)
    })
  })
})
