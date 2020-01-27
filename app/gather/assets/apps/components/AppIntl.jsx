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
import { IntlProvider } from 'react-intl'

/**
 * AppIntl component.
 *
 * Wraps the children with the IntlProvider component to enable i18n and L11n.
 */

// Import intl-relativetimeformat polyfill for unsupported environments
if (!window.Intl || !Object.keys(window.Intl).length) {
  require('@formatjs/intl-relativetimeformat/polyfill')
  require('@formatjs/intl-relativetimeformat/dist/locale-data/en')
}

const AppIntl = ({ children }) => (
  <IntlProvider defaultLocale='en' locale={navigator.locale || 'en'}>
    {children}
  </IntlProvider>
)

export default AppIntl
