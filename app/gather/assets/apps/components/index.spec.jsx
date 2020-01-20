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

/* global describe, it, expect */

import * as components from '../components'

describe('Common components', () => {
  it('AppIntl should be declared', () => {
    expect(components.AppIntl).toBeTruthy()
  })

  it('ConfirmButton should be declared', () => {
    expect(components.ConfirmButton).toBeTruthy()
  })

  it('EmptyAlert should be declared', () => {
    expect(components.EmptyAlert).toBeTruthy()
  })

  it('ErrorAlert should be declared', () => {
    expect(components.ErrorAlert).toBeTruthy()
  })

  it('FetchErrorAlert should be declared', () => {
    expect(components.FetchErrorAlert).toBeTruthy()
  })

  it('FetchUrlsContainer should be declared', () => {
    expect(components.FetchUrlsContainer).toBeTruthy()
  })

  it('JSONViewer should be declared', () => {
    expect(components.JSONViewer).toBeTruthy()
  })

  it('FullDateTime should be declared', () => {
    expect(components.FullDateTime).toBeTruthy()
  })

  it('HelpMessage should be declared', () => {
    expect(components.HelpMessage).toBeTruthy()
  })

  it('Link components and helpers should be declared', () => {
    expect(components.Link).toBeTruthy()
    expect(components.LinksList).toBeTruthy()
  })

  it('LoadingSpinner should be declared', () => {
    expect(components.LoadingSpinner).toBeTruthy()
  })

  it('MultiSelect should be declared', () => {
    expect(components.MultiSelect).toBeTruthy()
  })

  it('PaginationBar should be declared', () => {
    expect(components.PaginationBar).toBeTruthy()
  })

  it('PaginationContainer should be declared', () => {
    expect(components.PaginationContainer).toBeTruthy()
  })

  it('Portal should be declared', () => {
    expect(components.Portal).toBeTruthy()
  })

  it('RefreshSpinner should be declared', () => {
    expect(components.RefreshSpinner).toBeTruthy()
  })

  it('RelativeTime should be declared', () => {
    expect(components.RelativeTime).toBeTruthy()
  })

  it('WarningAlert should be declared', () => {
    expect(components.WarningAlert).toBeTruthy()
  })

  it('IDontExist should not be declared', () => {
    expect(components.IDontExist).toBeFalsy()
  })
})
