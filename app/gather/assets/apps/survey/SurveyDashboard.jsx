/*
 * Copyright (C) 2019 by eHealth Africa : http://www.eHealthAfrica.org
 *
 * See the NOTICE file distributed with this work for additional information
 * regarding copyright ownership.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import SurveyConfig from './mask/surveyConfig'

const SurveyDashboard = ({ columns, labels, entities_count, dashboardConfig, saveDashboardConfig }) => {
  const [showConf, setShowConf] = useState(false)
  return (
    <div>
      {
        entities_count > 0 && (
          <p className='alert alert-info'>
            <a href='#!' role='button' onClick={() => setShowConf(!showConf)}>
              <FormattedMessage
                id='alert.loading'
                defaultMessage={showConf ? 'Close' : 'Dashboard Configuration'}
              />
            </a>
          </p>
        )
      }
      {
        showConf &&
        <SurveyConfig
          setShowConf={setShowConf}
          dashboardConfig={dashboardConfig}
          saveDashboardConfig={saveDashboardConfig}
          columns={columns}
          labels={labels}
        />
      }
      {entities_count > 0 && !columns.length && !showConf && renderNoDashboard(setShowConf)}
    </div>
  )
}

const renderNoDashboard = setShowConf => (
  <div className='survey-content no-dashboard'>
    <h4 className='headline'>
      <FormattedMessage
        id='survey.no.dashboard.help-1'
        defaultMessage='No Dashboard here?'
      />
    </h4>
    <FormattedMessage
      id='survey.no.dashboard.help-2'
      defaultMessage='You can configure data to be sent to Elastic Search and activate a Kibana Dashboard.'
    />
    <br />
    <button
      type='button'
      className='btn btn-primary btn-secondary'
      onClick={() => setShowConf(true)}
    >
      <FormattedMessage
        id='survey.no.dashboard.button'
        defaultMessage='Configure dashboard now'
      />
    </button>
  </div>
)

export default SurveyDashboard
