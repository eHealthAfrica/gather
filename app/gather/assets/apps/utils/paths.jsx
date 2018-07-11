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

import { KERNEL_APP, ODK_APP, GATHER_APP } from './constants'

const API_PREFIX = ''
const APPS = [ KERNEL_APP, ODK_APP, GATHER_APP ]

/**
 * Returns the API url to get the Projects/Surveys data
 *
 * Internally in Aether the concept is Project but in Gather it refers to Survey.
 *
 * @param {string}  app          - app source: `kernel` (default), `odk` or `gather`
 * @param {number}  id           - project/survey id
 * @param {boolean} withStats    - include project/survey stats?
 * @param {object}  params       - query string parameters
 */
export const getSurveysAPIPath = ({app, id, withStats, ...params}) => {
  const source = (APPS.indexOf(app) === -1 ? KERNEL_APP : app)
  const stats = (source === KERNEL_APP && withStats ? '-stats' : '')

  return buildAPIPath(source, `projects${stats}`, id, {...params})
}

/**
 * Returns the API url to get the Surveyors data
 *
 * @param {number}  id          - surveyor id
 * @param {object}  params      - query string parameters
 */
export const getSurveyorsAPIPath = ({id, ...params}) => {
  return buildAPIPath(ODK_APP, 'surveyors', id, params)
}

/**
 * Returns the API url to get the XForms data
 *
 * @param {number}  id          - xForm id
 * @param {object}  params      - query string parameters
 */
export const getXFormsAPIPath = ({id, ...params}) => {
  return buildAPIPath(ODK_APP, 'xforms', id, params)
}

/**
 * Returns the API url to get the Media Files data
 *
 * @param {number}  id          - Media file id *
 * @param {object}  params      - query string parameters
 */
export const getMediaFileAPIPath = ({id, ...params}) => {
  return buildAPIPath(ODK_APP, 'media-files', id, params)
}

/**
 * Returns the API url to get the Entities data by Survey
 *
 * @param {number}  id          - Entity id
 * @param {object}  params      - query string parameters
 */
export const getEntitiesAPIPath = ({id, ...params}) => {
  return buildAPIPath(KERNEL_APP, 'entities', id, params)
}

/**
 * Returns the API url to get the Masks data
 *
 * @param {number}  id          - mask id *
 * @param {object}  params      - query string parameters
 */
export const getMasksAPIPath = ({id, ...params}) => {
  return buildAPIPath(GATHER_APP, 'masks', id, params)
}

/**
 * Return the REST API url
 *
 * Without "action":
 *
 *    With    {id} -> {app}/{type}/{id}.{format}?{queryString}
 *    Without {id} -> {app}/{type}.{format}?{queryString}
 *
 * With "action":
 *
 *    With    {id} -> {app}/{type}/{id}/{action}.{format}?{queryString}
 *    Without {id} -> {app}/{type}/{action}.{format}?{queryString}
 *
 * @param {string}  app         - app source: `kernel`, `odk` or `gather`
 * @param {string}  type        - item type
 * @param {number}  id          - item id
 * @param {string}  format      - response format
 * @param {string}  action      - special suffix to include before the format
 * @param {object}  params      - query string parameters
 */
const buildAPIPath = (app, type, id, {format = 'json', action, ...params}) => {
  const suffix = (
    (id ? '/' + id : '') +
    // indicates the action suffix like "details", "csv", "xlsx" or "propagates"
    (action ? '/' + action : ''))
  const formatSuffix = (format === '' ? '/' : '.' + format)
  const url = `${API_PREFIX}/${app}/${type}${suffix}${formatSuffix}`
  const queryString = id ? '' : buildQueryString(params)

  return queryString === '' ? url : `${url}?${queryString}`
}

/**
 * Builds the query string based on arguments
 */
export const buildQueryString = (params = {}) => (
  Object
    .keys(params)
    .filter(key => (
      params[key] !== undefined &&
      params[key] !== null &&
      params[key].toString().trim() !== ''
    ))
    .map(key => ([
      // transforms `key` from camelCase (js convention) into snake_case (python convention)
      key.replace(/(.)([A-Z]+)/g, '$1_$2').toLowerCase(),
      // encodes `value` to use it in URL addresses
      encodeURIComponent(params[key])
    ]))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
)

/**
 * Returns the path to go to any Surveys page
 *
 * @param {string} action       - action: `list` (default), `view`, `add`, `edit`
 * @param {number} id           - project/survey id
 */
export const getSurveysPath = ({action, id}) => {
  switch (action) {
    case 'edit':
      if (id) {
        return `/surveys/edit/${id}`
      }
      return '/surveys/add/'

    case 'add':
      return '/surveys/add/'

    case 'view':
      if (id) {
        return `/surveys/view/${id}`
      }
      return '/surveys/list/'

    default:
      return '/surveys/list/'
  }
}

/**
 * Returns the path to go to any Surveyors page
 *
 * @param {string} action       - action: `list` (default), `add`, `edit`
 * @param {number} id           - surveyor id
 */
export const getSurveyorsPath = ({action, id}) => {
  switch (action) {
    case 'edit':
      if (id) {
        return `/surveyors/edit/${id}`
      }
      return '/surveyors/add/'

    case 'add':
      return '/surveyors/add/'

    default:
      return '/surveyors/list/'
  }
}
