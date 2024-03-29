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

// `1048576` is the maximum value accepted by the pagination class
// Total number of rows on a worksheet (since Excel 2007)
// https://support.office.com/en-us/article/Excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3
// the first two rows would be the header so we reduce in two the value.
export const MAX_PAGE_SIZE = 1048574

// Maximum size of the select options in the forms
export const MAX_FETCH_SIZE = 1000

export const EXPORT_CSV_FORMAT = 'csv'
export const EXPORT_EXCEL_FORMAT = 'xlsx'

// app names (match container names)
export const KERNEL_APP = 'kernel'
export const ODK_APP = 'odk'
export const GATHER_APP = 'gather'

export const BLANK = '–'
export const DASH = '–'
