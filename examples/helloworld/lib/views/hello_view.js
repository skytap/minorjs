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

var template = require('underscore').template;

function HelloView (options) {
  this.model   = options.model;
  this.request = options.request;
}

HelloView.prototype.el = '.name';

HelloView.prototype.name = 'helloView';

HelloView.prototype.template = template('Hello: <%= model.userName %>');

HelloView.prototype.render = function () {
  var html = this.template({
    model: this.model
  });

  return this.$el.html(html);
}

HelloView.prototype.setElement = function (selector) {
  this.$el = this.request.$(selector);
  return this;
}

HelloView.prototype.refreshEl = function () {
  this.setElement(this.el);
  return this;
}

module.exports = HelloView;