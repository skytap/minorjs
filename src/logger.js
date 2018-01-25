/**
 * Copyright 2014 Skytap Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import 'babel-polyfill'
import path from 'path'

/**
 * Module to handle application logging.
 */
const Logger = {

  levels: [
    'debug',
    'info',
    'warn',
    'error',
  ],

  loggers: [],

  /**
   * Logger.initialize()
   *
   * Initialize the logger.
   */
  initialize(options) {
    this.options = options

    if (options.loggers && Array.isArray(options.loggers) && options.loggers.length > 0) {
      this.loggers = this.loadLoggers(options.loggers)
    }

    this.addLevelHandlers()
  },

  /**
   * Logger.profile(name, start)
   * - name (String)
   * - start (Integer): Start time in milliseconds
   *
   * Output a debug log of the number of milliseconds it took to complete a task.
   */
  profile(name, start, end, contextId) {
    const endTime = typeof end === 'undefined' ? Date.now() : end
    this.log('debug', `Performance: ${name} took ${endTime - start}ms`, null, contextId)
  },

  debug() {},

  error() {},

  /**
   * Logger.addLevelHandlers()
   */
  addLevelHandlers() {
    this.levels.forEach((level) => {
      this[level] = (...args) => {
        args.unshift(level)
        this.log(...args)
      }
    })
  },

  /**
   * Logger.loadLoggers(loggers) -> Array
   * - loggers (Array): Array of logger names
   */
  loadLoggers(loggers) {
    return loggers.map(logger => (
      this.loadLogger(logger)
    ))
  },

  /**
   * Logger.loadLogger(file) -> Object
   * - file (Mixed): Either the name of a logger or a logger class
   */
  loadLogger(file) {
    let LoggerModule

    if (typeof file === 'function') {
      LoggerModule = file
    } else {
      const loggerPath = path.join(this.options.basePath, 'lib', 'loggers')
      // eslint-disable-next-line import/no-dynamic-require, global-require
      LoggerModule = require(path.join(loggerPath, `${file}_logger`))
      LoggerModule = LoggerModule.default ? LoggerModule.default : LoggerModule
    }

    return new LoggerModule(this.levels)
  },

  /**
   * Logger.log()
   *
   * Log a message using the specified loggers.
   */
  log(...args) {
    this.loggers.forEach(logger => (
      logger.log(...args)
    ))
  },
}

export default Logger
