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
import { defineMessages, injectIntl } from 'react-intl'
import FilteredMultiSelect from 'react-filtered-multiselect'

import { deepEqual, sortBy } from '../utils'

const MESSAGES = defineMessages({
  select: {
    defaultMessage: 'Add',
    id: 'multiselect.select'
  },
  deselect: {
    defaultMessage: 'Remove',
    id: 'multiselect.deselect'
  },
  filter: {
    defaultMessage: 'Type…',
    id: 'multiselect.filter'
  }
})

/**
 * MultiSelect component.
 *
 * Renders a multi-select component similar to Django MultiSelect widget.
 * https://github.com/insin/react-filtered-multiselect
 */

class MultiSelect extends Component {
  constructor (props) {
    super(props)

    const valueProp = props.valueProp || 'id'
    const textProp = props.textProp || 'name'

    this.state = {
      valueProp,
      textProp,

      // sort selected and options by "text" property
      selected: sortBy(props.selected || [], textProp),
      options: sortBy(props.options || [], textProp)
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (!deepEqual(prevState.selected, this.state.selected)) {
      this.props.onChange(this.state.selected)
    }
  }

  render () {
    return (
      <div className='row'>
        <div className='col-6'>
          { this.renderSelect(this.state.options, this.state.selected) }
        </div>

        <div className='col-6'>
          { this.renderSelect(this.state.selected) }
        </div>
      </div>
    )
  }

  renderSelect (options, selected) {
    const { formatMessage } = this.props.intl
    const buttonText = selected ? MESSAGES.select : MESSAGES.deselect
    const onChange = selected ? this.onSelect : this.onDeselect

    return (
      <FilteredMultiSelect
        buttonText={formatMessage(buttonText)}
        placeholder={formatMessage(MESSAGES.filter)}

        options={options}
        selectedOptions={selected}
        valueProp={this.state.valueProp}
        textProp={this.state.textProp}

        onChange={onChange.bind(this)}

        size={6}
        classNames={{
          button: 'btn btn-block btn-secondary',
          buttonActive: 'btn btn-block btn-secondary',
          filter: 'form-control',
          select: 'form-control'
        }}
      />
    )
  }

  onSelect (values) {
    const selectedIds = values.map(value => value[this.state.valueProp])

    this.setState({
      selected: this.state.options
        .filter(value => selectedIds.indexOf(value[this.state.valueProp]) > -1)
    })
  }

  onDeselect (values) {
    const removedIds = values.map(value => value[this.state.valueProp])

    this.setState({
      selected: this.state.selected
        .filter(value => removedIds.indexOf(value[this.state.valueProp]) === -1)
    })
  }
}

// Include this to enable `this.props.intl` for this component.
export default injectIntl(MultiSelect)
