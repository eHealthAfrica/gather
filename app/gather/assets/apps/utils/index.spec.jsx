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

/* global describe, it */

import assert from 'assert'
import {
  clone,
  deepEqual,
  generateRandomId,
  range,
  sortBy,
  sortNumericArray,
  selectDigitalUnit,
  getFileName
} from './index'

describe('utils', () => {
  describe('clone', () => {
    it('should clone an obj', () => {
      const a = { foo: 11, bar: { baz: 22 } }
      const b = clone(a)
      assert(a !== b)
      assert(b.foo === a.foo)
      assert(b.bar !== a.bar)
    })
  })

  describe('deepEqual', () => {
    it('should compare different types', () => {
      assert(!deepEqual(null, undefined), 'null and undefined are not equal')
      assert(!deepEqual(1, {}), 'Primitives and objects are not equal')
      assert(!deepEqual('1', []), 'Primitives and arrays are not equal')
      assert(!deepEqual({}, []), 'Blank objects and empty arrays are not equal')
      assert(!deepEqual({ 0: 1 }, [1]), 'Objects and arrays are not equal')
    })

    it('should compare primitives', () => {
      assert(deepEqual(1, 1), 'Primitives are equal')
      assert(!deepEqual(1, 2), 'Primitives are not equal')
    })

    it('should compare objects', () => {
      const a = { foo: 11, bar: 22, baz: { y: 4 } }
      const b = { bar: 22, foo: 11, baz: { y: 4 } }
      assert(deepEqual(a, b), 'Objects are equal')
      b.baz.y = 5
      assert(!deepEqual(a, b), 'Objects are not equal')
      b.baz.y = 4
      b.baz.x = 1
      a.baz.z = 1
      assert(!deepEqual(a, b), 'Objects are not equal')
    })

    it('should compare arrays', () => {
      assert(deepEqual([1, 2, 3], [1, 2, 3]), 'Arrays are equal')
      assert(!deepEqual([1, 2, 3], [1, 2, 2]), 'Arrays are not equal')
      assert(!deepEqual([1, 2, 3], [1, 2]), 'Arrays are not equal')
    })

    it('should ignore null and undefined values', () => {
      const a = { x: 1, y: null, z: undefined }
      const b = { x: 1 }
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
      assert.deepStrictEqual(range(0, 0), [])
      assert.deepStrictEqual(range(0, 1), [0])
      assert.deepStrictEqual(range(1, 3), [1, 2])
    })
  })

  describe('sortBy', () => {
    it('should order an array of objects by the given property value', () => {
      assert.deepStrictEqual(sortBy([]), [])
      assert.deepStrictEqual(
        sortBy([1, 10, 11, 100, 12, 1]),
        [1, 1, 10, 100, 11, 12]
      )

      assert.deepStrictEqual(
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

      assert.deepStrictEqual(
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

  describe('sortNumericArray', () => {
    it('should sort numeric arrays numerically not lexicographically', () => {
      const expected = [1, 10, 11, 100, 111]

      // numerically sorted
      const array1 = [1, 10, 11, 100, 111]
      assert.deepStrictEqual(sortNumericArray(array1), expected)

      // lexicographically sorted
      const array2 = [1, 10, 100, 11, 111]
      assert.deepStrictEqual(sortNumericArray(array2), expected)

      // not sorted
      const array3 = [10, 1, 111, 11, 100]
      assert.deepStrictEqual(sortNumericArray(array3), expected)
    })
  })

  describe('selectDigitalUnit', () => {
    it('should return the unit and the adjusted value', () => {
      assert.deepStrictEqual(
        selectDigitalUnit(0),
        { unit: 'byte', value: 0.0 }
      )
      assert.deepStrictEqual(
        selectDigitalUnit(-10),
        { unit: 'byte', value: -10.0 }
      )
      assert.deepStrictEqual(
        selectDigitalUnit(1000),
        { unit: 'kilobyte', value: 1.0 }
      )
      assert.deepStrictEqual(
        selectDigitalUnit(1000 ** 2),
        { unit: 'megabyte', value: 1.0 }
      )
      assert.deepStrictEqual(
        selectDigitalUnit(1000 ** 3),
        { unit: 'gigabyte', value: 1.0 }
      )
      assert.deepStrictEqual(
        selectDigitalUnit(1000 ** 4),
        { unit: 'terabyte', value: 1.0 }
      )
      assert.deepStrictEqual(
        selectDigitalUnit(1000 ** 5),
        { unit: 'petabyte', value: 1.0 }
      )
      assert.deepStrictEqual(
        selectDigitalUnit(1000 ** 6),
        { unit: 'exabyte', value: 1.0 }
      )
      assert.deepStrictEqual(
        selectDigitalUnit(1000 ** 7),
        { unit: 'zettabyte', value: 1.0 }
      )
      assert.deepStrictEqual(
        selectDigitalUnit(1000 ** 8),
        { unit: 'yottabyte', value: 1.0 }
      )
    })
  })

  describe('getFileName', () => {
    it('should return the last part of a path', () => {
      assert.deepStrictEqual(getFileName(''), '')
      assert.deepStrictEqual(getFileName('/'), '')
      assert.deepStrictEqual(getFileName('/a'), 'a')
      assert.deepStrictEqual(getFileName('/a/b/c/d'), 'd')
    })
  })
})
