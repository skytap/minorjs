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

var Minor = require('minorjs');

/**
 * Module to instantiate and start the HTTP server.
 **/
function HttpServer () {}

HttpServer.prototype.initialize = function (basePath, port) {
  this.app = new Minor({
    basePath   : basePath,
    port       : port || 3042,
    middleware : {
      development : [
        'static'
      ]
    },
    loggers    : {
      development : [
        'winston'
      ]
    }
  });

  return this.app.initialize();
};

HttpServer.prototype.listen = function () {
  return this.app.listen();
};

module.exports = HttpServer;