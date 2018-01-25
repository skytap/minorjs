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

import Controller from 'minorjs/lib/controller'

export default class HelloController extends Controller {

  index(request, response, next) {
    this.render(request, response, 'hello/index')
  }

  new (request, response, next) {
    this.render(request, response, 'hello/new', null, false)
    .then((val) => {
      response.send(val)
    })
  }
}
