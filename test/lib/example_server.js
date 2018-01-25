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
 */

import path from 'path'
import Server from 'minorjs-test/lib/server'
import HttpServer from '../../examples/helloworld/lib/http_server'

class ExampleServer extends Server {
  get Server() {
    return HttpServer
  }

  get basePath() {
    return path.resolve(process.cwd(), 'examples/helloworld')
  }
}

// eslint-disable-next-line import/no-commonjs
module.exports = ExampleServer
