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

import Link from './Link'

/**
 * LinksList component.
 *
 * Renders a collapsable list of links.
 */
const LinksList = ({ list }) => {
  const [collapsed, toggle] = useState(list && list.length > 1)

  if (!list || list.length === 0) {
    return ''
  }

  return (
    <div>
      {
        list.length > 1 &&
          <button
            type='button'
            data-qa='link-list-collapse-button'
            className='btn icon-only btn-collapse'
            onClick={() => toggle(!collapsed)}
          >
            <i className={`fas fa-${collapsed ? 'plus' : 'minus'}`} />
          </button>
      }

      {
        !collapsed &&
          <ol className='property-list'>
            {
              list.map((link, index) => (
                <li key={index} className='property-item'>
                  <Link link={link} />
                </li>
              ))
            }
          </ol>
      }
    </div>
  )
}

export default LinksList
