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

// takes enabled modules from the environment variable
export const ODK_ACTIVE = ((process.env.AETHER_MODULES || '').split(',').indexOf('odk') > -1)

// these are used to export the responses as a CSV file using the CustomCSVRenderer
export const CSV_HEADER_RULES = process.env.CSV_HEADER_RULES
export const CSV_HEADER_RULES_SEP = process.env.CSV_HEADER_RULES_SEP
export const CSV_MAX_ROWS_SIZE = parseInt(process.env.CSV_MAX_ROWS_SIZE, 10) || 0

// needed to create the links to external modules
export const AETHER_KERNEL_URL = process.env.AETHER_KERNEL_URL
export const AETHER_ODK_URL = ODK_ACTIVE ? process.env.AETHER_ODK_URL : null
