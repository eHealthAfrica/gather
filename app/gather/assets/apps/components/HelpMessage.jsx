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

import { generateRandomId } from '../utils'

/**
 * HelpMessage component.
 *
 * Renders a question button that shows/hides a help message.
 */

const HelpMessage = ({ children }) => {
  const randomId = `help-content-${generateRandomId()}`

  return (
    <div data-qa='data-help-message' className='d-inline'>
      <button
        type='button'
        className='btn btn-sm btn-info rounded-circle float-end'
        data-toggle='collapse'
        data-target={'#' + randomId}
      >
        <i className='fas fa-question' />
      </button>
      <div className='collapse' id={randomId}>
        <div className='help-container'>
          {children}
        </div>
      </div>
    </div>
  )
}

export default HelpMessage
