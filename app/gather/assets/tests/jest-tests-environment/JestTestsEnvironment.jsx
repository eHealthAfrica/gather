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

/**
 * Taken from:
 *    https://facebook.github.io/jest/docs/en/configuration.html#testenvironment-string
 */

const JSDOMEnvironment = require('jest-environment-jsdom')
const fetch = require('node-fetch')
const $ = require('jquery')
const popper = require('popper.js')

const testURL = 'http://localhost'

class JestTestsEnvironment extends JSDOMEnvironment {
  async setup () {
    await super.setup()

    // include global variables
    this.global.window.$ = $(this.global.window)
    this.global.window.jQuery = this.global.window.$
    this.global.window.Popper = popper

    Object.defineProperty(
      this.global.window.navigator,
      'language',
      { value: 'en', configurable: true }
    )

    // assign default environment variables
    process.env = Object.assign(
      {},
      process.env,
      {
        AETHER_MODULES: 'kernel,odk',
        AETHER_KERNEL_URL: 'http://kernel-test:9000',
        AETHER_ODK_URL: 'http://odk-test:9002',

        CSV_HEADER_RULES: 'replace;.;:;',
        CSV_HEADER_RULES_SEP: ';'
      }
    )

    // Issue that solves in tests: change window.location
    // https://github.com/jsdom/jsdom#reconfiguring-the-jsdom-with-reconfiguresettings
    this.global.jsdom = this.dom
    this.global.jsdom.reconfigure({ url: testURL })

    // used to create random data
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/from
    this.global.range = (start, end) => Array.from({length: end - start}, (v, i) => i + start)

    // uses "node-fetch" in tests, "whatwg-fetch" only works in browsers
    // check that the url is not an relative url, otherwise include it
    // Fixes: [TypeError: Only absolute URLs are supported]
    this.global.window.fetch = (url, opts) => (
      fetch(url.indexOf('/') === 0 ? testURL + url : url, opts)
    )
  }

  async teardown () {
    this.global.window.$ = null
    this.global.window.jQuery = null
    this.global.window.Popper = null

    this.global.jsdom = null
    this.global.range = null
    this.global.window.fetch = null

    await super.teardown()
  }

  runScript (script) {
    return super.runScript(script)
  }
}

module.exports = JestTestsEnvironment
