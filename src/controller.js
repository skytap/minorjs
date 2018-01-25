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
import extend from 'extend'
import Promise from 'bluebird'
import { EventEmitter } from 'events'
import Logger from './logger'
import Config from './config'
import Template from './template'
import Environment from './environment'
import Identifier from './identifier'
import RenderError from './errors/rendererror'

/**
 * Module with common controller functionality.
 */
export default class Controller extends EventEmitter {
  constructor() {
    super()
    this.DEFAULT_ERROR_MESSAGE = 'An error occurred. Please try again.'
    this.ERROR_TEMPLATE = 'error'
    this.before = {}
    this.templatePath = '/lib/template'
    this.filtersByRoute = {}
  }

  /**
   * Controller.index(request, response, next)
   * - request (Object): Express request object
   * - response (Object): Express response object
   * - next (Function): Express function to invoke the next handler
   *
   * GET /resource
   */
  index(request, response, next) {
    next()
  }

  /**
   * Controller.new(request, response, next)
   * - request (Object): Express request object
   * - response (Object): Express response object
   * - next (Function): Express function to invoke the next handler
   *
   * GET /resource/new
   */
  new(request, response, next) {
    next()
  }

  /**
   * Controller.create(request, response, next)
   * - request (Object): Express request object
   * - response (Object): Express response object
   * - next (Function): Express function to invoke the next handler
   *
   * POST /resource
   */
  create(request, response, next) {
    next()
  }

  /**
   * Controller.show(request, response, next)
   * - request (Object): Express request object
   * - response (Object): Express response object
   * - next (Function): Express function to invoke the next handler
   *
   * GET /resource/:id
   */
  show(request, response, next) {
    next()
  }

  /**
   * Controller.edit(request, response, next)
   * - request (Object): Express request object
   * - response (Object): Express response object
   * - next (Function): Express function to invoke the next handler
   *
   * GET /resource/:id/edit
   */
  edit(request, response, next) {
    next()
  }

  /**
   * Controller.update(request, response, next)
   * - request (Object): Express request object
   * - response (Object): Express response object
   * - next (Function): Express function to invoke the next handler
   *
   * PUT /resource/:id
   */
  update(request, response, next) {
    next()
  }

  /**
   * Controller.destroy(request, response, next)
   * - request (Object): Express request object
   * - response (Object): Express response object
   * - next (Function): Express function to invoke the next handler
   *
   * DELETE /resource/:id
   */
  destroy(request, response, next) {
    next()
  }

  /**
   * Controller.addFiltersForHandler(url, handler)
   * - url (String)
   * - handler (String)
   */
  addFiltersForHandler(url, handler) {
    if (!{}.hasOwnProperty.call(this.filtersByRoute, url)) {
      this.filtersByRoute[url] = {}
    }

    this.filtersByRoute[url][handler] = []

    if (typeof this.before === 'object') {
      Object.entries(this.before).forEach(([filter, handlers]) => {
        if (handlers.indexOf(handler) !== -1 || handlers[0] === 'all') {
          this.filtersByRoute[url][handler].push(filter)
        }
      })
    }
  }

  /**
   * Controller.getFilters(url, handler) -> Array
   * - url (String)
   * - handler (String)
   */
  getFilters(url, handler) {
    return this.filtersByRoute[url][handler]
  }

  /**
   * Controller.render(request, response, templateName, templateValues, send) -> Promise
   * - request (Object): Express request object
   * - response (Object): Express response object
   * - templateName (String)
   * - templateValues (Object)
   * - send (Boolean)
   */
  render(request, response, templateName, templateValues, send) {
    const defaults = {
      layout: 'layouts/application',
      title: '',
      stylesheets: [],
      response,
      request,
      flash: {},
      Config,
      _content: {},
    }

    return new Promise((resolve, reject) => {
      const allTemplateValues = extend(
        defaults,
        templateValues,
      )

      Object.entries(Template.getMixins()).forEach(([name, Helper]) => {
        allTemplateValues[name] = Helper.bind(allTemplateValues)
      })

      Object.entries(allTemplateValues).forEach(([key, value]) => {
        response.locals[key] = value
      })

      const startTime = Date.now()

      response.on('finish', () => {
        this.emit('render-finished', this, request, startTime, templateName)
        this.requestFinished(request)
      })

      response.render(templateName, { layout: allTemplateValues.layout }, (error, result) => {
        Logger.debug(`${request.method} ${request.url} DONE`, request)

        Logger.info(
          `Request for ${request.minorjs.controller.name}#${request.minorjs.controller.action} done in ${Date.now() - request.minorjs.start} ms`,
          request,
        )

        if (error) {
          this.handleRenderError(request, response, error, templateName)
          reject(new RenderError())
        } else {
          const shouldSend = typeof send === 'undefined' ? true : send
          if (shouldSend) {
            response.send(result)
          }
          resolve(result)
        }
      })
    })
  }

  /**
   * Controller.getFullError() -> String
   */
  getFullError(request, response, error, incidentId) {
    return `Incident ${incidentId} - ${error.stack}`
  }

  /**
   * Controller.getUserError() -> String
   */
  getUserError(request, response, error, incidentId) {
    return `${this.DEFAULT_ERROR_MESSAGE} (${incidentId})`
  }

  /**
   * Controller.handleError(request, response, error)
   */
  handleError(request, response, error) {
    if (error instanceof RenderError) {
      // error was already handled
      return
    }

    const incidentId = Identifier.generate()
    const fullError = this.getFullError(request, response, error, incidentId)

    Logger.error(fullError, request)

    if (request.xhr) {
      this.handleXhrError(request, response, error)
    } else {
      this.handleNormalError(request, response, error, incidentId)
    }
  }

  /**
   * Controller.handleXhrError(request, response, error)
   */
  handleXhrError(request, response, error) {
    response.status(500).send({
      success: false,
      error,
    })
  }

  /**
   * Controller.handleNormalError(request, response, error, incidentId)
   */
  handleNormalError(request, response, error, incidentId) {
    const userError = this.getUserError(request, response, error, incidentId)

    response.status(500)

    this.render(
      request,
      response,
      this.ERROR_TEMPLATE,
      {
        userError,
        error: Environment.isDevelopment() ? error : null,
        layout: 'layouts/error',
      },
    )
  }

  /**
   * Controller.handleRenderError(request, response, error, templateName)
   * - request (Object): Request object.
   * - response (Object): Response object.
   * - error (Object)
   * - templateName (String)
   */
  handleRenderError(request, response, error, templateName) {
    if (templateName === this.ERROR_TEMPLATE) {
      const incidentId = Identifier.generate()
      const fullError = this.getFullError(request, response, error, incidentId)
      const userError = this.getUserError(request, response, error, incidentId)
      Logger.error(`Could not render error page. ${fullError}`, request)
      response.send(userError)
    } else {
      this.handleError(request, response, error)
    }
  }

  /**
   * Controller.requestFinished(request)
   * - request (Object): Request object.
   */
  requestFinished(request) {
    const results = extend(
      {
        method: request.method,
        time: Date.now() - request.minorjs.start,
      },
      request.minorjs,
    )
    this.emit('request-finished', request, results)
  }
}
