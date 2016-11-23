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

var Config  = require('./config'),
    Logger  = require('./logger'),
    fs      = require('fs'),
    cluster = require('cluster'),
    uuid    = require('uuid');

/**
 * Module to store environment-specific details.
 **/
var Environment = {

    environment : 'default',

    //////////////////////////////////////////////////////////////////////////
    // Public methods ///////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Environment.getBasePath() -> String
     *
     * Returns the application base path.
     **/
    getBasePath : function() {
        return this.basePath;
    },

    /**
     * Environment.getEnvironment() -> String
     *
     * Returns the environment the application is running in.
     **/
    getEnvironment : function () {
        return this.environment;
    },

    /**
     * Environment.getInstance() -> Integer
     *
     * Returns the instance ID.
     **/
    getInstance : function () {
        return this.instance;
    },

    /**
     * Environment.getContextId() -> String
     *
     * Returns the context ID.
     **/
    getContextId : function () {
        return this.contextId;
    },

    /**
     * Environment.getContextName() -> String
     *
     * Returns the context name.
     **/
    getContextName : function () {
        return this.contextName;
    },

    /**
     * Environment.initialize(options)
     * - options (Object): Environment options
     **/
    initialize : function(options) {
        this.environment = options.environment;
        this.basePath    = options.basePath;
        this.instance    = options.instance;
        this.loggers     = options.loggers;
        this.contextId   = (uuid.v4()+'.'+ process.pid).replace(/-/g, '');
        this.contextName = options.contextName || 'minorjs';

        Config.load(
            this.environment,
            this._loadConfigs()
        );

        this._initLogger();
    },

    /**
     * Environment.isWorker() -> Boolean
     *
     * Return whether the process is a cluster worker.
     **/
    isWorker : function () {
        return cluster.isWorker;
    },

    /**
     * Environment.isDevelopment() -> Boolean
     *
     * Return whether the application is running in development.
     **/
    isDevelopment : function() {
        return this.environment === 'development';
    },

    /**
     * Environment.isProduction() -> Boolean
     *
     * Return whether the application is running in production.
     **/
    isProduction : function() {
        return this.environment === 'production';
    },

    //////////////////////////////////////////////////////////////////////////
    // Pseudo-private methods ///////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Environment._getConfigFilePath() -> String
     *
     * Constructs the full path to a configuration file.
     **/
    _getConfigFilePath : function () {
        return this.basePath + '/config/app.json';
    },

    /**
     * Environment._getLoggers() -> Array
     **/
    _getLoggers : function () {
        var environment = this.isProduction() ? 'production' : 'development';
        return this.loggers[environment] !== 'undefined' ? this.loggers[environment] : [];
    },

    /**
     * Environment._initLogger()
     *
     * Initializes logging for the application.
     **/
    _initLogger : function() {
        Logger.initialize({
            basePath : this.getBasePath(),
            instance : this.instance,
            loggers  : this._getLoggers()
        });
    },

    /**
     * Environment._loadConfigs() -> Object
     *
     * Loads the configuration file for this app.
     **/
    _loadConfigs : function () {
        var path    = this._getConfigFilePath(),
            configs = {};

        if (fs.existsSync(path)) {
            configs = JSON.parse(fs.readFileSync(path, 'utf8'));
        }

        return configs;
    }
};

module.exports = Environment;