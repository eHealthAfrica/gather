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

import { IntlProvider } from 'react-intl'
import { mount, shallow } from 'enzyme'

const wrapper = (component, fn) =>
  fn(component, {
    wrappingComponent: IntlProvider,
    wrappingComponentProps: { locale: 'en', messages: {} }
  })

export const mountWithIntl = component => wrapper(component, mount)

export const shallowWithIntl = component => wrapper(component, shallow)

/*
 * Workaround to get real component state in tests
 *
 * Fixes:
 *    TypeError: Cannot read property 'property-name' of null
 *    (null refers to component state)
 */
export const mountComponent = (component) => mountWithIntl(shallowWithIntl(component).get(0))
