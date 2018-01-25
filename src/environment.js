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
import fs from 'fs'
import cluster from 'cluster'
import uuid from 'node-uuid'
import Config from './config'
import Logger from './logger'

/**
 * Module to store environment-specific details.
 */
const Environment = {

  environment: 'default',

  /**
   * Environment.getBasePath() -> String
   *
   * Returns the application base path.
   */
  getBasePath() {
    return this.basePath
  },

  /**
   * Environment.getEnvironment() -> String
   *
   * Returns the environment the application is running in.
   */
  getEnvironment() {
    return this.environment
  },

  /**
   * Environment.getInstance() -> Integer
   *
   * Returns the instance ID.
   */
  getInstance() {
    return this.instance
  },

  /**
   * Environment.getContextId() -> String
   *
   * Returns the context ID.
   */
  getContextId() {
    return this.contextId
  },

  /**
   * Environment.getContextName() -> String
   *
   * Returns the context name.
   */
  getContextName() {
    return this.contextName
  },

  /**
   * Environment.initialize(options)
   * - options (Object): Environment options
   */
  initialize(options) {
    this.environment = options.environment
    this.basePath = options.basePath
    this.instance = options.instance
    this.loggers = options.loggers
    this.contextId = (`${uuid.v4()}.${process.pid}`).replace(/-/g, '')
    this.contextName = options.contextName || 'minorjs'

    Config.load(this.environment, this.loadConfigs())

    this.initLogger()
  },

  /**
   * Environment.isWorker() -> Boolean
   *
   * Return whether the process is a cluster worker.
   */
  isWorker() {
    return cluster.isWorker
  },

  /**
   * Environment.isDevelopment() -> Boolean
   *
   * Return whether the application is running in development.
   */
  isDevelopment() {
    return this.environment === 'development'
  },

  /**
   * Environment.isProduction() -> Boolean
   *
   * Return whether the application is running in production.
   */
  isProduction() {
    return this.environment === 'production'
  },

  /**
   * Environment.getConfigFilePath() -> String
   *
   * Constructs the full path to a configuration file.
   */
  getConfigFilePath() {
    return `${this.basePath}/config/app.json`
  },

  /**
   * Environment.getLoggers() -> Array
   */
  getLoggers() {
    const environment = this.isProduction() ? 'production' : 'development'
    return this.loggers[environment] !== 'undefined' ? this.loggers[environment] : []
  },

  /**
   * Environment.initLogger()
   *
   * Initializes logging for the application.
   */
  initLogger() {
    Logger.initialize({
      basePath: this.getBasePath(),
      instance: this.instance,
      loggers: this.getLoggers(),
    })
  },

  /**
   * Environment.loadConfigs() -> Object
   *
   * Loads the configuration file for this app.
   */
  loadConfigs() {
    const path = this.getConfigFilePath()
    let configs = {}

    if (fs.existsSync(path)) {
      configs = JSON.parse(fs.readFileSync(path, 'utf8'))
    }

    return configs
  },
}

export default Environment
