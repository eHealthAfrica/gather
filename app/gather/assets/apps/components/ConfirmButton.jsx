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
 * software distributed under the License is distributed on anx
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, {Component} from 'react'
import { FormattedMessage } from 'react-intl'

import Portal from './Portal'

/**
 * ConfirmButton component.
 *
 * Renders a button that will trigger a (conditional) Confirm Window
 * to continue executing the expected action.
 */

export default class ConfirmButton extends Component {
  constructor (props) {
    super(props)
    this.state = { open: false }
  }

  render () {
    const button = (
      <button
        data-qa='confirm-button'
        type='button'
        disabled={this.state.open}
        className={this.props.className || 'btn btn-primary'}
        onClick={this.onClick.bind(this)}>
        { this.props.buttonLabel || this.props.title }
      </button>
    )

    if (!this.state.open) {
      return button
    }

    return (
      <React.Fragment>
        { /* show disabled button */ }
        { button }

        <Portal>
          <div data-qa='confirm-button-window' className='confirmation-container'>
            <div className='modal show'>
              <div className='modal-dialog modal-md'>
                <div className='modal-content'>
                  <div className='modal-header'>
                    <h5 className='modal-title'>{this.props.title}</h5>
                    { this.props.cancelable &&
                      <button
                        data-qa='confirm-button-close'
                        type='button'
                        className='close'
                        onClick={this.onCancel.bind(this)}>
                        &times;
                      </button>
                    }
                  </div>

                  <div data-qa='confirm-button-message' className='modal-body'>
                    {this.props.message}
                  </div>

                  <div className='modal-footer'>
                    { this.props.cancelable &&
                      <button
                        data-qa='confirm-button-cancel'
                        type='button'
                        className='btn btn-default'
                        onClick={this.onCancel.bind(this)}>
                        <FormattedMessage
                          id='confirm.button.action.cancel'
                          defaultMessage='No' />
                      </button>
                    }

                    <button
                      data-qa='confirm-button-confirm'
                      type='button'
                      className='btn btn-secondary'
                      onClick={this.execute.bind(this)}>
                      <FormattedMessage
                        id='confirm.button.action.confirm'
                        defaultMessage='Yes' />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      </React.Fragment>
    )
  }

  onCancel () {
    this.props.cancelable && this.setState({ open: false })
  }

  onClick () {
    // if there is a condition but it is not satisfied
    if (this.props.condition && !this.props.condition()) {
      this.execute()
      return
    }

    // show modal
    this.setState({ open: true })
  }

  execute () {
    this.setState({ open: false }, this.props.onConfirm)
  }
}
