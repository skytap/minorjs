/**
 * Copyright 2014 Skytap Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import 'babel-polyfill'
import Promise from 'bluebird'
import Filesystem from './filesystem'
import Logger from './logger'

/**
 * Module to load and manage controller filters.
 */
const Filter = {

  filters: {},

  /**
   * Filter.getFilters() -> Object
   */
  getFilters() {
    return this.filters
  },

  /**
   * Filter.load(path) -> Object
   * - path (String): Path to the filters
   */
  load(path) {
    const start = Date.now()

    return Filesystem.requireFilesInDirectory(path, true).then((filters) => {
      this.filters = filters
      Logger.profile('Load filters', start)
    })
  },

  /**
   * Filter.run(filters, request, response, next) -> Boolean
   * - filters (Array): All filters to run
   * - request (Object): Express request object
   * - response (Object): Express response object
   * - next (Function): Express next callback
   */
  run(filters, request, response, next) {
    const filterFunctions = []

    if (!(Array.isArray(filters) && filters.length)) {
      return Promise.resolve()
    }

    filters.forEach((filter) => {
      if ({}.hasOwnProperty.call(this.filters, filter)) {
        filterFunctions.push(this.runFilter(filter, request, response, next))
      }
    })

    // run each filter in sequence
    return filterFunctions.reduce(
      (currentValue, nextValue) => (
        currentValue.then(nextValue)
      ),
      Promise.resolve(),
    )
  },

  /**
   * Filter.runFilter(filter, request, response, next) -> Function
   * - filter (String): Filter name
   * - request (Object): Express request object
   * - response (Object): Express response object
   * - next (Function): Express next callback
   */
  runFilter(filter, request, response, next) {
    return () => {
      try {
        Logger.debug(`Running the ${this.filters[filter].moduleName} filter`, request)
        const result = this.filters[filter].process(request, response, next)
        return result instanceof Promise ? result : Promise.resolve(result)
      } catch (e) {
        Logger.debug(`Rejected ${this.filters[filter].moduleName} filter`, request)
        return Promise.reject(e)
      }
    }
  },
}

export default Filter
