/*
 * Copyright (C) 2020 by eHealth Africa : http://www.eHealthAfrica.org
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

import React from 'react'
import { FormattedRelativeTime, injectIntl } from 'react-intl'
import { selectUnit } from '@formatjs/intl-utils'

import { DASH } from '../utils/constants'

// Import intl-relativetimeformat polyfill for unsupported environments
if (!window.Intl || !Object.keys(window.Intl).length) {
  require('@formatjs/intl-relativetimeformat/polyfill')
  require('@formatjs/intl-relativetimeformat/dist/locale-data/en')
}

const DATE_OPTIONS = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}

const TIME_OPTIONS = {
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'short'
}

const RelativeTime = ({ date, intl: { formatDate, formatTime } }) => {
  if (!date) return <div />

  const { value, unit } = selectUnit(new Date(date))
  const title = formatDate(date, DATE_OPTIONS) + ' ' + DASH + ' ' + formatTime(date, TIME_OPTIONS)

  return (
    <span title={title}>
      <FormattedRelativeTime value={value} unit={unit} />
    </span>
  )
}

export default injectIntl(RelativeTime)
