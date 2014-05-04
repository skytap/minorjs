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

var Winston     = require('winston'),
    Minor       = require('minorjs'),
    Environment = Minor.Environment;

function WinstonLogger () {
  this.winston = new (Winston.Logger)();

  if (!Environment.isProduction()) {
    this.winston.add(
      Winston.transports.Console,
      {
        colorize : true,
        level    : 'silly'
      }
    );
  }

  this.winston.exitOnError = false;
}

WinstonLogger.prototype.log = function (level, message) {
  this.winston.log(level, message)
};

module.exports = WinstonLogger;