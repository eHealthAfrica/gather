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

import React from 'react'
import { FormattedMessage } from 'react-intl'

import { attachmentsToLinks } from './utils'
import { filterByPaths } from '../../utils/types'
import { JSONViewer, LinksList } from '../../components'

const EntityItem = ({ list, paths, labels }) => {
  if (list.length !== 1) {
    return ''
  }

  const entity = list[0]
  const attachments = attachmentsToLinks(entity.attachments)

  return (
    <div data-qa={`entity-item-${entity.id}`} className='x-2'>
      <div className='survey-content single'>
        <div className='property'>
          <h5 className='property-title'>
            <FormattedMessage
              id='entity.view.status'
              defaultMessage='Status'
            />
          </h5>
          <div className='property-value'>
            {entity.status}
          </div>
        </div>

        {
          attachments.length > 0 &&
            <div className='property'>
              <h5 className='property-title'>
                <FormattedMessage
                  id='entity.view.attachments'
                  defaultMessage='Attachments'
                />
              </h5>
              <div className='property-value'>
                <LinksList list={attachments} />
              </div>
            </div>
        }

        <div>
          <JSONViewer
            data={filterByPaths(entity.payload, paths)}
            labels={labels}
            links={attachments}
          />
        </div>
      </div>
    </div>
  )
}

export default EntityItem
