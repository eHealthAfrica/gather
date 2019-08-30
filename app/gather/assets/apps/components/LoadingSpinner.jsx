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
 * LoadingSpinner component.
 *
 * Renders a spinner indicating that data is being loaded from server.
 */

class LoadingSpinner extends Component {
  render () {
    return (
      <div data-qa='data-loading' className='container-fluid'>
        <p className='alert alert-info'>
          <i className='loading-spinner mr-2' />
          <FormattedMessage
            id='alert.loading'
            defaultMessage='Loading data from server…'
          />
        </p>
      </div>
    )
  }
}

// Include this to enable HMR for this module
export default hot(LoadingSpinner)
