/*
 * Copyright (C) 2021 by eHealth Africa : http://www.eHealthAfrica.org
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

import React, { useState } from 'react'
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl'

import { goTo } from '../../utils'
import { getSurveysPath, getSurveysAPIPath } from '../../utils/paths'
import { patchData } from '../../utils/request'

const MESSAGES = defineMessages({
  errorExtract: {
    defaultMessage: 'Unexpected error while extracting missing records',
    id: 'extract.button.error'
  }
})

const ExtractButton = ({
  survey: { id, pending_submissions_count: pendingCount },
  intl: { formatMessage }
}) => {
  const [running, setRunning] = useState(false)

  const onDone = (error, odk) => {
    setRunning(false)

    if (error) {
      window.alert(formatMessage(MESSAGES.errorExtract) + '\n' + error.toString())
    }

    // refresh page
    goTo(getSurveysPath({ action: 'view', id }))
  }

  const extract = () => {
    setRunning(true)
    patchData(getSurveysAPIPath({ id, action: 'extract' }))
      .then((resp) => { console.log(resp); onDone() })
      .catch(error => { onDone(error, false) })
  }

  if (pendingCount === 0) return ''

  return (
    <button
      type='button'
      className='btn btn-secondary btn-icon me-3'
      disabled={running}
      onClick={() => { extract() }}
    >
      <i className='fas fa-share invert me-3' />
      <FormattedMessage
        id='survey.view.action.extract'
        defaultMessage='Extract missing records'
      />
    </button>
  )
}

export default injectIntl(ExtractButton)
