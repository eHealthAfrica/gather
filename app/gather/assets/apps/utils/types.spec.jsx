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
import {
  cleanJsonPaths,
  filterByPaths,
  flatten,
  getLabel,
  getLabelTree,
  getType,
  inflate,
  unflatten,
  reorderObjectKeys
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
      assert.strictEqual(getType([null]), 'array')
      assert.strictEqual(getType([undefined]), 'array')
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

    it('should not unflatten array properties (in values)', () => {
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

    it('should not unflatten array properties (in keys)', () => {
      const entry = { 'a;b;0;d': 1, 'a;b;1': 1 }
      const expected = {
        a: {
          b: {
            0: {
              d: 1
            },
            1: 1
          }
        }
      }

      assert.deepStrictEqual(unflatten(entry, ';'), expected)
    })
  })

  describe('flatten & unflatten', () => {
    it('should be idempotent (flatten+unflatten)', () => {
      const entry = {
        'a:b:c:d': 1,
        'a:b:a': [1, 2, {}, { d: 1 }]
      }
      assert.deepStrictEqual(flatten(unflatten(entry, ':'), ':'), entry)
    })

    it('should be idempotent (unflatten+flatten)', () => {
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
      assert.deepStrictEqual(unflatten(flatten(entry)), entry)
    })
  })

  describe('inflate', () => {
    it('should return empty array', () => {
      assert.deepStrictEqual(inflate([]), [])
    })

    it('should analyze flat JSON objects with `.` separator', () => {
      const keys = [
        'a.b.c',
        'a.b.d',
        'a.e.f',
        'a.g',
        'h'
      ]

      const expectedValue = [
        {
          a: { key: 'a', path: 'a', siblings: 4, hasChildren: true, isLeaf: false },
          h: { key: 'h', path: 'h', siblings: 1, hasChildren: false, isLeaf: true }
        },
        {
          'a.b': { key: 'a.b', path: 'a.b', siblings: 2, hasChildren: true, isLeaf: false },
          'a.e': { key: 'a.e', path: 'a.e', siblings: 1, hasChildren: true, isLeaf: false },
          'a.g': { key: 'a.g', path: 'a.g', siblings: 1, hasChildren: false, isLeaf: true }
        },
        {
          'a.b.c': { key: 'a.b.c', path: 'a.b.c', siblings: 1, hasChildren: false, isLeaf: true },
          'a.b.d': { key: 'a.b.d', path: 'a.b.d', siblings: 1, hasChildren: false, isLeaf: true },
          'a.e.f': { key: 'a.e.f', path: 'a.e.f', siblings: 1, hasChildren: false, isLeaf: true }
        }
      ]

      assert.deepStrictEqual(inflate(keys), expectedValue)
    })

    it('should analyze flat JSON objects with custom separator', () => {
      const keys = [
        'a|b|c',
        'a|b|d',
        'a|e|f',
        'a|g',
        'h'
      ]

      const expectedValue = [
        {
          a: { key: 'a', path: 'a', siblings: 4, hasChildren: true, isLeaf: false },
          h: { key: 'h', path: 'h', siblings: 1, hasChildren: false, isLeaf: true }
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
              d: 1,
              dd: 2
            },
            cc: 2
          },
          bb: 2
        },
        aa: 2
      }

      assert.deepStrictEqual(flatten(filterByPaths(entry, [])), {})
      assert.deepStrictEqual(flatten(filterByPaths(entry, ['b'])), {})

      assert.deepStrictEqual(
        flatten(filterByPaths(entry, ['a.b.c.d'])),
        { 'a.b.c.d': 1 })
      assert.deepStrictEqual(
        flatten(filterByPaths(entry, ['a.b.c'])),
        { 'a.b.c.d': 1, 'a.b.c.dd': 2 })
      assert.deepStrictEqual(
        flatten(filterByPaths(entry, ['a.b'])),
        { 'a.b.c.d': 1, 'a.b.c.dd': 2, 'a.b.cc': 2 })
      assert.deepStrictEqual(
        flatten(filterByPaths(entry, ['a'])),
        { 'a.b.c.d': 1, 'a.b.c.dd': 2, 'a.b.cc': 2, 'a.bb': 2 })
    })
  })

  describe('getLabel', () => {
    const labels = {
      a: 'Root',
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
      a: 'Root',
      'a.d.#.e': 'The indexed E',
      'a.*.c': 'The Big C',
      'a.*.c.?.u': 'Join',
      'x.y.?.z': 'Union'
    }

    it('should concatenate jsonpath pieces labels', () => {
      assert.strictEqual(getLabelTree('a.b.c.d.e'), 'a / b / c / d / e')
      assert.strictEqual(getLabelTree('a.b.c.d.e', labels), 'Root / b / The Big C / d / e')

      assert.strictEqual(getLabelTree('a.b.c.d.e', labels, '$'), 'Root$b$The Big C$d$e')

      const labels2 = {
        a: 'Root',
        'a:d:#:e': 'The indexed E',
        'a:*:c': 'The Big C',
        'a:*:c:?:u': 'Join',
        'x:y:?:z': 'Union'
      }
      assert.strictEqual(getLabelTree('a:b:c:d:e', {}, '$', ':'), 'a$b$c$d$e')
      assert.strictEqual(getLabelTree('a:b:c:d:e', labels2, '-', ':'), 'Root-b-The Big C-d-e')
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

  describe('reorderObjectKeys', () => {
    describe('should preserve object values but not keys order', () => {
      it('with simple paths', () => {
        const entry = {
          b: 1,
          c: 2,
          a: {
            b: 1,
            a: 0
          }
        }
        const paths = [
          'a',
          'a.a',
          'a.b',
          'c',
          'b'
        ]

        const oEntry = reorderObjectKeys(entry, paths)
        assert.deepStrictEqual(oEntry, entry) // it's the same object

        // but `Object.keys` returns different values in each case
        assert.deepStrictEqual(Object.keys(flatten(entry)), ['b', 'c', 'a.b', 'a.a'])
        assert.deepStrictEqual(Object.keys(flatten(oEntry)), ['a.a', 'a.b', 'c', 'b'])
      })

      it('with ARRAY paths', () => {
        const entry = {
          // array of primitives
          i: [0, 1, 2],
          // array of objects
          l: [
            { z: 3, x: 1, y: 2 },
            { z: 3, y: 2, x: 1 },
            { x: 1, z: 3, y: 2 }
          ],
          // array of array of objects
          m: [[{ b: 1, a: 0 }]],
          // nested arrays
          n: [
            { a: 1 },
            {
              b: [
                { d: [0], c: 1 },
                { d: [], c: 2 },
                { c: 3 }
              ],
              a: 1
            }
          ],
          // array of array of primitives
          k: [[0], [1], [2]]
        }
        const paths = [
          'l',
          'l.#',
          'l.#.x',
          'l.#.y',
          'l.#.z',
          'i',
          'i.#',
          'k',
          'k.#',
          'k.#.#',
          'n',
          'n.#',
          'n.#.a',
          'n.#.b',
          'n.#.b.#',
          'n.#.b.#.c',
          'n.#.b.#.d',
          'n.#.b.#.d.#',
          'm',
          'm.#',
          'm.#.#',
          'm.#.#.a',
          'm.#.#.b'
        ]

        const oEntry = reorderObjectKeys(entry, paths)
        assert.deepStrictEqual(oEntry, entry) // it's the same object

        // but `Object.keys` returns different values in each case
        assert.deepStrictEqual(Object.keys(flatten(entry)), ['i', 'l', 'm', 'n', 'k'])
        assert.deepStrictEqual(Object.keys(flatten(oEntry)), ['l', 'i', 'k', 'n', 'm'])

        assert.deepStrictEqual(Object.keys(flatten(entry.l[0])), ['z', 'x', 'y'])
        assert.deepStrictEqual(Object.keys(flatten(oEntry.l[0])), ['x', 'y', 'z'])

        assert.deepStrictEqual(Object.keys(flatten(entry.l[1])), ['z', 'y', 'x'])
        assert.deepStrictEqual(Object.keys(flatten(oEntry.l[1])), ['x', 'y', 'z'])

        assert.deepStrictEqual(Object.keys(flatten(entry.l[2])), ['x', 'z', 'y'])
        assert.deepStrictEqual(Object.keys(flatten(oEntry.l[2])), ['x', 'y', 'z'])

        assert.deepStrictEqual(Object.keys(flatten(entry.n[1])), ['b', 'a'])
        assert.deepStrictEqual(Object.keys(flatten(oEntry.n[1])), ['a', 'b'])

        assert.deepStrictEqual(Object.keys(flatten(entry.n[1].b[0])), ['d', 'c'])
        assert.deepStrictEqual(Object.keys(flatten(oEntry.n[1].b[0])), ['c', 'd'])

        assert.deepStrictEqual(Object.keys(flatten(entry.m[0][0])), ['b', 'a'])
        assert.deepStrictEqual(Object.keys(flatten(oEntry.m[0][0])), ['a', 'b'])
      })

      it('with UNION paths', () => {
        const paths = [
          'u',
          'u.?',
          'u.?.x',
          'u.?.y',
          'u.?.z',
          'w',
          'w.?',
          'w.?.#',
          'w.?.a'
        ]

        const entry1 = {
          w: [],
          u: { y: 2, x: 1 }
        }
        const oEntry1 = reorderObjectKeys(entry1, paths)
        assert.deepStrictEqual(oEntry1, entry1) // it's the same object

        // but `Object.keys` returns different values in each case
        assert.deepStrictEqual(Object.keys(flatten(entry1)), ['w', 'u.y', 'u.x'])
        assert.deepStrictEqual(Object.keys(flatten(oEntry1)), ['u.x', 'u.y', 'w'])

        const entry2 = {
          w: { a: 1 },
          u: { y: 2, x: 1 }
        }

        const oEntry2 = reorderObjectKeys(entry2, paths)
        assert.deepStrictEqual(oEntry2, entry2) // it's the same object

        // but `Object.keys` returns different values in each case
        assert.deepStrictEqual(Object.keys(flatten(entry2)), ['w.a', 'u.y', 'u.x'])
        assert.deepStrictEqual(Object.keys(flatten(oEntry2)), ['u.x', 'u.y', 'w.a'])
      })

      it('with MAP paths', () => {
        const entry = {
          // map of objects
          r: {
            // the root keys are not going to be ordered,
            // but the nested ones yes
            c: { b: 1, a: 2 },
            b: { b: 1, a: 2 },
            a: { b: 1, a: 2 }
          },
          // map of primitives
          s: {
            z: 0,
            y: 1,
            x: 2
          },
          // array inside map
          t: { x: [{ a: 1, b: 1, c: 1 }] },
          // map inside array
          w: [{ x: { a: 1, b: 1, c: 1 } }]
        }
        const paths = [
          'r',
          'r.*',
          'r.*.a',
          'r.*.b',
          's',
          's.*',
          't',
          't.*',
          't.*.#',
          't.*.#.c',
          't.*.#.a',
          't.*.#.b',
          'w',
          'w.#',
          'w.#.*',
          'w.#.*.c',
          'w.#.*.b',
          'w.#.*.a'
        ]

        const oEntry = reorderObjectKeys(entry, paths)
        assert.deepStrictEqual(oEntry, entry) // it's the same object

        // but `Object.keys` returns different values in each case
        assert.deepStrictEqual(
          Object.keys(flatten(entry)),
          [
            'r.c.b', 'r.c.a',
            'r.b.b', 'r.b.a',
            'r.a.b', 'r.a.a',
            's.z', 's.y', 's.x',
            't.x', 'w'
          ])
        assert.deepStrictEqual(
          Object.keys(flatten(oEntry)),
          [
            'r.c.a', 'r.c.b',
            'r.b.a', 'r.b.b',
            'r.a.a', 'r.a.b',
            's.z', 's.y', 's.x',
            't.x', 'w'
          ])

        assert.deepStrictEqual(Object.keys(flatten(entry.t.x[0])), ['a', 'b', 'c'])
        assert.deepStrictEqual(Object.keys(flatten(oEntry.t.x[0])), ['c', 'a', 'b'])

        assert.deepStrictEqual(Object.keys(flatten(entry.w[0].x)), ['a', 'b', 'c'])
        assert.deepStrictEqual(Object.keys(flatten(oEntry.w[0].x)), ['c', 'b', 'a'])
      })
    })
  })
})
