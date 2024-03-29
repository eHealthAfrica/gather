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

import React from 'react'
import { FormattedMessage } from 'react-intl'

/**
 * FetchErrorAlert component.
 *
 * Renders an alert message indicating that an error happened
 * while requesting data from server.
 */

const FetchErrorAlert = ({ error }) => (
  <div data-qa='data-erred' className='container-fluid'>
    <p className='alert alert-danger'>
      <i className='fas fa-exclamation-triangle me-1' />
      <FormattedMessage
        id='alert.error.fetch'
        defaultMessage={`
          Request was not successful, maybe requested resource does
          not exists or there was a server error while requesting for it.
        `}
      />
    </p>
    {
      error && error.content && error.content.detail &&
        <p data-qa='data-erred-reason' className='alert alert-danger'>
          <i className='fas fa-exclamation-triangle me-1' />
          {error.content.detail}
        </p>
    }
  </div>
)

export default FetchErrorAlert
