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

import { isLeaf, extractPathDocs } from './avro-utils'

describe('AVRO utils', () => {
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

      assert(isLeaf({type: 'null'}))
      assert(isLeaf({type: 'boolean'}))
      assert(isLeaf({type: 'int'}))
      assert(isLeaf({type: 'long'}))
      assert(isLeaf({type: 'float'}))
      assert(isLeaf({type: 'double'}))
      assert(isLeaf({type: 'bytes'}))
      assert(isLeaf({type: 'string'}))
      assert(isLeaf({type: 'enum'}))
      assert(isLeaf({type: 'fixed'}))
    })

    it('should detect complex types', () => {
      assert(!isLeaf({type: 'array', items: 'another_type'}))
      assert(!isLeaf({type: 'record'}))
      assert(!isLeaf({type: 'map'}))
    })

    it('should flag as leaf certain complex types', () => {
      assert(isLeaf(['null', 'int']))
      assert(isLeaf(['null', {type: 'enum'}]))
      assert(!isLeaf(['null', 'int', {type: 'record'}]))

      assert(isLeaf({type: 'array', items: 'long'}))
      assert(!isLeaf({type: 'array', items: {type: 'map'}}))
    })
  })

  describe('extractPathDocs', () => {
    it('should get take the "doc" property', () => {
      const docs = extractPathDocs({
        name: 'root',
        doc: 'The root',
        type: 'record',
        fields: [
          {
            name: 'first',
            doc: 'The first',
            type: 'boolean'
          }
        ]
      })
      const expected = {first: 'The first'}
      assert.deepEqual(docs, expected)
    })
    it('should no create any entry if no "doc"', () => {
      const docs = extractPathDocs({
        name: 'root',
        doc: 'The root',
        type: 'record',
        fields: [
          {
            name: 'first',
            type: 'boolean'
          }
        ]
      })
      const expected = {}
      assert.deepEqual(docs, expected)
    })
  })
})
