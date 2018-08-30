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

import { isNullable, isLeaf, extractPathDocs } from './avro-utils'

describe('AVRO utils', () => {
  describe('isNullable', () => {
    it('should return false if type is not a union', () => {
      assert(!isNullable({ type: 'array', items: 'another_type' }))
      assert(!isNullable({ type: 'record' }))
      assert(!isNullable({ type: 'map' }))
      assert(!isNullable('null'))
      assert(!isNullable({ type: 'null' }))
    })

    it('should return true only if type is a union fo two elements, one of them "null"', () => {
      assert(!isNullable(['boolean', 'int']))
      assert(!isNullable(['float', { type: 'enum' }]))
      assert(!isNullable(['string', 'int', { type: 'record' }]))
      assert(!isNullable(['null', 'int', { type: 'record' }]))

      assert(isNullable(['null', 'int']))
      assert(isNullable(['null', { type: 'enum' }]))
    })
  })

  describe('isLeaf', () => {
    it('should flag basic primitives as leaf', () => {
      assert(isLeaf('null'))
      assert(isLeaf('boolean'))
      assert(isLeaf('int'))
      assert(isLeaf('long'))
      assert(isLeaf('float'))
      assert(isLeaf('double'))
      assert(isLeaf('bytes'))
      assert(isLeaf('string'))
      assert(isLeaf('enum'))
      assert(isLeaf('fixed'))

      assert(isLeaf({ type: 'null' }))
      assert(isLeaf({ type: 'boolean' }))
      assert(isLeaf({ type: 'int' }))
      assert(isLeaf({ type: 'long' }))
      assert(isLeaf({ type: 'float' }))
      assert(isLeaf({ type: 'double' }))
      assert(isLeaf({ type: 'bytes' }))
      assert(isLeaf({ type: 'string' }))
      assert(isLeaf({ type: 'enum' }))
      assert(isLeaf({ type: 'fixed' }))
    })

    it('should detect complex types', () => {
      assert(!isLeaf({ type: 'array', items: 'another_type' }))
      assert(!isLeaf({ type: 'record' }))
      assert(!isLeaf({ type: 'map' }))
    })

    it('should flag as leaf certain complex types', () => {
      assert(isLeaf(['null', 'int']))
      assert(isLeaf(['null', { type: 'enum' }]))
      assert(!isLeaf(['null', 'int', { type: 'record' }]))

      assert(isLeaf({ type: 'array', items: 'long' }))
      assert(!isLeaf({ type: 'array', items: { type: 'map' } }))
    })
  })

  describe('extractPathDocs', () => {
    it('should get take the "doc" property as label', () => {
      const schema = {
        name: 'root',
        doc: 'The root',
        type: 'record',
        fields: [
          {
            name: 'first',
            doc: 'The first',
            // nullable primitive
            type: ['null', 'boolean']
          }
        ]
      }
      const expected = {
        labels: { first: 'The first' },
        paths: ['first']
      }
      assert.deepStrictEqual(extractPathDocs(schema), expected)
      // using extracted paths and docs as initial state
      assert.deepStrictEqual(extractPathDocs(schema, extractPathDocs(schema)), expected)
    })

    it('should no create any label entry if no "doc"', () => {
      const schema = {
        name: 'root',
        doc: 'The root',
        type: 'record',
        fields: [
          {
            name: 'first',
            // "enum" types are handled as primitives
            type: {
              name: 'coords',
              doc: '3D axes', // this is ignored
              type: 'enum',
              symbols: ['x', 'y', 'z']
            }
          }
        ]
      }
      const expected = {
        labels: {},
        paths: ['first']
      }
      assert.deepStrictEqual(extractPathDocs(schema), expected)
      // using extracted paths and docs as initial state
      assert.deepStrictEqual(extractPathDocs(schema, extractPathDocs(schema)), expected)
    })

    it('should build nested paths', () => {
      const schema = {
        name: 'root',
        doc: 'The root',
        type: 'record',
        fields: [
          {
            name: 'first',
            type: 'record',
            fields: [
              {
                name: 'second',
                doc: 'leaf',
                type: ['null', 'boolean']
              },
              {
                name: 'fourth',
                type: [
                  'null',
                  {
                    name: 'fourth', // it's the same name because it's nullable
                    type: 'record',
                    fields: [
                      {
                        name: 'fifth',
                        type: 'string'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
      const expected = {
        labels: {
          'first.second': 'leaf'
        },
        paths: ['first', 'first.second', 'first.fourth', 'first.fourth.fifth']
      }
      assert.deepStrictEqual(extractPathDocs(schema), expected)
      // using extracted paths and docs as initial state
      assert.deepStrictEqual(extractPathDocs(schema, extractPathDocs(schema)), expected)
    })

    it('should build map paths with "*"', () => {
      const schema = {
        name: 'root',
        doc: 'The root',
        type: 'record',
        fields: [
          {
            name: 'a',
            type: 'record',
            fields: [
              {
                name: 'b',
                doc: 'Dictionary I',
                type: [
                  'null',
                  {
                    name: 'b', // it's the same name because it's nullable
                    type: 'map',
                    values: 'long'
                  }
                ]
              },
              {
                name: 'c',
                doc: 'Dictionary II',
                type: 'map',
                values: {
                  name: 'nullable_string',
                  type: ['null', 'string']
                }
              },
              {
                name: 'd',
                doc: 'Dictionary III (with children)',
                type: 'map',
                values: {
                  name: 'it_does_not_matter',
                  type: 'record',
                  fields: [
                    {
                      name: 'e',
                      doc: 'child',
                      type: 'string'
                    }
                  ]
                }
              },
              {
                name: 'f',
                doc: 'Dictionary IV',
                type: 'map',
                values: 'named_type'
              }
            ]
          }
        ]
      }
      const expected = {
        labels: {
          'a.b': 'Dictionary I',
          'a.c': 'Dictionary II',
          'a.d': 'Dictionary III (with children)',
          'a.d.*.e': 'child',
          'a.f': 'Dictionary IV'
        },
        paths: [
          'a',
          'a.b',
          'a.b.*',
          'a.c',
          'a.c.*',
          'a.d',
          'a.d.*',
          'a.d.*.e',
          'a.f',
          'a.f.*'
        ]
      }
      assert.deepStrictEqual(extractPathDocs(schema), expected)
      // using extracted paths and docs as initial state
      assert.deepStrictEqual(extractPathDocs(schema, extractPathDocs(schema)), expected)
    })

    it('should build array paths with "#"', () => {
      const schema = {
        name: 'root',
        doc: 'The root',
        type: 'record',
        fields: [
          {
            name: 'a',
            type: 'record',
            fields: [
              {
                name: 'b',
                doc: 'List I',
                type: [
                  'null',
                  {
                    name: 'b', // it's the same name because it's nullable
                    type: 'array',
                    items: 'long'
                  }
                ]
              },
              {
                name: 'c',
                doc: 'List II',
                type: 'array',
                items: {
                  name: 'nullable_string',
                  type: ['null', 'string']
                }
              },
              {
                name: 'd',
                doc: 'List III (with children)',
                type: 'array',
                items: {
                  name: 'it_does_not_matter',
                  type: 'record',
                  fields: [
                    {
                      name: 'e',
                      doc: 'child',
                      type: 'string'
                    }
                  ]
                }
              },
              {
                name: 'f',
                doc: 'List IV',
                type: 'array',
                items: 'named_type'
              }
            ]
          }
        ]
      }
      const expected = {
        labels: {
          'a.b': 'List I',
          'a.c': 'List II',
          'a.d': 'List III (with children)',
          'a.d.#.e': 'child',
          'a.f': 'List IV'
        },
        paths: [
          'a',
          'a.b',
          // 'a.b.#', // array of primitives are treated as leafs
          'a.c',
          // 'a.c.#', // array of primitives are treated as leafs
          'a.d',
          'a.d.#',
          'a.d.#.e',
          'a.f',
          'a.f.#'
        ]
      }
      assert.deepStrictEqual(extractPathDocs(schema), expected)
      // using extracted paths and docs as initial state
      assert.deepStrictEqual(extractPathDocs(schema, extractPathDocs(schema)), expected)
    })

    it('should not scream with union types', () => {
      // but I would do it
      const schema = {
        name: 'root',
        doc: 'The root',
        type: 'record',
        fields: [
          {
            name: 'a',
            type: 'record',
            fields: [
              {
                name: 'b',
                doc: 'Union I',
                type: [
                  'null',
                  'long',
                  'string',
                  { name: 'axes', type: 'enum', symbols: ['x', 'y', 'z'] },
                  { type: 'map', values: 'int' }
                ]
              }
            ]
          }
        ]
      }
      const expected = {
        labels: {
          'a.b': 'Union I'
        },
        paths: [
          'a',
          'a.b',
          'a.b.long',
          'a.b.string',
          'a.b.axes',
          'a.b.map',
          'a.b.map.*'
        ]
      }
      assert.deepStrictEqual(extractPathDocs(schema), expected)
      // using extracted paths and docs as initial state
      assert.deepStrictEqual(extractPathDocs(schema, extractPathDocs(schema)), expected)
    })

    it('should not overwrite initial state', () => {
      const schema = {
        name: 'root',
        doc: 'The root',
        type: 'record',
        fields: [
          {
            name: 'first',
            doc: 'The first',
            type: ['null', 'boolean']
          },
          {
            name: 'second',
            doc: 'The first',
            type: 'string'
          }
        ]
      }
      const initial = {
        labels: {
          unknown: 'who knows?', // there is no path for it but...
          first: 'The Second'
        },
        paths: ['zero', 'first']
      }
      const expected = {
        labels: {
          unknown: 'who knows?',
          first: 'The Second', // not replaced
          second: 'The first' // added
        },
        paths: [
          'zero',
          'first',
          'second' // added
        ]
      }
      assert.deepStrictEqual(extractPathDocs(schema, initial), expected)
    })
  })
})
