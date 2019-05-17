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

import moment from 'moment'

const PATH_ARRAY = '#'
const PATH_MAP = '*'
const PATH_UNION = '?'

const DATE_FORMAT = 'YYYY-MM-DD'
const DATE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})$/

const TIME_FORMAT = 'HH:mm:ss'
const TIME_REGEXP = /^(\d{2}):(\d{2}):(\d{2})$/

const DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.S...Z'
const DATETIME_REGEXP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{1,6})(\+(\d{2}):(\d{2})|Z)+$/

const checkDate = (value, regexp, format) => (value.match(regexp) && moment(value, format).isValid())

/**
 * Checks if the given string value represents a date in `YYYY-MM-DD` format
 *
 * @param {string} value
 */
export const isDate = (value) => checkDate(value, DATE_REGEXP, DATE_FORMAT)

/**
 * Checks if the given string value represents a time in `HH[24]:MM:SS` format
 *
 * @param {string} value
 */
export const isTime = (value) => checkDate(value, TIME_REGEXP, TIME_FORMAT)

/**
 * Checks if the given string value represents a date+time in ISO 8601 format
 *
 * @param {string} value
 */
export const isDateTime = (value) => checkDate(value, DATETIME_REGEXP, DATETIME_FORMAT)

/**
 * Identifies the object type.
 * Returns `null` if even being a known type it can be considered as empty
 *
 * @param {any} value
 */
export const getType = (value) => {
  const NO_TYPE = null

  // null or undefined
  if (value === null || value === undefined) {
    return NO_TYPE
  }

  // check the object type
  switch (Object.prototype.toString.call(value)) {
    case '[object Object]':
      return Object.keys(value).length === 0 ? NO_TYPE : 'object'

    case '[object Array]':
      return value.length === 0 ? NO_TYPE : 'array'

    case '[object Number]':
      if (parseInt(value, 10) === value) {
        return 'int'
      }
      return 'float'

    case '[object Boolean]':
      return 'bool'

    case '[object Date]':
      return 'datetime'

    case '[object String]':
      if (value.toString().trim() === '') {
        return NO_TYPE
      }

      // should also check if the value represents a Date/time

      // like: 2017-09-09T14:16:05.869000+01:00
      if (isDateTime(value)) {
        return 'datetime'
      }

      // like: 2017-09-09
      if (isDate(value)) {
        return 'date'
      }

      // like: 14:16:05
      if (isTime(value)) {
        return 'time'
      }

      return 'string'
  }

  return NO_TYPE
}

/**
 * Flatten a deep object into a one level object with it’s path as key
 *
 * @param {object} object     - The object to be flattened
 * @param {string} separator  - The properties separator
 *
 * @return {object}           - The resulting flat object
 */
export const flatten = (object, separator = '.') => {
  // assumption: no property names contain `separator`
  // https://gist.github.com/penguinboy/762197#gistcomment-2168525

  const walker = (child, path = []) => Object.assign(
    {},
    ...Object.keys(child).map(key => (
      (getType(child[key]) === 'object')
        ? walker(child[key], path.concat([key]))
        : { [path.concat([key]).join(separator)]: child[key] }
    ))
  )

  return Object.assign({}, walker(object))
}

/**
 * Unflatten a one level object with its path as key into a deep object.
 *
 * @param {object} object     - The object to be unflattened
 * @param {string} separator  - The properties separator
 *
 * @return {object}           - The resulting unflat object
 */
export const unflatten = (object, separator = '.') => {
  const deepObject = {}
  Object.keys(object).forEach(path => {
    path.split(separator)
      .reduce((current, key, index, arr) => {
        const value = arr.length === index + 1 ? object[path] : {}
        current = current[key] = current[key] || value
        return current
      }, deepObject)
  })

  return deepObject
}

/**
 * Filter deep object properties by the allowed paths.
 *
 * @param {object} object     - The object to be filtered
 * @param {array}  paths      - The list of allowed paths
 * @param {string} separator  - The properties separator
 *
 * @return {object}           - The resulting unflat object
 */
