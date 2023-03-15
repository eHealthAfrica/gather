/*
 * Copyright (C) 2023 by eHealth Africa : http://www.eHealthAfrica.org
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

import WindowAlert from '../../components/WindowAlert'
import { ODK_APP } from '../../utils/constants'
import { getSurveysAPIPath } from '../../utils/paths'
import { getData } from '../../utils/request'

const MESSAGES = defineMessages({
  errorDownload: {
    defaultMessage: 'Unexpected error while downloading ODK xForms',
    id: 'download.button.error'
  }
})

const DownloadODKButton = ({
  settings,
  survey: { id },
  intl: { formatMessage }
}) => {
  const [running, setRunning] = useState(false)
  const [error, setError] = useState()

  const onDone = (error) => {
    setRunning(false)

    if (error) {
      setError(error.message)
    }
  }

  const download = () => {
    setRunning(true)
    setError(null)

    getData(getSurveysAPIPath({ app: ODK_APP, id, action: 'download' }), { download: true })
      .then(() => { onDone() })
      .catch(error => { onDone(error) })
  }

  if (!settings.ODK_ACTIVE) {
    return ''
  }

  return (
    <>
      <button
        type='button'
        className='btn btn-secondary btn-icon me-3'
        disabled={running}
        onClick={() => { download() }}
      >
        <i className='fas fa-download invert me-3' />
        <FormattedMessage
          id='survey.view.action.download.odk'
          defaultMessage='Download ODK xForms'
        />
      </button>
      <WindowAlert title={formatMessage(MESSAGES.errorDownload)} message={error} />
    </>
  )
}

export default injectIntl(DownloadODKButton)
