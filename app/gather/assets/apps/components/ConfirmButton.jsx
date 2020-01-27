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
import { FormattedMessage } from 'react-intl'

import Portal from './Portal'

/**
 * ConfirmButton component.
 *
 * Renders a button that will trigger a (conditional) Confirm Window
 * to continue executing the expected action.
 */

const ConfirmButton = ({
  buttonLabel,
  cancelable,
  className,
  condition,
  message,
  onConfirm,
  title
}) => {
  const [open, setOpen] = useState(false)

  const onCancel = () => {
    cancelable && setOpen(false)
  }
  const execute = () => {
    setOpen(false)
    onConfirm()
  }
  const onClick = () => {
    // if there is a condition but it is not satisfied
    if (condition && !condition()) {
      execute()
      return
    }

    // show modal
    setOpen(true)
  }

  const button = (
    <button
      data-qa='confirm-button'
      type='button'
      disabled={open}
      className={className || 'btn btn-primary'}
      onClick={onClick}
    >
      {buttonLabel || title}
    </button>
  )

  if (!open) {
    return button
  }

  return (
    <>
      {/* show disabled button */}
      {button}

      <Portal onEscape={onCancel} onEnter={execute}>
        <div data-qa='confirm-button-window' className='confirmation-container'>
          <div className='modal show'>
            <div className='modal-dialog modal-md'>
              <div className='modal-content'>
                <div className='modal-header'>
                  <h5 className='modal-title'>{title}</h5>
                  {
                    cancelable &&
                      <button
                        data-qa='confirm-button-close'
                        type='button'
                        className='close'
                        onClick={onCancel}
                      >
                        &times;
                      </button>
                  }
                </div>

                <div data-qa='confirm-button-message' className='modal-body'>
                  {message}
                </div>

                <div className='modal-footer'>
                  {
                    cancelable &&
                      <button
                        data-qa='confirm-button-cancel'
                        type='button'
                        className='btn btn-default'
                        onClick={onCancel}
                      >
                        <FormattedMessage
                          id='confirm.button.action.cancel'
                          defaultMessage='No'
                        />
                      </button>
                  }

                  <button
                    data-qa='confirm-button-confirm'
                    type='button'
                    className='btn btn-secondary'
                    onClick={execute}
                  >
                    <FormattedMessage
                      id='confirm.button.action.confirm'
                      defaultMessage='Yes'
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </>
  )
}

// Include this to enable HMR for this module
export default ConfirmButton