export const filterByPaths = (object, paths, separator = '.') => {
  const flattenObject = flatten(object, separator)
  const filteredFlattenObject = {}
  paths.forEach(path => {
    Object.keys(flattenObject)
      .filter(key => key.indexOf(path) === 0)
      .forEach(key => {
        filteredFlattenObject[key] = flattenObject[key]
      })
  })
  return unflatten(filteredFlattenObject)
}

/**
 * Analyze the flattened keys structure to figure out how to build a table header.
 *
 * Data
 * ====
 *
 * {
 *   a: {
 *     b: {
 *       c: 1,
 *       d: 2
 *     },
 *     e: {
 *       f: true
 *     },
 *     g: []
 *   },
 *   h: 0
 * }
 *
 *
 * Flatten keys
 * ============
 *
 * [
 *   'a.b.c',
 *   'a.b.d',
 *   'a.e.f',
 *   'a.g',
 *   'h'
 * ]
 *
 *
 * Levels
 * ======
 *
 * [
 *   // level 0
 *   {
 *     'a': { key: 'a', siblings: 4, hasChildren: true, isLeaf: false },
 *     'h': { key: 'h', siblings: 1, hasChildren: false, isLeaf: true }
 *   },
 *   // level 1
 *   {
 *     'a.b': { key: 'a.b', siblings: 2, hasChildren: true, isLeaf: false },
 *     'a.e': { key: 'a.e', siblings: 1, hasChildren: true, isLeaf: false },
 *     'a.g': { key: 'a.g', siblings: 1, hasChildren: false, isLeaf: true }
 *   },
 *   // level 2
 *   {
 *     'a.b.c': { key: 'a.b.c', siblings: 1, hasChildren: false, isLeaf: true },
 *     'a.b.d': { key: 'a.b.d', siblings: 1, hasChildren: false, isLeaf: true },
 *     'a.e.f': { key: 'a.e.f', siblings: 1, hasChildren: false, isLeaf: true }
 *   }
 * ]
 *
 *
 * Table header
 * ============
 *
 * +----------------+---+
 * | A              | H |
 * +-------+---+----+   |
 * | B     | E | G  |   |
 * +---+---+---+    |   |
 * | C | D | F |    |   |
 * +---+---+---+----+---+
 * | 1 | 2 | T | [] | 0 |
 * +---+---+---+----+---+
 *
 *
 * @param {array}  jsonPaths - The flat object paths
 * @param {string} separator - The properties separator
 */
export const inflate = (jsonPaths, separator = '.') => {
  // assumption: no property names contain `separator`

  const depth = jsonPaths.reduce((acc, curr) => Math.max(acc, curr.split(separator).length), 0)
  const tree = []
  for (let level = 0; level < depth; level++) {
    tree.push({})

    // which headers are available at this level
    jsonPaths
      .filter(jsonPath => jsonPath.split(separator).length > level)
      .map(jsonPath => {
        const keys = jsonPath.split(separator)
        const key = keys.filter((_, i) => i <= level).join(separator)

        return {
          key,

          // replace `separator` with the common `.`
          path: key.replace(new RegExp('\\' + separator, 'g'), '.'),

          // if there are more nested properties
          hasChildren: keys.length > (level + 1),
          isLeaf: keys.length === (level + 1),

          // count the properties that start with this one (siblings at this tree level)
          // adding suffix `separator` skips the edge case
          // { a: 1, ab: { c: 1 } } -> { 'a': 1, 'ab.c': 1 }
          siblings: jsonPaths.filter(c => c.indexOf(key + separator) === 0).length || 1
        }
      })
      .forEach(column => {
        // this removes duplicates (sibling properties)
        tree[level][column.key] = column
      })
  }

  return tree
}

/**
 * Return the jsonpath label contained in the labels dictionary
 * otherwise return the last piece of the path (prettified)
 *
 * @param {string} jsonPath  - The jsonpath
 * @param {object} labels    - The labels dictionary
 * @param {string} separator - The properties separator
 *
 * @return {string}          - The label
 */
