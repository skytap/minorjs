/**
 * Copyright 2014 Skytap Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
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
 **/

import Minor from 'minorjs'
import PugTemplatePlugin from './template_plugins/pug_template_plugin'

/**
 * Module to instantiate and start the HTTP server.
 **/
export default class HttpServer {
  initialize(basePath, port) {
    this.app = new Minor({
      basePath: basePath,
      // you could easily load the port from a config file or from a command line argument
      port: port || 3042,
      middleware: {
        // you can define middleware for different environments. for example,
        // you could run JS/CSS combination tasks in development but serve
        // static assets in production.
        development: [
          'static',
        ],
      },
      loggers: {
        // you can define loggers for different environments. for example,
        // you could log to a file in development and to a central syslog server
        // in production.
        development: [
          'winston',
        ],
      },
      templatePlugins: [
        PugTemplatePlugin,
      ],
    })

    return this.app.initialize()
  }

  listen() {
    // tell the server to start listening on the configured port
    return this.app.listen()
  }
}
