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
import path from 'path'
import fs from 'fs'
import Promise from 'bluebird'
import backhoe from 'backhoe'
import humanize from 'humanize-plus'
import inflected from 'inflected'
import uuid from 'node-uuid'
import Path from './path'
import Filesystem from './filesystem'
import Logger from './logger'
import Filter from './filter'
import Environment from './environment'
import Config from './config'
import Indentifier from './identifier'

/**
 * Module for loading controllers and wiring up routes.
 */
const Router = {

  MAX_REQUEST_JITTER: 0.2,

  requestCount: 0,

  /**
   * Router.load(app, controllerPath) -> Object
   * - app (Object): Express instance.
   * - controllerPath (String): Directory containing controllers.
   *
   * Discovers and loads all controllers.
   */
  load(app, controllerPath, options) {
    this.options = options

    return Filesystem.recurseDirectory(
      controllerPath,
      this.filterControllers,
    ).then(files => (
      this.loadAllControllers(
        app,
        controllerPath,
        files.reverse(), // deeper paths need to be registered first
      )
    ))
      .then(() => {
        this.registerErrorController(app, controllerPath)
      })
  },

  /**
   * Router.buildRoutes(app) -> Null
   * - app (Object): Express app object
   */
  buildRoutes(app, controller, url) {
    const correctedUrl = this.fixUrl(url)
    const routes = this.getRoutesForUrl(correctedUrl)

    routes.forEach((route) => {
      this.registerRoute(app, controller, correctedUrl, route)
    })
  },

  /**
   * Router.filterControllers(file) -> Boolean
   * - file (String): controller pathname
   */
  filterControllers(file) {
    const controller = file
      .replace(path.extname(file), '') // remove file extension
      .split('').reverse().join('') // reverse string
    const search = 'controller/error'.split('').reverse().join('') // reverse string

    if (controller.lastIndexOf(search) === 0) {
      return false
    }

    const controllerPath = new Path(file)
    return controllerPath.isJavascriptFile() || controllerPath.isCoffeescriptFile()
  },

  /**
   * Router.fixUrl(url) -> String
   * - url (String)
   */
  fixUrl(url) {
    // remove filename
    let correctedUrl = url
      .replace(/index\.(js|coffee)/, '')
      .replace(/\.(js|coffee)/, '')

    // remove trailing slash
    if (correctedUrl.lastIndexOf('/') === correctedUrl.length - 1) {
      correctedUrl = correctedUrl.slice(0, correctedUrl.length - 1)
    }

    // make sure URL starts with a slash
    if (correctedUrl[0] !== '/') {
      correctedUrl = `/${correctedUrl}`
    }

    return correctedUrl.replace(/\/\//g, '/')
  },

  /**
   * Router.getControllerName(parts) -> String
   * - parts (Array)
   */
  getControllerName(parts) {
    return parts.map(value => (
      humanize.capitalize(value)
    )).join('')
  },

  /**
   * Router.getPage(request) -> String
   * - request (String)
   */
  getPage(request) {
    return request.url
      .split('?')[0] // remove query string
      .replace(/^\//, '') // remove leading slashes
      .replace(/\/$/, '') // remove trailing slashes
  },

  /**
   * Router.getParentPathsForUrl(url) -> Array
   * - url (String)
   */
  getParentPathsForUrl(urlParts) {
    const resource = urlParts.shift()

    if (urlParts.length === 0) {
      return [resource]
    }

    const paths = [
      resource,
      `${resource}/:${this.getResourceIdName(resource)}`,
    ]
    const childPaths = this.getParentPathsForUrl(urlParts)
    const results = []

    paths.forEach((parentPath) => {
      childPaths.forEach((childPath) => {
        results.push(`${parentPath}/${childPath}`)
      })
    })

    return results
  },

  /**
   * Router.getRoutesForUrl(url) -> Array
   * - url (String)
   */
  getRoutesForUrl(url) {
    const urlParts = url.split('/').filter(value => (
      value.length > 0
    ))
    const paths = this.getParentPathsForUrl(urlParts).map((value = '') => (
      `/${value}`
    ))
    let routes = []

    paths.forEach((basePath) => {
      routes = routes.concat(this.getRouteTable(basePath))
    })

    return routes
  },

  /**
   * Router.getRouteTable(url) -> Array
   * - url (String)
   *
   * Add routes for all REST methods.
   * Inspired by http://guides.rubyonrails.org/routing.html
   */
  getRouteTable(url) {
    const resourceIdName = this.getResourceIdName(url)

    return [
      {
        // GET /resource
        method: 'get',
        url,
        handler: 'index',
      },
      {
        // GET /resource/new
        method: 'get',
        url: this.fixUrl(`${url}/new`),
        handler: 'new',
      },
      {
        // POST /resource
        method: 'post',
        url,
        handler: 'create',
      },
      {
        // GET /resource/:resourceId
        method: 'get',
        url: this.fixUrl(`${url}/:${resourceIdName}`),
        handler: 'show',
      },
      {
        // GET /resource/:resourceId/edit
        method: 'get',
        url: this.fixUrl(`${url}/:${resourceIdName}/edit`),
        handler: 'edit',
      },
      {
        // PUT /resource/:resourceId
        method: 'put',
        url: this.fixUrl(`${url}/:${resourceIdName}`),
        handler: 'update',
      },
      {
        // DELETE /resource/:resourceId
        method: 'delete',
        url: this.fixUrl(`${url}/:${resourceIdName}`),
        handler: 'destroy',
      },
    ]
  },

  /**
   * Router.getResourceName(url) -> String
   * - url (String)
   */
  getResourceName(url) {
    const parts = url.split('/')
    const resource = parts.pop()
    return inflected.singularize(resource)
  },

  /**
   * Router.getResourceIdName(url) -> String
   * - url (String)
   */
  getResourceIdName(url) {
    if (url === '/') {
      return 'id'
    }
    const resourceName = this.getResourceName(url)
    return `${resourceName}Id`
  },

  /**
   * Router.handleRequest(url, route, start, controller, request, response, next)
   * - url (String)
   * - route (Object)
   * - start (Integer)
   * - controller (Object)
   * - request (Object): Express request object.
   * - response (Object): Express response object.
   * - next (Object): Express next object.
   */
  handleRequest(url, route, start, controller, request, response, next) {
    const filters = controller.getFilters(url, route.handler)
    const page = this.getPage(request)
    const controllerParts = this.parseControllerName(request, url)
    const controllerName = this.getControllerName(controllerParts)
    const browserId = request.get('Browser-Context-Id')
      ? request.get('Browser-Context-Id')
      : `browser.${uuid.v4().replace(/-/g, '')}`
    request.minorjs = {
      page,
      controller: {
        name: controllerName,
        action: route.handler,
        parts: controllerParts,
      },
      start,
      requestToken: Indentifier.generate(),
      browserId,
    }
    Logger.info(`Request for ${controllerName}#${route.handler}`, request)

    Filter.run(filters, request, response, next).then(() => (
      // call the handler and return any promises
      this.runController(controller, route, request, response, next)
    ))
      .timeout(this.options.controllerTimeout)
      .catch((error) => {
        controller.handleError(request, response, error)
      })
      .done()
  },

  /**
   * Router.handleDevelopmentRequest(controller, url, route) -> Object
   * - controller (Object)
   * - url (String)
   * - route (Object)
   */
  handleDevelopmentRequest(controller, url, route) {
    backhoe.clearCache()

    const controllerPath = controller.path
    // eslint-disable-next-line import/no-dynamic-require, global-require
    let Controller = require(controllerPath)
    Controller = Controller.default ? Controller.default : Controller
    const newController = new Controller()

    newController.path = controllerPath
    newController.addFiltersForHandler(url, route.handler)

    return newController
  },

  /**
   * Router.incrementRequestCount()
   */
  incrementRequestCount() {
    this.requestCount += 1

    if (this.shouldStopWorker()) {
      process.emit('message', 'shutdown')
    }
  },

  /**
   * Router.loadAllControllers(app, controllerPath, files) -> Object
   * - app (Object): Express instance.
   * - controllerPath (String): Directory containing controllers.
   * - files (Array): All controllers.
   *
   * Loads all controllers.
   */
  loadAllControllers(app, controllerPath, files) {
    const controllers = []

    files.forEach((file) => {
      controllers.push(this.loadController(app, controllerPath, file))
    })

    return Promise.all(controllers)
  },

  /**
   * Router.loadController(app, controllerPath, file) -> Object
   * - app (Object): Express instance.
   * - controllerPath (String): controller directory
   * - file (String): controller pathname
   */
  loadController(app, controllerPath, file) {
    const start = Date.now()
    const fullPath = `${controllerPath}/${file.replace(/\.(js|coffee)/, '')}`
    const controller = this.requireController(fullPath)

    if (!controller) {
      return
    }

    this.buildRoutes(app, controller, file)

    Logger.profile(`Load controller ${file}`, start)
  },

  /**
   * Router.parseControllerName(request, url) -> Array
   * - request (Object): Express request object
   */
  parseControllerName(request, url) {
    if (url === '/error') {
      return ['error']
    }

    const exclude = ['new', 'edit']

    return request.route.path
      .split('/')
      .filter(value => (
        // ignore IDs and new/edit
        value.length > 0 &&
          value[0] !== ':' &&
          exclude.indexOf(value) === -1
      ))
  },

  /**
   * Router.registerErrorController(app, controllerPath) -> Promise
   * - app (Object): Express app object.
   * - controllerPath (String)
   */
  registerErrorController(app, controllerPath) {
    const errorControllerPath = path.join(controllerPath, 'error')

    if (!fs.existsSync(`${errorControllerPath}.js`) && !fs.existsSync(`${errorControllerPath}.coffee`)) {
      // can't find error controller. will fall back on default Express.js
      // 404 behavior.
      return
    }

    const controller = this.requireController(errorControllerPath)
    const route = {
      method: 'get',
      url: /^(.*)$/,
      handler: 'index',
    }
    const url = '/error'

    this.registerRoute(app, controller, url, route)
  },

  /**
   * Router.registerRoute(app, controller, url, route)
   * - app (Object): Express app object.
   * - controller (Object): Controller instance.
   * - url (String)
   * - route (Object): Route hash
   */
  registerRoute(app, controller, url, route) {
    controller.addFiltersForHandler(url, route.handler)

    app[route.method](route.url, (request, response, next) => {
      const startTime = Date.now()
      const requestController = Environment.isDevelopment()
        ? this.handleDevelopmentRequest(controller, url, route)
        : controller

      requestController.emit('request-started', request)

      Logger.debug(
        `${request.method} ${request.url} START. PARAMS: ${JSON.stringify(request.params)}, BODY: ${JSON.stringify(request.body)}, QUERY: ${JSON.stringify(request.query)}`,
        request,
      )

      this.incrementRequestCount()

      this.handleRequest(url, route, startTime, requestController, request, response, next)
    })
  },

  /**
   * Router.requireController(controllerPath) -> Object
   * - controllerPath (String): controller module
   */
  requireController(controllerPath) {
    let Controller

    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      Controller = require(controllerPath)
      Controller = Controller.default ? Controller.default : Controller
    } catch (error) {
      Logger.error(`Error while loading controller '${controllerPath}': ${error.stack}`)

      if (Environment.isWorker()) {
        process.emit('message', 'shutdown')
      } else {
        process.exit()
      }

      return undefined
    }

    const controller = new Controller()
    controller.path = controllerPath

    return controller
  },

  /**
   * Router.runController(controller, route, request, response, next) -> Object
   * - controller (Object): Controller instance.
   * - route (Object): Route hash.
   * - request (Object): Express request object.
   * - response (Object): Express response object.
   * - next (Object): Express next object.
   */
  runController(controller, route, request, response, next) {
    return controller[route.handler].call(controller, request, response, next)
  },

  /**
   * Router.shouldStopWorker() -> Boolean
   *
   * Return true if we're a worker and we've reached the request limit.
   */
  shouldStopWorker() {
    const maxRequests = this.getMaxRequests()

    return Environment.isWorker() && maxRequests > 0 && this.requestCount >= maxRequests
  },

  /**
   * Router.getMaxRequests() -> Integer
   *
   * Return the max request limit or 0 for no limit.
   */
  getMaxRequests() {
    if (typeof this.maxRequests === 'undefined') {
      try {
        const maxRequests = parseInt(Config.get('max_requests'), 10)
        const jitterRange = Math.round(maxRequests * this.MAX_REQUEST_JITTER)
        const jitter = jitterRange > 0
          ? Math.floor(Math.random() * ((jitterRange * 2) - 1)) - jitterRange
          : 0
        this.maxRequests = maxRequests + jitter
      } catch (e) {
        this.maxRequests = 0
      }
      Logger.info(`Worker started with request limit of ${this.maxRequests}`)
    }

    return this.maxRequests
  },
}

export default Router
