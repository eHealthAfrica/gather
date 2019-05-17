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

/* global describe, it, expect */

import React from 'react'
import { mountWithIntl } from 'enzyme-react-intl'

import FetchErrorAlert from './FetchErrorAlert'

describe('FetchErrorAlert', () => {
  it('should render the fetch error warning', () => {
    const component = mountWithIntl(<FetchErrorAlert />)
    expect(component.find('[data-qa="data-erred"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="data-erred"]').text())
      .toContain('Request was not successful')
  })

  it('should render the fetch error warning with the detailed message', () => {
    const error = {
      content: { detail: 'something went wrong' }
    }
    const component = mountWithIntl(<FetchErrorAlert error={error} />)
    expect(component.find('[data-qa="data-erred"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="data-erred"]').text())
      .toContain('Request was not successful')

    expect(component.find('[data-qa="data-erred-reason"]').exists()).toBeTruthy()
    expect(component.find('[data-qa="data-erred-reason"]').text())
      .toEqual('something went wrong')
  })
})
