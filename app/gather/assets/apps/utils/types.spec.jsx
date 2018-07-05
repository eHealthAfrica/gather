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
  filterByPaths,
  flatten,
  getLabel,
  getLabelTree,
  getType,
  inflate,
  unflatten
} from './types'

describe('types', () => {
  describe('getType', () => {
    it('should return null with useless values', () => {
      assert.equal(getType(), null)
      assert.equal(getType(null), null)
      assert.equal(getType(''), null)
      assert.equal(getType('   '), null)
      assert.equal(getType([]), null)
      assert.equal(getType({}), null)
      assert.equal(getType(() => {}), null)
    })

    it('should indicate if the value is an object', () => {
      assert.equal(getType({}), null)
      assert.equal(getType({a: 1}), 'object')
    })

    it('should indicate if the value is an array', () => {
      assert.equal(getType([ null ]), 'array')
      assert.equal(getType([ undefined ]), 'array')
      assert.equal(getType([1, 2, 3]), 'array')
    })

    it('should indicate if the value is a boolean', () => {
      assert.equal(getType(true), 'bool')
      assert.equal(getType(false), 'bool')
    })

    it('should indicate if the value is a number', () => {
      assert.equal(getType(0), 'int')
      assert.equal(getType(1.0), 'int')
      assert.equal(getType(1.9), 'float')
    })

    it('should indicate if the value is a date', () => {
      assert.equal(getType(new Date()), 'datetime')
      assert.equal(getType('1999-01-01T23:59:59.9+01:00'), 'datetime')
      assert.equal(getType('1999-01-01T23:59:59.999Z'), 'datetime')
      assert.equal(getType('1999-01-01'), 'date')
      assert.equal(getType('23:59:59'), 'time')
    })

    it('default type is string', () => {
      assert.equal(getType('true'), 'string')
      assert.equal(getType('false'), 'string')

      assert.equal(getType('0'), 'string')
      assert.equal(getType('1.0'), 'string')
      assert.equal(getType('1.9'), 'string')

      assert.equal(getType('1999-01-01T23:59:59'), 'string')
      assert.equal(getType('1999-13-01'), 'string')
      assert.equal(getType('24:59:59'), 'string')
      assert.equal(getType('23:60:59'), 'string')
      assert.equal(getType('23:59:60'), 'string')

      assert.equal(getType('abc'), 'string')
    })
  })

  describe('flatten', () => {
    it('should flatten JSON objects', () => {
      const entry = {
        a: {
          b: {
            c: {
              d: 1
            }
          }
        },
        x: {
          y: {
            z: null
          }
        }
      }

      assert.deepEqual(flatten(entry), { 'a.b.c.d': 1, 'x.y.z': null })
    })

    it('should not flatten array properties', () => {
      const entry = {
        a: {
          b: {
            c: {
              d: 1
            },
            a: [1, 2, {}, {d: 1}]
          }
        }
      }

      assert.deepEqual(flatten(entry, ':'), { 'a:b:c:d': 1, 'a:b:a': [1, 2, {}, {d: 1}] })
    })
  })

  describe('unflatten', () => {
    it('should unflatten to JSON objects', () => {
      const entry = { 'a.b.c.d': 1, 'x.y.z': null }
      const expected = {
        a: {
          b: {
            c: {
              d: 1
            }
          }
        },
        x: {
          y: {
            z: null
          }
        }
      }

      assert.deepEqual(unflatten(entry), expected)
    })

    it('should not unflatten array properties', () => {
      const entry = { 'a:b:c:d': 1, 'a:b:a': [1, 2, {}, {d: 1}] }
      const expected = {
        a: {
          b: {
            c: {
              d: 1
            },
            a: [1, 2, {}, {d: 1}]
          }
        }
      }

      assert.deepEqual(unflatten(entry, ':'), expected)
    })
  })

  describe('inflate', () => {
    it('should return empty array', () => {
      assert.deepEqual(inflate([]), [])
    })

    it('should analyze flat JSON objects', () => {
      const keys = [
        'a|b|c',
        'a|b|d',
        'a|e|f',
        'a|g',
        'h'
      ]

      const expectedValue = [
        {
          'a': { key: 'a', path: 'a', siblings: 4, hasChildren: true, isLeaf: false },
          'h': { key: 'h', path: 'h', siblings: 1, hasChildren: false, isLeaf: true }
        },
        {
          'a|b': { key: 'a|b', path: 'a.b', siblings: 2, hasChildren: true, isLeaf: false },
          'a|e': { key: 'a|e', path: 'a.e', siblings: 1, hasChildren: true, isLeaf: false },
          'a|g': { key: 'a|g', path: 'a.g', siblings: 1, hasChildren: false, isLeaf: true }
        },
        {
          'a|b|c': { key: 'a|b|c', path: 'a.b.c', siblings: 1, hasChildren: false, isLeaf: true },
          'a|b|d': { key: 'a|b|d', path: 'a.b.d', siblings: 1, hasChildren: false, isLeaf: true },
          'a|e|f': { key: 'a|e|f', path: 'a.e.f', siblings: 1, hasChildren: false, isLeaf: true }
        }
      ]

      assert.deepEqual(inflate(keys, '|'), expectedValue)
    })
  })

  describe('filterByPaths', () => {
    it('should include only the indicated paths', () => {
      const entry = {
        x: {
          y: {
            z: 2
          }
        },
        a: {
          b: {
            c: {
              d: 1
            }
          }
        }
      }

      assert.deepEqual(flatten(filterByPaths(entry, [])), {})
      assert.deepEqual(flatten(filterByPaths(entry, ['b'])), {})

      assert.deepEqual(flatten(filterByPaths(entry, ['a.b.c.d'])), { 'a.b.c.d': 1 })
      assert.deepEqual(flatten(filterByPaths(entry, ['a.b.c'])), { 'a.b.c.d': 1 })
      assert.deepEqual(flatten(filterByPaths(entry, ['a.b'])), { 'a.b.c.d': 1 })
      assert.deepEqual(flatten(filterByPaths(entry, ['a'])), { 'a.b.c.d': 1 })
    })
  })

  describe('getLabel', () => {
    const labels = {
      'a': 'Root',
      'a.d.#.e': 'The indexed E',
      'a.*.c': 'The Big C'
    }

    it('should find simple nested properties', () => {
      assert.equal(getLabel('a', labels), 'Root')
      assert.equal(getLabel('a.d.#.e', labels), 'The indexed E')
      assert.equal(getLabel('a.b'), 'b')
    })

    it('should detect map properties', () => {
      assert.equal(getLabel('a.x.c', labels), 'The Big C')
      assert.equal(getLabel('a.x_x.c', labels), 'The Big C')
      assert.equal(getLabel('a.x__1_x.c', labels), 'The Big C')
      assert.equal(getLabel('a.x__1._x.c', labels), 'c')
    })
  })

  describe('getLabelTree', () => {
    it('should concatenate jsonpath pieces labels', () => {
      assert.equal(getLabelTree('a.b.c.d.e'), 'a / b / c / d / e')
      assert.equal(getLabelTree('a:b:c:d:e', {}, ':', '$'), 'a$b$c$d$e')
    })
  })
})
