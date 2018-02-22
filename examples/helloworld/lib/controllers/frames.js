/**
 * Copyright 2016 Skytap Inc.
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

var util             = require('util'),
    Controller       = require('minorjs').Controller,
    cheerio          = require('cheerio'),
    HelloServerFrame = require('../frames/hello_server_frame');

function FramesController () {}

util.inherits(FramesController, Controller);

FramesController.prototype.index = function (request, response, next) {
  var frame = new HelloServerFrame({
    request: request
  }).initialize();

  return this.render(
      request,
      response,
      'frames/index',
      frame.localsForRender(),
      false
    )
    .then(function (html) {
      request.$ = cheerio.load(html);
      frame.generateHtml()
      response.send(request.$.html());
    });
}

module.exports = FramesController;
