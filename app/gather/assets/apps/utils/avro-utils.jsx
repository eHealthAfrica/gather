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

// AVRO types:
// - primitive: null, boolean, int, long, float, double, bytes, string
// - complex: record, map, array, union, enum, fixed

const PRIMITIVE_TYPES = [
  // {"type": "aaa", "name": "a", doc: "b", ...}
  'null',
  'boolean',
  'int',
  'long',
  'float',
  'double',
  'bytes',
  'string',

  // these ones are not primitives but work the same
  // {"type": {"type": "enum", "name": "e", "symbols": ["A", "B", "C", "D"]}}
  'enum',
  // {"type": {"type": "fixed", "size": 16, "name": "f"}}
  'fixed'
]

export const isLeaf = (type) => (
  // Real primitives: {"type": "aaa"}
  PRIMITIVE_TYPES.indexOf(type) > -1 ||
  // Complex types but taken as primitives: {"type": {"type": "zzz"}}
  (type.type && isLeaf(type.type)) ||
  // array of primitives
  (type.type === 'array' && isLeaf(type.items)) ||
  // Union of primitives: {"type": ["aaa", "bbb", {"type": "zzz"}]}
  (Array.isArray(type) && type.filter(isLeaf).length === type.length)
)

export const extractPathDocs = (schema, options = {}) => {
  const walk = (field, parent = null) => {
    const jsonpath = parent ? `${parent}.${field.name}` : field.name
    paths.push(jsonpath)
    if (field.doc) {
      labels[jsonpath] = field.doc
    }

    // identify nested declared type
    // { "name": "a", "type": "t", ... } or
    // { "name": "a", "type": { "name": "b", "type": "t", ... } }
    let current = field.type.type ? field.type : field

    // real union or null? :scream:
    // { "type": ["null", "primitive"] } or
    // { "type": ["null", { "type": "complex" }] }
    if (Array.isArray(current.type)) {
      const notNull = current.type.filter(child => child !== 'null')
      if (notNull.length === 1) {
        // this sort of union indicates that null values are allowed
        // the real type is the indicated
        current = notNull[0]
      }
    }

    if (isLeaf(current)) {
      // leaf... nothing else to do
      return
    }

    if (current.type === 'record') {
      current.fields.forEach(child => {
        walk(child, jsonpath)
      })
    }

    if (current.type === 'map') {
      // indicate that the next property can be any
      // if "values" type is not a leaf and continue with them
      if (!isLeaf(current.values)) {
        walk(current.values, `${jsonpath}.*`)
      }
    }

    if (current.type === 'array') {
      // indicate that the next property can be any int
      // if "items" type is not a leaf and continue with them
      if (!isLeaf(current.items)) {
        walk(current.items, `${jsonpath}.#`)
      }
    }

    // union but not null :scream:
    if (Array.isArray(current.type)) {
      // http://dmg.org/pfa/docs/avro_types/#tagged-unions
      // this sort of union behaves like a "record" in which the keys are the
      // type names and the values depend on the types.
      //
      // {
      //   "name": "a",
      //   "type": [
      //     "null",
      //     "int",
      //     "string",
      //     { "type": "map", "values": ... },
      //     { "name": "b", "type": "record", "fields": [...] }
      //   ]
      // }
      //
      // { "a": null } or
      // { "a": { "int": 9 } } or
      // { "a": { "string": "whatever" } } or
      // { "a": { "map": {...} } } or
      // { "a": { "b": {...} } }
      current.type
        .filter(child => child !== 'null')
        .map(child => !child.type
          ? { name: child, type: child }
          : { name: child.type, ...child }
        )
        .forEach(type => {
          walk(type, jsonpath)
        })
    }
  }

  const labels = options.labels || {}
  const paths = options.paths || []

  // assumption: the intial schema is a record type
  schema.fields.forEach(field => {
    walk(field)
  })

  return {labels, paths}
}
