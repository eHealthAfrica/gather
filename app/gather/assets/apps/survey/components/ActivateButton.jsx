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

import React, { useState } from 'react'
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl'

import { goTo } from '../../utils'
import { ODK_APP } from '../../utils/constants'
import { getSurveysPath, getSurveysAPIPath } from '../../utils/paths'
import { forceGetData, patchData } from '../../utils/request'

const MESSAGES = defineMessages({
  errorActivate: {
    defaultMessage: 'Unexpected error while activating survey',
    id: 'activate.button.error.activate'
  },
  errorDeactivate: {
    defaultMessage: 'Unexpected error while deactivating survey',
    id: 'activate.button.error.deactivate'
  },

  errorODKActivate: {
    defaultMessage: 'Unexpected error while activating ODK survey',
    id: 'activate.button.error.odk.activate'
  },
  errorODKDeactivate: {
    defaultMessage: 'Unexpected error while deactivating ODK survey',
    id: 'activate.button.error.odk.deactivate'
  }
})

const ActivateButton = ({
  survey: { id, name, active },
  settings,
  intl: { formatMessage }
}) => {
  const [running, setRunning] = useState(false)

  const toggle = () => {
    const onDone = (error, odk) => {
      setRunning(false)

      if (error) {
        const errorMsg = odk
          ? active ? MESSAGES.errorODKDeactivate : MESSAGES.errorODKActivate
          : active ? MESSAGES.errorDeactivate : MESSAGES.errorActivate
        window.alert(formatMessage(errorMsg) + '\n' + error.toString())
      }

      // refresh page
      goTo(getSurveysPath({ action: 'view', id }))
    }

    setRunning(true)
    patchData(getSurveysAPIPath({ id }), { active: !active })
      .then(() => {
        if (settings.ODK_ACTIVE) {
          // first confirm that ODK survey exists
          forceGetData(
            getSurveysAPIPath({ app: ODK_APP, id, fields: 'id' }),
            // force arguments: (url, payload)
            getSurveysAPIPath({ app: ODK_APP }),
            { project_id: id, name }
          )
            .then(() => {
              patchData(getSurveysAPIPath({ app: ODK_APP, id }), { active: !active })
                .then(() => { onDone() })
                .catch(error => { onDone(error, true) })
            })
            .catch(error => { onDone(error, true) })
        } else {
          onDone()
        }
      })
      .catch(error => { onDone(error, false) })
  }

  return (
    <button
      type='button'
      className='btn btn-secondary btn-icon mr-3'
      disabled={running}
      onClick={() => { toggle() }}
    >
      <i className={`fas fa-${active ? 'stop' : 'play'} invert mr-3`} />
      {
        active ? (
          <FormattedMessage
            id='survey.view.action.deactivate'
            defaultMessage='Deactivate survey'
          />
        ) : (
          <FormattedMessage
            id='survey.view.action.activate'
            defaultMessage='Activate survey'
          />
        )
      }
    </button>
  )
}

export default injectIntl(ActivateButton)
