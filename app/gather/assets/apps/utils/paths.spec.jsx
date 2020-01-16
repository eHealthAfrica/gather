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
  buildQueryString,
  getEntitiesAPIPath,
  getAttachmentContentPath,
  getMediaFileContentPath,
  getMasksAPIPath,
  getMediaFileAPIPath,
  getSurveyorsAPIPath,
  getSurveyorsPath,
  getSurveysAPIPath,
  getSurveysPath,
  getXFormsAPIPath
} from './paths'

describe('paths utils', () => {
  describe('getMasksAPIPath', () => {
    it('should return the Mask API path', () => {
      assert.strictEqual(getMasksAPIPath({}), '/api/gather/masks.json')
      assert.strictEqual(getMasksAPIPath({ format: '' }), '/api/gather/masks/')
      assert.strictEqual(getMasksAPIPath({ id: 1 }), '/api/gather/masks/1.json')
      assert.strictEqual(getMasksAPIPath({ id: 1, format: '' }), '/api/gather/masks/1/')
    })
  })

  describe('getMediaFileAPIPath', () => {
    it('should return the Media Files API path', () => {
      assert.strictEqual(getMediaFileAPIPath({}), '/api/odk/media-files.json')
      assert.strictEqual(getMediaFileAPIPath({ id: 1 }), '/api/odk/media-files/1.json')
    })
  })

  describe('getAttachmentContentPath', () => {
    it('should return the Attachment content path', () => {
      assert.strictEqual(
        getAttachmentContentPath({ id: 1 }),
        '/api/kernel/attachments/1/content/?passthrough=true')
    })
  })

  describe('getMediaFileContentPath', () => {
    it('should return the Media Files content path', () => {
      assert.strictEqual(getMediaFileContentPath({ id: 1 }), '/api/odk/media-files/1/content/')
    })
  })

  describe('getSurveysAPIPath', () => {
    describe('without app or `kernel` app', () => {
      const prefix = '/api/kernel/'

      // NOTE: the `passthrough` parameter is ALWAYS included,
      // this does not apply to rest of parameters

      it('should return the Surveys API path', () => {
        assert.strictEqual(getSurveysAPIPath({}), prefix + 'projects.json?passthrough=true')
        assert.strictEqual(getSurveysAPIPath({ id: 1 }), prefix + 'projects/1.json?passthrough=true')
      })

      it('should return the Surveys Stats API path', () => {
        assert.strictEqual(
          getSurveysAPIPath({ app: 'kernel', withStats: true }),
          prefix + 'projects-stats.json?passthrough=true')
        assert.strictEqual(
          getSurveysAPIPath({ withStats: true, id: 1 }),
          prefix + 'projects-stats/1.json?passthrough=true')
      })

      it('should return the Surveys API path with search', () => {
        assert.strictEqual(
          getSurveysAPIPath({ search: 'survey' }),
          prefix + 'projects.json?passthrough=true&search=survey')
      })

      it('should return the Surveys API path without search', () => {
        assert.strictEqual(
          getSurveysAPIPath({ search: 'survey', id: 1 }),
          prefix + 'projects/1.json?passthrough=true')
      })

      it('should return the Surveys API path with the POST option', () => {
        assert.strictEqual(
          getSurveysAPIPath({ app: 'kernel', format: 'txt', action: 'fetch' }),
          prefix + 'projects/fetch.txt?passthrough=true')
        assert.strictEqual(
          getSurveysAPIPath({ app: 'kernel', format: 'txt', action: 'details', id: 1 }),
          prefix + 'projects/1/details.txt?passthrough=true')
      })
    })

    describe('with `odk` app', () => {
      const prefix = '/api/odk/'

      it('should return the Surveys API path', () => {
        assert.strictEqual(getSurveysAPIPath({ app: 'odk' }), prefix + 'projects.json')
        assert.strictEqual(getSurveysAPIPath({ app: 'odk', id: 1 }), prefix + 'projects/1.json')
      })

      it('should not return the Surveys Stats API path', () => {
        assert.strictEqual(getSurveysAPIPath({ app: 'odk', withStats: true }), prefix + 'projects.json')
        assert.strictEqual(getSurveysAPIPath({ app: 'odk', withStats: true, id: 1 }), prefix + 'projects/1.json')
      })

      it('should return the Surveys API path with search', () => {
        assert.strictEqual(getSurveysAPIPath({ app: 'odk', search: 'survey' }), prefix + 'projects.json?search=survey')
      })

      it('should return the Surveys API path without search', () => {
        assert.strictEqual(getSurveysAPIPath({ app: 'odk', search: 'survey', id: 1 }), prefix + 'projects/1.json')
      })

      it('should return the Surveys API path with the POST option', () => {
        assert.strictEqual(
          getSurveysAPIPath({ app: 'odk', format: 'txt', action: 'fetch' }),
          prefix + 'projects/fetch.txt')
        assert.strictEqual(
          getSurveysAPIPath({ app: 'odk', format: 'txt', action: 'details', id: 1 }),
          prefix + 'projects/1/details.txt')
      })
    })
  })

  describe('getEntitiesAPIPath', () => {
    const prefix = '/api/kernel/'

    // NOTE: the `passthrough` parameter is ALWAYS included,
    // this does not apply to rest of parameters

    it('should return the Entities API path', () => {
      assert.strictEqual(getEntitiesAPIPath({}), prefix + 'entities.json?passthrough=true')
    })

    it('should return the Survey Entities API path', () => {
      assert.strictEqual(
        getEntitiesAPIPath({ project: 1 }),
        prefix + 'entities.json?passthrough=true&project=1')
    })

    it('should return the Surveys Entities API path with search', () => {
      assert.strictEqual(
        getEntitiesAPIPath({ search: 'survey' }),
        prefix + 'entities.json?passthrough=true&search=survey')
    })

    it('should return the Surveys Entities API path without search', () => {
      assert.strictEqual(
        getEntitiesAPIPath({ search: 'survey', id: 1 }),
        prefix + 'entities/1.json?passthrough=true')
    })
  })

  describe('getSurveyorsAPIPath', () => {
    const prefix = '/api/odk/'

    it('should return the Surveyors API path', () => {
      assert.strictEqual(getSurveyorsAPIPath({}), prefix + 'surveyors.json')
      assert.strictEqual(getSurveyorsAPIPath({ id: 1 }), prefix + 'surveyors/1.json')
    })

    it('should return the Surveyors API path filtering by survey', () => {
      assert.strictEqual(getSurveyorsAPIPath({ project: 1 }), prefix + 'surveyors.json?project=1')
    })

    it('should return the Surveyors API path but not filtering by survey', () => {
      assert.strictEqual(getSurveyorsAPIPath({ project: 1, id: 1 }), prefix + 'surveyors/1.json')
    })

    it('should return the Surveyors API path with search', () => {
      assert.strictEqual(getSurveyorsAPIPath({ search: 'surveyor' }), prefix + 'surveyors.json?search=surveyor')
    })

    it('should return the Surveyors API path without search', () => {
      assert.strictEqual(getSurveyorsAPIPath({ search: 'surveyor', id: 1 }), prefix + 'surveyors/1.json')
    })
  })

  describe('getXFormsAPIPath', () => {
    const prefix = '/api/odk/'

    it('should return the xForms API path', () => {
      assert.strictEqual(getXFormsAPIPath({}), prefix + 'xforms.json')
    })

    it('should return the xForms API path filtering by survey', () => {
      assert.strictEqual(getXFormsAPIPath({ project: 1 }), prefix + 'xforms.json?project=1')
    })

    it('should return the xForms API path with search', () => {
      assert.strictEqual(getXFormsAPIPath({ search: 'survey' }), prefix + 'xforms.json?search=survey')
    })
  })

  describe('getSurveysPath', () => {
    it('should return the Surveys path based on arguments', () => {
      assert.strictEqual(getSurveysPath({}), '/surveys/list/')
      assert.strictEqual(getSurveysPath({ action: 'list' }), '/surveys/list/')
      assert.strictEqual(getSurveysPath({ action: 'list', id: 1 }), '/surveys/list/')
      assert.strictEqual(getSurveysPath({ action: 'unknown-action' }), '/surveys/list/')
      assert.strictEqual(getSurveysPath({ action: 'view' }), '/surveys/list/', '"view" without "id" is "list"')
      assert.strictEqual(getSurveysPath({ action: 'view', id: 1 }), '/surveys/view/1')
      assert.strictEqual(getSurveysPath({ action: 'add' }), '/surveys/add/')
      assert.strictEqual(getSurveysPath({ action: 'edit' }), '/surveys/add/', '"edit" without "id" is "add"')
      assert.strictEqual(getSurveysPath({ action: 'edit', id: 1 }), '/surveys/edit/1')
    })
  })

  describe('getSurveyorsPath', () => {
    it('should return the Surveyors path based on arguments', () => {
      assert.strictEqual(getSurveyorsPath({}), '/surveyors/list/')
      assert.strictEqual(getSurveyorsPath({ action: 'list' }), '/surveyors/list/')
      assert.strictEqual(getSurveyorsPath({ action: 'list', id: 1 }), '/surveyors/list/')
      assert.strictEqual(getSurveyorsPath({ action: 'unknown-action', id: 1 }), '/surveyors/list/')
      assert.strictEqual(getSurveyorsPath({ action: 'view' }), '/surveyors/list/', 'no "view" action available')
      assert.strictEqual(getSurveyorsPath({ action: 'view', id: 1 }), '/surveyors/list/', 'no "view" action available')
      assert.strictEqual(getSurveyorsPath({ action: 'add' }), '/surveyors/add/')
      assert.strictEqual(getSurveyorsPath({ action: 'edit' }), '/surveyors/add/', '"edit" without "id" is "add"')
      assert.strictEqual(getSurveyorsPath({ action: 'edit', id: 1 }), '/surveyors/edit/1')
    })
  })

  describe('buildQueryString', () => {
    it('should build query string path based on arguments', () => {
      assert.strictEqual(buildQueryString(), '')
      assert.strictEqual(buildQueryString({}), '')
      assert.strictEqual(buildQueryString({ param_1: 1 }), 'param_1=1')
      assert.strictEqual(buildQueryString({ param_1: 1, param_2: 2 }), 'param_1=1&param_2=2')
    })

    it('should change parameter names from titleCase to snake_case', () => {
      assert.strictEqual(buildQueryString({ param1: 1 }), 'param1=1')
      assert.strictEqual(buildQueryString({ paRam: 1, parAm: 2 }), 'pa_ram=1&par_am=2')
      // to take in mind:
      // - always ignore first letter
      // - joined capitalized letters are taken as a whole piece
      assert.strictEqual(buildQueryString({ Abcdef: 1 }), 'abcdef=1')
      assert.strictEqual(buildQueryString({ ABCDEF: 1 }), 'a_bcdef=1')
      assert.strictEqual(buildQueryString({ aBCDef: 1 }), 'a_bcdef=1')
      assert.strictEqual(buildQueryString({ aBcDEf: 1 }), 'a_bc_def=1')
    })

    it('should encode parameter values', () => {
      assert.strictEqual(buildQueryString({ a: '1,2 3' }), 'a=1%2C2%203')
    })
  })
})
