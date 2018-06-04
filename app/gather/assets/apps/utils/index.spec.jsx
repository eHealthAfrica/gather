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

/* global describe, it */

import assert from 'assert'
import {
  clone,
  deepEqual,
  generateRandomId,
  range,
  sortBy
} from './index'

describe('utils', () => {
  describe('clone', () => {
    it('should clone an obj', () => {
      const a = {foo: 11, bar: {baz: 22}}
      const b = clone(a)
      assert(a !== b)
      assert(b.foo === a.foo)
      assert(b.bar !== a.bar)
    })
  })

  describe('deepEqual', () => {
    it('should compare primitives', () => {
      let a = 1
      let b = 1
      assert(deepEqual(a, b), 'Primitives are equal')
      b = 2
      assert(!deepEqual(a, b), 'Primitives are not equal')
    })

    it('should compare objects', () => {
      let a = {foo: 11, bar: 22, baz: {y: 4}}
      let b = {bar: 22, foo: 11, baz: {y: 4}}
      assert(deepEqual(a, b), 'Objects are equal')
      b.baz.y = 5
      assert(!deepEqual(a, b), 'Objects are not equal')
      b.baz.y = 4
      b.baz.x = 1
      a.baz.z = 1
      assert(!deepEqual(a, b), 'Objects are not equal')
    })

    it('should compare arrays', () => {
      let a = [1, 2, 3]
      let b = [1, 2, 3]
      assert(deepEqual(a, b), 'Arrays are equal')
      b = [1, 2, 2]
      assert(!deepEqual(a, b), 'Arrays are not equal')
    })

    it('should ignore null and undefined values', () => {
      let a = {x: 1, y: null, z: undefined}
      let b = {x: 1}
      assert(deepEqual(a, b, true), 'Should be equal without null values')
      assert(!deepEqual(a, b), 'Should not be equal with null values')
    })
  })

  describe('generateRandomId', () => {
    it('should return a random value every time is called', () => {
      const a = generateRandomId()
      const b = generateRandomId()
      assert(a)
      assert(b)
      assert(a !== b)
    })
  })

  describe('range', () => {
    it('should create an array of ints', () => {
      assert.deepEqual(range(0, 0), [])
      assert.deepEqual(range(0, 1), [0])
      assert.deepEqual(range(1, 3), [1, 2])
    })
  })

  describe('sortBy', () => {
    it('should order an array of objects by the given property value', () => {
      assert.deepEqual(sortBy([]), [])
      assert.deepEqual(
        sortBy([ 1, 10, 11, 100, 12, 1 ]),
        [ 1, 1, 10, 100, 11, 12 ]
      )

      assert.deepEqual(
        sortBy([
          { a: '1' },
          { a: '10' },
          { a: '11' },
          { a: '100' },
          { a: '12' },
          { a: '1' }
        ], 'a'),
        [
          { a: '1' },
          { a: '1' },
          { a: '10' },
          { a: '100' },
          { a: '11' },
          { a: '12' }
        ]
      )

      assert.deepEqual(
        sortBy([
          { c: 2 },
          { a: 10 },
          { a: 11 },
          { a: 100 },
          { a: 12 },
          { b: 1000 }
        ], 'a'),
        [
          { c: 2 },
          { b: 1000 },
          { a: 10 },
          { a: 100 },
          { a: 11 },
          { a: 12 }
        ]
      )
    })
  })
})
