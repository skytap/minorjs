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

var util                = require('util'),
    Frames              = require('minorjs-frames'),
    HelloView           = require('../views/hello_view'),
    RenderContextServer = require('./render_context_server');

function HelloServerFrame () {
  this.renderContextKlass = RenderContextServer;

  this.domDependencies = {
    helloView: null
  };

  this.viewKlasses = [
    HelloView
  ];

  this.frameModel = {
    userName: 'Jane Smith'
  };

  return Frames.Frame.prototype.constructor.apply(this, arguments);
}

util.inherits(HelloServerFrame, Frames.Frame);

module.exports = HelloServerFrame;
