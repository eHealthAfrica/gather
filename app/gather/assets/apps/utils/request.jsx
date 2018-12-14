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

const buildFetchOptions = (method, payload, multipart, extras) => {
  // See: https://docs.djangoproject.com/en/2.1/ref/csrf/
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]') || {}
  const options = {
    method,
    credentials: 'same-origin',
    headers: {
      'X-CSRFToken': csrfToken.value,
      'X-METHOD': method // See comment below
    },
    ...extras
  }

  if (payload) {
    if (multipart) {
      /* global FormData */
      const formData = new FormData()
      formData.append('csrfmiddlewaretoken', csrfToken)
      Object.keys(payload).forEach(key => {
        const value = payload[key]
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(val => {
              formData.append(key, val)
            })
          } else {
            formData.append(key, value)
          }
        }
      })
      options.body = formData
      /*
        Fixes:
          django.http.request.RawPostDataException:
            You cannot access body after reading from request's data stream

        Django does not read twice the `request.body` on POST calls;
        but it is read while checking the CSRF token.
        This raises an exception in our ProxyTokenView.
        We are trying to skip it by changing the method from `POST` to `PUT`
        and the ProxyTokenView handler will change it back again.
      */
      if (method === 'POST') {
        options.method = 'PUT'
      }
    } else {
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(payload)
    }
  }

  return options
}

/**
 * Downloads blob content as a file.
 *
 * @param {Blob}   blob     - Blob content.
 * @param {string} filename - File name.
 */
const downloadFile = (blob, filename = 'download') => {
  // triggers a file download by creating
  // a link object and simulating a click event.
  const link = document.createElement('a')
  link.style = 'display: none'
  link.download = filename
  link.href = window.URL.createObjectURL(blob)

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(link.href)
}

const inspectResponse = ({ download, filename }, resolve, reject, response) => {
  // According to fetch docs: https://github.github.io/fetch/
  // Note that the promise won't be rejected in case of HTTP 4xx or 5xx server responses.
  // The promise will be resolved just as it would be for HTTP 2xx.
  // Inspect the response.ok property within the resolved callback
  // to add conditional handling of server errors to your code.

  if (response.status < 400) {
    // `DELETE` method returns a 204 status code without response content
    if (response.status === 204) {
      return resolve() // NO-CONTENT response
    }

    // file to download
    if (download) {
      return response
        .blob()
        .then(content => {
          // Content-Disposition Header = 'attachment; filename="looooong file name.ext"'
          const contentDisposition = response.headers.get('Content-Disposition')
          if (contentDisposition) {
            filename = contentDisposition
              .split(';')[1]
              .trim()
              .split('=')[1]
              .replace(/"/g, '')
          }
          downloadFile(content, filename)
          return resolve() // NO-CONTENT response
        })
    }

    return response
      .json()
      .then(content => resolve(content))
  } else {
    const error = new Error(response.statusText)
    return response
      .json()
      .then(content => {
        error.content = content
        return reject(error)
      })
      .catch(() => {
        // response is not a json, ignore content
        return reject(error)
      })
  }
}

const request = (
  method, //      GET, POST, PUT, PATCH, DELETE
  url, //         server url
  // rest of options
  {
    payload, //   in case of POST, PUT, PATCH the payload
    multipart, // in case of POST, PUT, PATCH indicates if send as FormData
    download, //  indicates if download the response as a file
    filename, //  in case of "download" the file name
    ...extras
  }
) => new Promise((resolve, reject) => {
  window
    .fetch(url, buildFetchOptions(method, payload, multipart, extras))
    .then(inspectResponse.bind(null, { download, filename }, resolve, reject))
    .catch(error => { reject(error) })
})

/**
 * Request DELETE from an url.
 */
export const deleteData = (url, opts = {}) => (
  request('DELETE', url, opts)
)

/**
 * Request GET from an url.
 */
export const getData = (url, opts = {}) => (
  request('GET', url, opts)
)

/**
 * Request POST from an url.
 */
export const postData = (url, payload, opts = {}) => (
  request('POST', url, { ...opts, payload })
)

/**
 * Request PUT from an url.
 */
export const putData = (url, payload, opts = {}) => (
  request('PUT', url, { ...opts, payload })
)

/**
 * Request PATCH from an url.
 */
export const patchData = (url, payload, opts = {}) => (
  request('PATCH', url, { ...opts, payload })
)

/**
 * Request GET from an url, if fails then POST a default object and tries again.
 *
 * Reason: the different apps are connected but they don't know each other.
 * In some cases they should have the same object references but due to their
 * independency it could not always be true. This tries to skip that issue.
 *
 * @param {string} url         - GET url
 * @param {string} postUrl     - POST url used to create the object below
 * @param {object} postPayload - the default object
 */
export const forceGetData = (url, postUrl, postPayload, opts = {}) => (
  getData(url, opts)
    // in case of error, try to create it and get again
    .catch(() => postData(postUrl, postPayload, opts).then(() => getData(url, opts)))
)

/*
 * The expected urls format is:
 *  [
 *    {
 *      name: 'string',
 *      url: 'url string',
 *      // optional, if the request get fails, creates the object below and tries again
 *      force: {
 *        url: 'string',
 *        data: { object }
 *      },
 *      // optional, fetch options
 *      opts: { ... }
 *    },
 *    ...
 *  ]
 *
 * Returns an object where each key is the name defined by
 * each url entry and the value is the response content.
 */
export const fetchUrls = (urls, opts = {}) => Promise
  .all(urls.map(config => config.force
    ? forceGetData(config.url, config.force.url, config.force.data, { ...opts, ...(config.opts || {}) })
    : getData(config.url, { ...opts, ...(config.opts || {}) })
  ))
  .then(responses => responses.reduce((payload, response, index) => {
    return { ...payload, [urls[index].name]: response }
  }, {}))
