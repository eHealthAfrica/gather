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
import { mountWithIntl } from '../../tests/enzyme-helpers'
import { FormattedDate, FormattedTime } from 'react-intl'

import FullDateTime from './FullDateTime'
import RelativeTime from './RelativeTime'

describe('FullDateTime', () => {
  it('should render nothing without a date', () => {
    const component = mountWithIntl(<FullDateTime />)

    expect(component.find(FormattedDate).exists()).toBeFalsy()
    expect(component.find(FormattedTime).exists()).toBeFalsy()
    expect(component.find(RelativeTime).exists()).toBeFalsy()
  })

  it('should render the full date time', () => {
    const component = mountWithIntl(<FullDateTime date={new Date()} />)

    expect(component.find(FormattedDate).exists()).toBeTruthy()
    expect(component.find(FormattedTime).exists()).toBeTruthy()
    expect(component.find(RelativeTime).exists()).toBeTruthy()
  })
})
