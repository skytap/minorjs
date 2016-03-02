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

var util   = require('util'),
    Frames = require('minorjs-frames');

function RenderContextServer () {
  return Frames.RenderContextServer.prototype.constructor.apply(this, arguments);
}

util.inherits(RenderContextServer, Frames.RenderContextServer);

RenderContextServer.prototype.getViewAttributes = function () {
  return {
    request: this.frame.request
  };
}

module.exports = RenderContextServer;