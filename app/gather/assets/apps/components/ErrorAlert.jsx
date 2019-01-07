/*
 * Copyright (C) 2018 by eHealth Africa : http://www.eHealthAfrica.org
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
import { hot } from 'react-hot-loader/root'

import { getType } from '../utils/types'

/**
 * ErrorAlert component.
 *
 * Renders a list of alert messages indicating the errors that happened
 * while executing any action.
 */

class ErrorAlert extends Component {
  render () {
    const { errors } = this.props

    const eType = getType(errors)
    if (!eType) {
      return <div />
    }
    const list = (eType !== 'array') ? [errors] : errors

    return (
      <div data-qa='data-erred' className='form-error'>
        {
          list.map((error, index) => (
            <p key={index} data-qa={`data-erred-${index}`} className='error'>
              { error }
            </p>
          ))
        }
      </div>
    )
  }
}

// Include this to enable HMR for this module
export default hot(ErrorAlert)
