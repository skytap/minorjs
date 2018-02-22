#!/usr/bin/env node

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

var HttpServer = require('./lib/http_server'),
    server     = new HttpServer();

server
  // pass in the base directory so we can easily load files
  .initialize(__dirname)
  .then(function () {
    // the initializiation of the server is async so we can load files like
    // loggers, controllers, filters, middleware, etc.

    // tell the server to start listening on the configured port
    return server.listen();
  })
  .done();

exports = server;