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

import XLSX from 'xlsx'
import moment from 'moment'

import { EXPORT_EXCEL_FORMAT } from './constants'
import { EXPORT_FORMAT, CSV_SEPARATOR } from './env'
import { getType, flatten, cleanPropertyName } from './types'

/**
 * Parses the value to string format based on locale and type.
 *
 * @param {*} value
 */
const parseValue = (value) => {
  if (!getType(value)) {
    return ''
  }

  // check the object type
  switch (getType(value)) {
    case 'int':
      return value.toLocaleString(navigator.language, {
        maximumFractionDigits: 0
      })

    case 'float':
      return value.toLocaleString(navigator.language, {
        style: 'decimal',
        minimumFractionDigits: 6
      })

    case 'bool':
      return (value ? 1 : 0)

    case 'datetime':
      return moment(value).format('YYYY-MM-DD HH:mm:ss.SSSSSSZZ')

    case 'date':
      return moment(value).format('YYYY-MM-DD')

    default:
      return value.toString()
  }
}

/**
 * Includes cleaned headers as first row, appends the data
 * (filling the gaps in the data columns).
 */
const parseContentRows = (headers, data) => ([
  headers.map(name => name.replace('.', ' ')).map(cleanPropertyName),
  ...data.map(row => headers.map(key => (row[key] || '')))
])

/**
 * Generates the file name including current timestamp.
 *
 * @param {string} filename   - file name
 * @param {string} extension  - file extension
 */
const buildFileName = (filename, extension) => (
  `${filename}-${moment().format('YYYY-MM-DD-HHmms')}.${extension}`
)

/**
 * Downloads blob content as a file.
 *
 * @param {Blob}   blob     - Blob content.
 * @param {string} filename - File name.
 */
export const downloadFile = (blob, filename = 'download') => {
  // triggers a file download by creating
  // a link object and simulating a click event.
  const link = document.createElement('a')
  link.style = 'display: none'
  link.download = filename
  link.href = window.URL.createObjectURL(blob)

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(link.href)
}

/**
 * Downloads content as CSV file.
 *
 * @param {array}  content  - An array of rows, each row is also an array of columns.
 * @param {string} filename - File name.
 */
const downloadCsv = (content, filename) => {
  const WRAP_STR = '"'
  const wrapper = (value) => WRAP_STR + value + WRAP_STR

  const csvContent = content.map(row => row.map(wrapper).join(CSV_SEPARATOR)).join('\n')
  const blob = new window.Blob([csvContent], {
    encoding: 'UTF-8',
    type: 'text/csv;charset=UTF-8'
  })
  downloadFile(blob, buildFileName(filename, 'csv'))
}

/**
 * Downloads content as XLSX file.
 *
 * @param {object} content  - Each key contains an array of rows,
 *                            each row is also an array of columns.
 *                            Keys are used as sheetnames.
 * @param {string} filename - File name.
 */
const downloadExcel = (content, filename) => {
  const workBook = XLSX.utils.book_new()

  // create one sheet per content property
  Object.keys(content)
    .filter(key => content[key].data.length)
    .forEach((key, index) => {
      const workSheet = XLSX.utils.json_to_sheet(content[key].data, {header: content[key].headers})
      const sheetname = key === '$' ? '#' : `#-${index}`
      XLSX.utils.book_append_sheet(workBook, workSheet, sheetname)
    })

  XLSX.writeFile(workBook, buildFileName(filename, 'xlsx'), {
    compression: true,
    type: 'binary',
    bookType: 'xlsx',
    Props: { Author: 'Gather on AETHER' }
  })
}

/**
 * Downloads content based on `EXPORT_FORMAT` value.
 *
 * @param {object} content - The extracted and parsed content.
 * @param {string} name    - File name.
  */
export const downloadContent = (content, name = 'data') => {
  if (EXPORT_FORMAT === EXPORT_EXCEL_FORMAT) {
    downloadExcel(content, name)
  } else {
    // create one file per content property
    Object.keys(content)
      .filter(key => content[key].data.length)
      .forEach((key, index) => {
        const rows = parseContentRows(content[key].headers, content[key].data)
        const filename = index ? `${name}-${index}` : name
        downloadCsv(rows, filename)
      })
  }
}

/**
 * Parses fetched results and includes them in the content object.
 *
 * Steps per result row:
 *   1. Flatten the row into a one level object with it’s path as key.
 *   2. Identifies row attributes, key name starts with "@".
 *   3. If one of the row keys contains an array, instead of flatten it
 *      creates a new group in the content result and includes there
 *      the array entries (including the row attributes in each one) as rows.
 *
 * @param {array}  results - unparsed results
 * @param {object} content - the accumulated parsed results
 * @param {string} group   - where to push the parsed results
 *                           use '$' for root values and named entries for array keys
 */
export const generateFileContent = (results, content = {}, group = '$') => {
  if (!content[group]) {
    content[group] = {
      data: [],
      headers: []
    }
  }
  const current = content[group]

  results.forEach(row => {
    const item = flatten(row)
    // @attributes
    const attributes = {}
    Object.keys(item)
      .filter(key => key.charAt(0) === '@')
      .forEach(key => {
        if (current.headers.indexOf(key) === -1) {
          current.headers.push(key)
        }
        attributes[key] = parseValue(item[key])
      })

    const data = { ...attributes }

    Object.keys(item)
      .filter(key => key.charAt(0) !== '@')
      .forEach(key => {
        const value = item[key]
        if (Object.prototype.toString.call(value) === '[object Array]') {
          // create new group and include array items there
          const nestedGroup = group + '.' + key
          const entries = value.map((entry, index) => {
            const base = {
              ...attributes, // always include attributes
              ['@' + nestedGroup]: index
            }
            if (getType(entry) === 'object') {
              return { ...base, ...entry }
            } else {
              return { ...base, value: entry }
            }
          })
          generateFileContent(entries, content, nestedGroup)
        } else {
          data[key] = parseValue(value)
          if (current.headers.indexOf(key) === -1) {
            current.headers.push(key)
          }
        }
      })
    current.data.push(data)
  })

  return content
}
