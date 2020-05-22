/*
 * Copyright (C) 2020 by eHealth Africa : http://www.eHealthAfrica.org
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

// Adapted from: https://github.com/insin/react-filtered-multiselect/

import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'

const MESSAGES = defineMessages({
  button: {
    defaultMessage: 'Select',
    id: 'filtered.multi.select.text.button'
  },
  filter: {
    defaultMessage: 'Find…',
    id: 'filtered.multi.select.text.filter'
  }
})

const FilteredMultiSelect = ({
  buttonText = null,
  filterText = null,
  onChange,
  options,
  selectedOptions = [],
  showFilter = true,
  textProp = 'name',
  valueProp = 'id'
}) => {
  const { formatMessage } = useIntl()
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState([])

  const values = selectedOptions.map((option) => option[valueProp])
  const filteredOptions = options.filter((option) => (
    values.indexOf(option[valueProp]) === -1 &&
    (!filter || option[textProp].toUpperCase().indexOf(filter.toUpperCase()) !== -1)
  ))

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const handleFilterKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()

      // if only remains one... add it as selected and reset filter
      if (filteredOptions.length === 1) {
        setFilter('')
        setSelected([])
        onChange([...selectedOptions, filteredOptions[0]])
      }
    }
  }

  const handleSelectChange = (event) => {
    const el = event.target
    const values = []
    for (let i = 0, l = el.options.length; i < l; i++) {
      if (el.options[i].selected) {
        values.push(el.options[i].value)
      }
    }
    setSelected(values)
  }

  const handleAddSelectedToSelection = () => {
    setSelected([])
    onChange([
      ...selectedOptions,
      ...filteredOptions.filter((item) => selected.indexOf(item[valueProp]) > -1)
    ])
  }

  return (
    <div className='multi-select'>
      {
        showFilter &&
          <input
            type='text'
            className='form-control'
            placeholder={filterText || formatMessage(MESSAGES.filter)}
            value={filter}
            onChange={handleFilterChange}
            onKeyPress={handleFilterKeyPress}
          />
      }

      <select
        multiple
        className='form-control'
        size={6}
        value={selected}
        onChange={handleSelectChange}
        onDoubleClick={handleAddSelectedToSelection}
      >
        {
          filteredOptions.map((option) => (
            <option key={option[valueProp]} value={option[valueProp]}>
              {option[textProp]}
            </option>
          ))
        }
      </select>

      <button
        type='button'
        className='btn btn-block btn-secondary'
        disabled={selected.length === 0}
        onClick={handleAddSelectedToSelection}
      >
        {buttonText || formatMessage(MESSAGES.button)}
      </button>
    </div>
  )
}

export default FilteredMultiSelect
