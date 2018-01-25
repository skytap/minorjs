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
import cluster from 'cluster'
import fs from 'fs'
import path from 'path'
import Express from 'express'
import cookieParser from 'cookie-parser'
import errorHandler from 'errorhandler'
import compression from 'compression'
import staticFavicon from 'serve-favicon'
import bodyParser from 'body-parser'
import Promise from 'bluebird'
import Backhoe from 'backhoe'
import Config from './config'
import Controller from './controller'
import Environment from './environment'
import Router from './router'
import Logger from './logger'
import Template from './template'
import Filter from './filter'
import Path from './path'
import FileSystem from './filesystem'

/**
 * Module for creating an HTTP server.
 */
export default class Minor {
  constructor(options) {
    this.app = Express()
    this.options = options
    this.closing = false

    // bind functions
    this.listen = this.listen.bind(this)
    this.initialize = this.initialize.bind(this)

    if (!this.options.instance) {
      this.options.instance = 1
    }

    if (!this.options.controllerTimeout) {
      // default timeout 3 minutes
      this.options.controllerTimeout = 180000
    }

    if (!this.options.hostname) {
      this.options.hostname = '0.0.0.0'
    }

    this.initializeEnvironment()
    this.initializeErrorHandling()
  }

  /**
   * Minor.initialize()
   */
  initialize() {
    const start = Date.now()

    this.start = start

    this.app.use(cookieParser())

    const defaultPromise = this.initializeDefaultConfiguration()

    const environmentPromise = this.isProduction()
      ? this.initializeProductionConfig()
      : this.initializeDevelopmentConfig()

    // listen for a shutdown message
    process.on('message', this.handleMessage.bind(this))

    return Promise.all([defaultPromise, environmentPromise]).then(() => {
      Logger.profile('Initialize MinorJS', start)
    })
  }

  /**
   * Minor.listen() -> Object
   */
  listen() {
    const start = Date.now()

    return Router.load(this.app, `${this.options.basePath}/lib/controllers`, this.options).then(() => {
      Logger.profile('Load controllers', start)

      const port = this.getPort()
      this.server = this.app.listen(port, this.options.hostname)

      Logger.profile('Load MinorJS', this.start)

      Logger.info(`MinorJS HTTP server listening on ${this.options.hostname}:${port}`)
    })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error loading controllers and registering routes.\n\n', error.stack)
        process.exit(1)
      })
  }

  /**
   * Minor.getEnvironment() -> String
   */
  getEnvironment() {
    return typeof process.env.NODE_ENV === 'undefined'
      ? 'development'
      : process.env.NODE_ENV
  }

  /**
   * Minor.getPort()
   */
  getPort() {
    if (this.options.port) {
      return this.options.port
    }

    return Config.get('port')
  }

  /**
   * Minor.initializeDefaultConfiguration()
   */
  initializeDefaultConfiguration() {
    const start = Date.now()

    return Promise.resolve().then(() => {
      this.app.use(compression())

      this.app.set('views', `${this.options.basePath}/lib/templates`)

      this.app.locals.escapeAttributes = true

      if (Array.isArray(this.options.templatePlugins)) {
        this.options.templatePlugins.forEach(plugin => (
          plugin.register(this.app)
        ))
      }
    }).then(() => (
      // load all the template mixins
      Template.loadMixins(`${this.options.basePath}/lib/template_mixins`)
    )).then(() => (
      // load all the filters
      Filter.load(`${this.options.basePath}/lib/filters`)
    ))
      .then(() => {
        const faviconPath = `${this.options.basePath}/public/favicon.ico`

        if (fs.existsSync(faviconPath)) {
          this.app.use(staticFavicon(faviconPath))
        }

        // parse application/x-www-form-urlencoded
        this.app.use(bodyParser.urlencoded({ extended: false }))

        // parse application/json
        this.app.use(bodyParser.json())
      })
      .then(() => {
        Logger.profile('Initialize default configuration', start)
      })
  }

  /**
   * Minor.initializeDevelopmentConfig()
   */
  initializeDevelopmentConfig() {
    const start = Date.now()
    const noCacheDefaults = [
      'lib/controllers',
      'lib/controller_helpers',
      'lib/views',
      'lib/templates',
    ]

    return Promise.resolve().then(() => {
      const noCachePaths = this.options.noCache || noCacheDefaults
      Backhoe.noCache(
        Environment.getBasePath(),
        noCachePaths,
      )

      // pretty print the HTML
      this.app.locals.uglify = false

      this.app.use(errorHandler({
        dumpExceptions: true,
        showStack: true,
      }))

      return this.loadMiddleware('development')
    }).then(() => {
      Logger.profile('Initialize development configuration', start)
    })
  }

  /**
   * Minor.initializeProductionConfig()
   */
  initializeProductionConfig() {
    const start = Date.now()

    return Promise.resolve().then(() => {
      this.app.locals.uglify = true
      return this.loadMiddleware('production')
    }).then(() => {
      Logger.profile('Initialize production configuration', start)
    })
  }

  /**
   * Minor.initializeEnvironment()
   */
  initializeEnvironment() {
    // Initialize the environment and configs
    Environment.initialize({
      basePath: this.options.basePath,
      environment: this.app.get('env'),
      instance: this.options.instance,
      loggers: this.options.loggers || [],
      contextName: this.options.contextName,
    })
  }

  /**
   * Minor.initializeErrorHandling()
   */
  initializeErrorHandling() {
    process.on('uncaughtException', (error) => {
      // eslint-disable-next-line no-console
      console.log(error.stack)

      Logger.error(error.stack)

      if (Environment.isWorker()) {
        cluster.worker.disconnect()
      } else {
        process.exit(1)
      }
    })

    this.app.on('error', (error) => {
      Logger.error(error.stack)
    })
  }

  /**
   * Minor.isProduction() -> Boolean
   */
  isProduction() {
    return this.getEnvironment() === 'production'
  }

  /**
   * Minor.loadMiddleware()
   *
   * Load and register middleware.
   */
  loadMiddleware(environment) {
    const startMiddleware = Date.now()
    const middlewarePath = path.join(this.options.basePath, 'lib', 'middleware')

    if (!this.options.middleware || !this.options.middleware[environment]) {
      return Promise.resolve()
    }

    this.options.middleware[environment].forEach((file) => {
      const start = Date.now()
      // eslint-disable-next-line import/no-dynamic-require, global-require
      let middleware = require(path.join(middlewarePath, file))
      middleware = middleware.default ? middleware.default : middleware
      middleware.process(this.app)
      Logger.profile(`Load middleware ${file}`, start)
    })

    Logger.profile('Load middleware', startMiddleware)

    return Promise.resolve()
  }

  /**
   * Minor.handleMessage(message)
   */
  handleMessage(message) {
    switch (message) {
      case 'shutdown':
        this.shutdown()
        break
      default:
        // no op
    }
  }

  /**
   * Minor.shutdown()
   */
  shutdown() {
    if (this.closing === true) {
      // already shutting down the worker
      return
    }

    this.closing = true

    // stop accepting HTTP connections
    this.server.close(() => {
      // shut down the worker. the cluster manager will spawn a replacement worker.
      cluster.worker.disconnect()
    })
  }
}

export {
  Config,
  Controller,
  Environment,
  FileSystem,
  Logger,
  Path,
}
