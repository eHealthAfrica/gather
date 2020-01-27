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

import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'

// https://reactjs.org/docs/portals.html

const Portal = ({ children, onEscape, onEnter }) => {
  const [element] = useState(document.createElement('div'))

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onEscape && onEscape()
      }
      if (event.key === 'Enter') {
        onEnter && onEnter()
      }
    }

    document.body.appendChild(element)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.removeChild(element)
      document.removeEventListener('keydown', onKeyDown)
    }
  })

  return ReactDOM.createPortal(children, element)
}

export default Portal
