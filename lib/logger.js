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

var _    = require('underscore'),
    path = require('path');

/**
 * Module to handle application logging.
 **/
var Logger = {

    levels : [
        'debug',
        'info',
        'warn',
        'error'
    ],

    loggers : [],

    //////////////////////////////////////////////////////////////////////////
    // Public methods ///////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Logger.initialize()
     *
     * Initialize the logger.
     **/
    initialize : function (options) {
        this._options = options;

        if (options.loggers && _.isArray(options.loggers) && options.loggers.length > 0) {
            this.loggers = this._loadLoggers(options.loggers);
        }

        this._addLevelHandlers();
    },

    /**
     * Logger.profile(name, start)
     * - name (String)
     * - start (Integer): Start time in milliseconds
     *
     * Output a debug log of the number of milliseconds it took to complete a task.
     **/
    profile : function (name, start) {
        this._log('debug', 'Performance: ' + name + ' took ' + (Date.now() - start) + 'ms');
    },

    //////////////////////////////////////////////////////////////////////////
    // Pseudo-private methods ///////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Logger._addLevelHandlers()
     **/
    _addLevelHandlers : function () {
        var self = this;

        this.levels.forEach(function (level) {
            self[level] = function (message) {
                self._log(level, message);
            };
        });
    },

    /**
     * Logger._loadLoggers(loggers) -> Array
     * - loggers (Array): Array of logger names
     **/
    _loadLoggers : function (loggers) {
        var self    = this,
            results = [];

        loggers.forEach(function processLogger (logger) {
            results.push(self._loadLogger(logger));
        });

        return results;
    },

    /**
     * Logger._loadLogger(file) -> Object
     * - file (String): Name of a logger
     **/
    _loadLogger : function (file) {
        var loggerPath = path.join(this._options.basePath, 'lib', 'loggers'),
            Logger     = require(path.join(loggerPath, file + '_logger')),
            logger     = new Logger(this.levels);

        return logger;
    },

    /**
     * Logger._log(level, message)
     * - level (String): Log level
     * - message (String): Message to log
     *
     * Log a message using the specified loggers.
     **/
    _log : function (level, message) {
        var self = this;
        this.loggers.forEach(function logMessage (logger) {
            logger.log(level, message);
        });
    }
};

module.exports = Logger;