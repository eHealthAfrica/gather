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

/**
 * Indicates if the given AVRO type accept null values or another type (but only one)
 *
 * {"type": [ "null", nullable_type ]} or {"type": [ nullable_type, "null" ]}
 *
 * @param {*} type   - The AVRO type
 *
 * @return {boolean} - true if type is an array of two elements and one of them is "null"
 *                     Otherwise false
 */
export const isNullable = (type) => (
  Array.isArray(type) && type.length === 2 && type.indexOf('null') > -1
)

/**
 * Indicates if the given AVRO type corresponds to an object leaf
 *
 * @param {*} type   - The AVRO type
 *
 * @return {boolean} - true if type is
 *                       - primitive or
 *                       - array of primitives or
 *                       - "nullable" primitive
 *                     Otherwise false
 *                       - record
 *                       - map
 *                       - tagged union
 */
export const isLeaf = (type) => (
  // Real primitives: {"type": "aaa"}
  PRIMITIVE_TYPES.indexOf(type) > -1 ||
  // Complex types but taken as primitives: {"type": {"type": "zzz"}}
  (type.type && isLeaf(type.type)) ||
  // array of primitives
  (type.type === 'array' && isLeaf(type.items)) ||
  // nullable primitive
  (isNullable(type) && type.filter(isLeaf).length === type.length)
)

/**
 * Extracts the "doc" properties of the AVRO schema and generates
 * the list of possible jsonpaths
 *
 * @param {object} schema   - The AVRO schema
 * @param {object} state    - The initial jsonpaths ("paths") and labels ("labels")
 *
 * @return {object}         - The possible jsonpaths and their "doc" properties
 */
export const extractPathDocs = (schema, state = {}) => {
  const walker = (field, parent = null) => {
    const jsonPath = parent ? `${parent}.${field.name}` : field.name
    if (paths.indexOf(jsonPath) === -1) {
      paths.push(jsonPath)
    }
    if (field.doc && !labels[jsonPath]) {
      labels[jsonPath] = field.doc
    }

    let current = field

    // "nullable"
    // { "type": [ "null", nullable_type ]} or { "type": [ nullable_type, "null" ]}
    if (isNullable(current.type)) {
      current = current.type.filter(child => child !== 'null')[0]
    }

    if (isLeaf(current)) {
      // leaf... nothing else to do
      return
    }

    if (current.type === 'record') {
      current.fields.forEach(child => {
        walker(child, jsonPath)
      })
    }

    if (current.type === 'map') {
      // indicate that the next property can be any with "*" name
      const mapType = current.values.type ? current.values : {type: current.values}
      walker({...mapType, name: '*'}, jsonPath)
    }

    if (current.type === 'array') {
      // indicate that the next property can be any int with "#"
      const arrayType = current.items.type ? current.items : {type: current.items}
      walker({...arrayType, name: '#'}, jsonPath)
    }

    // union but not nullable :scream:
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
          walker(type, jsonPath)
        })
    }

    // TODO: named types  ¯\_(ツ)_/¯
  }

  const labels = state.labels || {}
  const paths = state.paths || []

  // assumption: the initial type is "record"
  schema.fields.forEach(field => { walker(field) })
  return {labels, paths}
}
