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

import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { hot } from 'react-hot-loader/root'

/**
 * EmptyAlert component.
 *
 * Renders an alert message indicating that no data was found
 * while requesting it from server.
 */

class EmptyAlert extends Component {
  render () {
    return (
      <div data-qa='data-empty' className='container-fluid'>
        <p className='alert alert-danger'>
          <i className='fas fa-exclamation-triangle mr-1' />
          <FormattedMessage
            id='alert.empty'
            defaultMessage='Nothing to display.'
          />
        </p>
      </div>
    )
  }
}

// Include this to enable HMR for this module
export default hot(EmptyAlert)