export const getLabel = (jsonPath, labels = {}, separator = '.') => {
  if (labels[jsonPath]) {
    return labels[jsonPath]
  }

  // if there are "union" properties "a.b.?.c.d"
  const unionKeys = Object.keys(labels)
    .filter(key => key.indexOf(`${separator}${PATH_UNION}`) > -1)
  for (let i = 0; i < unionKeys.length; i++) {
    const current = unionKeys[i]
    const cleaned = current.replace(`${separator}${PATH_UNION}`, '')
    if (cleaned === jsonPath) {
      return labels[current]
    }
  }

  // if there are "map" properties "a.b.*.c.d"
  const mapKeys = Object.keys(labels)
    .filter(key => key.indexOf(`${separator}${PATH_MAP}`) > -1)
  for (let i = 0; i < mapKeys.length; i++) {
    const current = mapKeys[i]
    // create the regular expression with the key value
    // "a.b.*.c.?.d.*.e" => /^a\.b\.([A-Za-z0-9_]+)\.c\.d\.([A-Za-z0-9_]+)\.e$/
    const re = current
      .replace(`${separator}${PATH_UNION}`, '') // remove union marks
      .split(separator)
      .map(piece => piece === PATH_MAP ? '([A-Za-z0-9_]+)' : piece)
      .join(`\\${separator}`)
    if (new RegExp('^' + re + '$').test(jsonPath)) {
      return labels[current]
    }
  }

  // split the compounded key into pieces and take the last one
  const pieces = jsonPath.split(separator)
  return sentenceCase(pieces[pieces.length - 1])
}

/**
 * Return the jsonpath tree labels "a.b.c.d" => "A / B / C / D"
 *
 * @param {string} jsonPath       - The jsonpath
 * @param {Object} labels         - The labels dictionary
 * @param {string} separator      - The properties separator
 * @param {string} labelSeparator - The separator between path labels
 *
 * @return {string}               - The tree labels
 */
export const getLabelTree = (jsonPath, labels = {}, separator = '.', labelSeparator = ' / ') => {
  const pieces = jsonPath.split(separator)
  return pieces
    // build the jsonpath based on current index
    // [a0, a1, a2, ...aI, ... aN] => a0.a1.___.aI
    .map((_, index, array) => getLabel(array.slice(0, index + 1).join(separator), labels, separator))
    .join(labelSeparator)
}

/**
 * Converts property name into sentence case
 *
 * - `my_name_is` into `my name is` (snake case)
 * - `myNameIs` into `my Name Is` (camel case)
 *
 * @param {string} name      - The uggly name
 *
 * @return {string}          - The prettified name (in sentence case)
 */
const sentenceCase = (name) => (name
  .replace(/_/g, ' ') //             convert `my_name_is` into `my name is`
  .replace(/([A-Z]+)/g, ' $1') //    convert `myNameIs` into `my Name Is`
  .replace(/([A-Z][a-z])/g, ' $1')
)

// not desired paths
const forbiddenPath = (jsonPath) => (
  // attributes "@attr"
  (jsonPath.charAt(0) === '@') ||
  // internal xForm properties
  ([
    '_id', '_version',
    'starttime', 'endtime', 'deviceid',
    'meta'
  ].indexOf(jsonPath) > -1) ||
  // "meta" children
  (jsonPath.indexOf('meta.') === 0) ||
  // AVRO array/ map/ union properties
  (
    jsonPath.indexOf(PATH_ARRAY) > -1 ||
    jsonPath.indexOf(PATH_MAP) > -1 ||
    jsonPath.indexOf(PATH_UNION) > -1
  )
)
// ["a", "a.b", "a.c"] => ["a.b", "a.c"]
const isLeaf = (jsonPath, _, array) => array.filter(
  anotherPath => anotherPath.indexOf(jsonPath + '.') === 0
).length === 0

/**
 * Return the cleaned list of jsonpaths.
 *
 * Remove paths like:
 *   - attributes, "@xxx"
 *   - xForm internal, "_id", "_version", ...
 *   - paths with AVRO internal flags, "#", "?", "*"
 *   - intermmediate paths, ["a", "a.b", "a.c"] => ["a.b", "a.c"]
 *
 * @param {array} jsonPaths  - The list of jsonpaths
 *
 * @return {array}           - The cleaned list
 */
export const cleanJsonPaths = (jsonPaths) => jsonPaths
  // remove undesired paths
  .filter(jsonPath => !forbiddenPath(jsonPath))
  // keep only the leafs
  .filter(isLeaf)
