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
  cleanJsonPaths,
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
      assert.strictEqual(getType(), null)
      assert.strictEqual(getType(null), null)
      assert.strictEqual(getType(''), null)
      assert.strictEqual(getType('   '), null)
      assert.strictEqual(getType([]), null)
      assert.strictEqual(getType({}), null)
      assert.strictEqual(getType(() => {}), null)
    })

    it('should indicate if the value is an object', () => {
      assert.strictEqual(getType({}), null)
      assert.strictEqual(getType({ a: 1 }), 'object')
    })

    it('should indicate if the value is an array', () => {
      assert.strictEqual(getType([ null ]), 'array')
      assert.strictEqual(getType([ undefined ]), 'array')
      assert.strictEqual(getType([1, 2, 3]), 'array')
    })

    it('should indicate if the value is a boolean', () => {
      assert.strictEqual(getType(true), 'bool')
      assert.strictEqual(getType(false), 'bool')
    })

    it('should indicate if the value is a number', () => {
      assert.strictEqual(getType(0), 'int')
      assert.strictEqual(getType(1.0), 'int')
      assert.strictEqual(getType(1.9), 'float')
    })

    it('should indicate if the value is a date', () => {
      assert.strictEqual(getType(new Date()), 'datetime')
      assert.strictEqual(getType('1999-01-01T23:59:59.9+01:00'), 'datetime')
      assert.strictEqual(getType('1999-01-01T23:59:59.999Z'), 'datetime')
      assert.strictEqual(getType('1999-01-01'), 'date')
      assert.strictEqual(getType('23:59:59'), 'time')
    })

    it('default type is string', () => {
      assert.strictEqual(getType('true'), 'string')
      assert.strictEqual(getType('false'), 'string')

      assert.strictEqual(getType('0'), 'string')
      assert.strictEqual(getType('1.0'), 'string')
      assert.strictEqual(getType('1.9'), 'string')

      assert.strictEqual(getType('1999-01-01T23:59:59'), 'string')
      assert.strictEqual(getType('1999-13-01'), 'string')
      assert.strictEqual(getType('24:59:59'), 'string')
      assert.strictEqual(getType('23:60:59'), 'string')
      assert.strictEqual(getType('23:59:60'), 'string')

      assert.strictEqual(getType('abc'), 'string')
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

      assert.deepStrictEqual(flatten(entry), { 'a.b.c.d': 1, 'x.y.z': null })
    })

    it('should not flatten array properties', () => {
      const entry = {
        a: {
          b: {
            c: {
              d: 1
            },
            a: [1, 2, {}, { d: 1 }]
          }
        }
      }

      assert.deepStrictEqual(flatten(entry, ':'), { 'a:b:c:d': 1, 'a:b:a': [1, 2, {}, { d: 1 }] })
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

      assert.deepStrictEqual(unflatten(entry), expected)
    })

    it('should not unflatten array properties', () => {
      const entry = { 'a:b:c:d': 1, 'a:b:a': [1, 2, {}, { d: 1 }] }
      const expected = {
        a: {
          b: {
            c: {
              d: 1
            },
            a: [1, 2, {}, { d: 1 }]
          }
        }
      }

      assert.deepStrictEqual(unflatten(entry, ':'), expected)
    })
  })

  describe('inflate', () => {
    it('should return empty array', () => {
      assert.deepStrictEqual(inflate([]), [])
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

      assert.deepStrictEqual(inflate(keys, '|'), expectedValue)
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

      assert.deepStrictEqual(flatten(filterByPaths(entry, [])), {})
      assert.deepStrictEqual(flatten(filterByPaths(entry, ['b'])), {})

      assert.deepStrictEqual(flatten(filterByPaths(entry, ['a.b.c.d'])), { 'a.b.c.d': 1 })
      assert.deepStrictEqual(flatten(filterByPaths(entry, ['a.b.c'])), { 'a.b.c.d': 1 })
      assert.deepStrictEqual(flatten(filterByPaths(entry, ['a.b'])), { 'a.b.c.d': 1 })
      assert.deepStrictEqual(flatten(filterByPaths(entry, ['a'])), { 'a.b.c.d': 1 })
    })
  })

  describe('getLabel', () => {
    const labels = {
      'a': 'Root',
      'a.d.#.e': 'The indexed E',
      'a.*.c': 'The Big C',
      'a.*.c.?.u': 'Join',
      'x.y.?.z': 'Union'
    }

    it('should find simple nested properties', () => {
      assert.strictEqual(getLabel('a', labels), 'Root')
      assert.strictEqual(getLabel('a.d.#.e', labels), 'The indexed E')
      assert.strictEqual(getLabel('a.b'), 'b')
    })

    it('should detect map properties', () => {
      assert.strictEqual(getLabel('a.x.c', labels), 'The Big C')
      assert.strictEqual(getLabel('a.x_x.c', labels), 'The Big C')
      assert.strictEqual(getLabel('a.x__1_x.c', labels), 'The Big C')
      assert.strictEqual(getLabel('a.x__1._x.c', labels), 'c')

      assert.strictEqual(getLabel('a.x.c.z', labels), 'z')
      assert.strictEqual(getLabel('a.x_x.c.z', labels), 'z')
      assert.strictEqual(getLabel('a.x__1_x.c.z', labels), 'z')
    })

    it('should detect union properties', () => {
      assert.strictEqual(getLabel('a.x.c.u', labels), 'Join')
      assert.strictEqual(getLabel('a.x_x.c.u', labels), 'Join')
      assert.strictEqual(getLabel('a.x__1_x.c.u', labels), 'Join')
      assert.strictEqual(getLabel('a.x__1._x.c.u', labels), 'u')

      assert.strictEqual(getLabel('x.y.z', labels), 'Union')
      assert.strictEqual(getLabel('x.y.a.z', labels), 'z')
    })
  })

  describe('getLabelTree', () => {
    const labels = {
      'a': 'Root',
      'a.d.#.e': 'The indexed E',
      'a.*.c': 'The Big C',
      'a.*.c.?.u': 'Join',
      'x.y.?.z': 'Union'
    }

    it('should concatenate jsonpath pieces labels', () => {
      assert.strictEqual(getLabelTree('a.b.c.d.e'), 'a / b / c / d / e')
      assert.strictEqual(getLabelTree('a.b.c.d.e', labels), 'Root / b / The Big C / d / e')

      assert.strictEqual(getLabelTree('a:b:c:d:e', {}, ':', '$'), 'a$b$c$d$e')
      assert.strictEqual(getLabelTree('a.b.c.d.e', labels, '.', '$'), 'Root$b$The Big C$d$e')
    })
  })

  describe('cleanJsonPaths', () => {
    it('should remove undesired jsonpaths and keep only leafs', () => {
      const paths = [
        'a',
        'a.b',
        'a.b.*',
        'a.b.*.#',
        'a.b.*.#.x',
        'a.c',
        'a.c.#',
        'a.c.#.y',
        'a.d',
        'a.d.?',
        'a.d.?.e',
        'a.f',
        'a.f.g',
        'z'
      ]
      const expected = [
        'a.b',
        'a.c',
        'a.d',
        'a.f.g',
        'z'
      ]

      assert.deepStrictEqual(cleanJsonPaths(paths), expected)
    })
  })
})
