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

import Portal from './Portal'

const WindowAlert = ({ title, message }) => {
  const [visible, setVisible] = React.useState(true)

  const onCancel = () => setVisible(false)

  React.useEffect(() => {
    setVisible(!!message)
  }, [message])

  if (!visible) return ''

  return (
    <Portal onEscape={onCancel} onEnter={onCancel}>
      <div data-qa='window-alert' className='confirmation-container'>
        <div className='modal show'>
          <div className='modal-dialog modal-md'>
            <div className='modal-content'>
              <div className='modal-header'>
                {title && <h5 className='modal-title'>{title}</h5>}
                <button
                  data-qa='window-alert-close'
                  type='button'
                  className='btn-close'
                  onClick={onCancel}
                />
              </div>

              <div data-qa='window-alert-message' className='modal-body'>
                {message}
              </div>

              <div className='modal-footer'>
                <button
                  data-qa='window-alert-ok'
                  type='button'
                  className='btn btn-secondary'
                  onClick={onCancel}
                >
                  <FormattedMessage
                    id='window.alert.button.action.close'
                    defaultMessage='OK'
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}

export default WindowAlert
