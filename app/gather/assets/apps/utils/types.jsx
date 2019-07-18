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
const PATH_SEPARATOR = '.'

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
 * Flatten a deep object into a one level object with its path as key.
 * It doesn’t flat array properties.
 *
 * @param {object} object     - The object to be flattened
 * @param {string} separator  - The properties separator
 *
 * @return {object}           - The resulting flat object
 */
export const flatten = (object, separator = PATH_SEPARATOR) => {
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
export const unflatten = (object, separator = PATH_SEPARATOR) => {
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
 * @return {object}           - The resulting filtered object
 */
export const filterByPaths = (object, paths, separator = PATH_SEPARATOR) => {
  const flattenObject = flatten(object, separator)
  const filteredFlattenObject = {}
  paths.forEach(path => {
    Object.keys(flattenObject)
      .filter(key => key === path || key.indexOf(`${path}${separator}`) === 0)
      .forEach(key => {
        filteredFlattenObject[key] = flattenObject[key]
      })
  })
  return unflatten(filteredFlattenObject, separator)
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
export const inflate = (jsonPaths, separator = PATH_SEPARATOR) => {
  // assumption: no property names contain `separator` or `.`

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
          path: separator === PATH_SEPARATOR ? key : key.split(separator).join(PATH_SEPARATOR),

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
export const getLabel = (jsonPath, labels = {}, separator = PATH_SEPARATOR) => {
  if (labels[jsonPath]) {
    return labels[jsonPath]
  }

  // if there are "union" properties "a.b.?.c.d"
  const unionKeys = Object.keys(labels).filter(k => containsPathKey(k, PATH_UNION, separator))
  for (let i = 0; i < unionKeys.length; i++) {
    const current = unionKeys[i]
    if (removePathKey(current, PATH_UNION, separator) === jsonPath) {
      return labels[current]
    }
  }

  // if there are "map" properties "a.b.*.c.d"
  const mapKeys = Object.keys(labels).filter(k => containsPathKey(k, PATH_MAP, separator))
  for (let i = 0; i < mapKeys.length; i++) {
    const current = mapKeys[i]
    if (getRegExp(current, separator).test(jsonPath)) {
      return labels[current]
    }
  }

  // split the compounded key into pieces and take the last one
  const pieces = jsonPath.split(separator)
  return toSentenceCase(pieces[pieces.length - 1])
}

/**
 * Return the jsonpath tree labels "a.b.c.d" => "A / B / C / D"
 *
 * @param {string} jsonPath       - The jsonpath
 * @param {Object} labels         - The labels dictionary
 * @param {string} labelSeparator - The separator between path labels
 * @param {string} separator      - The properties separator
 *
 * @return {string}               - The tree labels
 */
export const getLabelTree = (jsonPath, labels = {}, labelSeparator = ' / ', separator = PATH_SEPARATOR) => (
  jsonPath
    .split(separator)
    // build the jsonpath based on current index
    // [a0, a1, a2, ...aI, ... aN] => a0.a1.___.aI
    .map((_, index, self) => getLabel(self.slice(0, index + 1).join(separator), labels, separator))
    .join(labelSeparator)
)

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
 * @param {string} separator - The properties separator
 *
 * @return {array}           - The cleaned list
 */
export const cleanJsonPaths = (jsonPaths, separator = PATH_SEPARATOR) => jsonPaths
  // remove undesired paths
  .filter(jsonPath => !isForbiddenPath(jsonPath))
  // keep only the leafs
  // ["a", "a.b", "a.c"] => ["a.b", "a.c"]
  .filter((item, _, self) =>
    self.filter(entry => entry.indexOf(`${item}${separator}`) === 0).length === 0
  )
  // remove possible duplicates
  .filter(removeDups)

/**
 * Rebuild the object keys in the indicated order.
 *
 * @param {object} object     - The object to be reordered
 * @param {array}  jsonPaths  - The list of ordered json paths
 * @param {string} separator  - The properties separator
 *
 * @return {object}           - The resulting "reordered" object
 */
export const reorderObjectKeys = (obj, jsonPaths, separator = PATH_SEPARATOR) => {
  // Issue: the paths contain also the AVRO internal flags, "#", "?", "*"

  // if there are "union" properties "a.b.?.c.d" (remove mark)
  // if there are "array" properties "a.b.#.c.d" (iterate values)
  // if there are "map" properties "a.b.*.c.d" (keep keys in appearance order)

  const getChildPaths = (paths, key) => (
    paths
      .filter(path => path.indexOf(`${key}${separator}`) === 0)
      .map(path => path.substring(key.length + separator.length))
  )

  const walker = (currentObj, currentPaths) => {
    const keys = currentPaths.filter(path => path.split(separator).length === 1)
    if (keys.length === 0 || isLeafValue(currentObj)) {
      return currentObj
    }

    // ARRAY values take precedence over the rest
    if (keys.indexOf(PATH_ARRAY) > -1 && isArrayValue(currentObj)) {
      const aPaths = getChildPaths(currentPaths, PATH_ARRAY)
      return currentObj.map(item => walker(item, aPaths))
    }

    // MAP paths take precedence over the rest
    if (keys.indexOf(PATH_MAP) > -1 && isObjectValue(currentObj)) {
      const mPaths = getChildPaths(currentPaths, PATH_MAP)
      const res = {}
      Object.keys(currentObj).forEach(k => {
        res[k] = walker(currentObj[k], mPaths)
      })
      return res
    }

    const result = {}
    keys
      .filter(key => key !== PATH_ARRAY && key !== PATH_MAP)
      .forEach(key => {
        const nextPaths = getChildPaths(currentPaths, key)
        if (currentObj && currentObj[key] !== undefined) {
          result[key] = walker(currentObj[key], nextPaths)
        }
      })
    return result
  }

  // Remove UNION flags (and produced duplicates)
  // Note: union types could lead to this situation:
  //       having the union of two types like {a, b, c} and {c, a, x, y}
  //       with our approach the resultant object would have these
  //       ordered keys {a, c, x, y}
  //       but this case is only possible using named types and
  //       so far we are not supporting them thus we ignore it
  const paths = jsonPaths
    .map(path => removePathKey(path, PATH_UNION))
    .filter(removeDups)

  return walker(obj, paths)
}

// create the regular expression with the path value
// "a.b.*.c.?.d.*.e"  =>  /^a\.b\.([A-Za-z0-9_]+)\.c\.d\.([A-Za-z0-9_]+)\.e$/
const getRegExp = (path, separator) => {
  const re = path
    .split(separator)
    // remove UNION mark
    .filter(piece => piece !== PATH_UNION)
    // replace MAP mark with its regular expression
    // From AVRO specs: start with [A-Za-z_] subsequently contain only [A-Za-z0-9_]
    // We are less strict.
    .map(piece => piece === PATH_MAP ? '([A-Za-z0-9_]+)' : piece)
    .join(`\\${separator}`)
  return new RegExp('^' + re + '$')
}

/**
 * Converts string into sentence case
 *
 * - `my_name_is` into `my name is` (snake case)
 * - `myNameIs` into `my Name Is` (camel case)
 *
 * @param {string} value     - The uggly name
 *
 * @return {string}          - The prettified name (in sentence case)
 */
const toSentenceCase = (value) => (
  value
    .replace(/_/g, ' ') //             convert `my_name_is` into `my name is`
    .replace(/([A-Z]+)/g, ' $1') //    convert `myNameIs` into `my Name Is`
    .replace(/([A-Z][a-z])/g, ' $1')
)

// not desired paths
const isForbiddenPath = (jsonPath, separator) => (
  // attributes "@attr"
  (jsonPath.charAt(0) === '@') ||
  // internal xForm properties
  (['_id', '_version', 'starttime', 'endtime', 'deviceid'].indexOf(jsonPath) > -1) ||
  // "meta" xForm object
  (containsPathKey(jsonPath, 'meta', separator)) ||
  // AVRO array/ map/ union properties
  (containsPathKeys(jsonPath, [PATH_ARRAY, PATH_MAP, PATH_UNION, separator]))
)

// remove duplicated entries (keep first appearance)
// ["a", "x", "a"] => ["a", "x"]
const removeDups = (item, index, self) => self.indexOf(item) === index

// remove property in jsonpath
const removePathKey = (jsonPath, key, separator = PATH_SEPARATOR) => (
  jsonPath.split(separator).filter(p => p !== key).join(separator)
)

const containsPathKey = (jsonPath, key, separator = PATH_SEPARATOR) => (
  jsonPath.split(separator).filter(p => p === key).length > 0
)

const containsPathKeys = (jsonPath, keys, separator = PATH_SEPARATOR) => (
  jsonPath.split(separator).filter(p => keys.indexOf(p) > -1).length > 0
)

const isObjectValue = (value) => getType(value) === 'object'
const isArrayValue = (value) => getType(value) === 'array'
const isLeafValue = (value) => !isObjectValue(value) && !isArrayValue(value)
