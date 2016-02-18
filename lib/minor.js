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

var cluster         = require('cluster'),
    fs              = require('fs'),
    path            = require('path'),
    Express         = require('express'),
    _               = require('underscore'),
    cookieParser    = require('cookie-parser'),
    errorHandler    = require('errorhandler'),
    compression     = require('compression'),
    staticFavicon   = require('serve-favicon'),
    bodyParser      = require('body-parser'),
    Promise         = require('bluebird'),
    Backhoe         = require('backhoe'),
    Config          = require('./config'),
    Controller      = require('./controller'),
    Environment     = require('./environment'),
    Router          = require('./router'),
    Logger          = require('./logger'),
    Template        = require('./template'),
    Filter          = require('./filter'),
    Path            = require('./path'),
    FileSystem      = require('./filesystem'),
    hamlcPlugin     = require('./minorjs-template-hamlc');

/**
 * Module for creating an HTTP server.
 **/
var Minor = function(options) {
    this.app        = Express();
    this.options    = options;
    this.closing    = false;

    // bind functions
    this.listen     = _.bind(this.listen, this);
    this.initialize = _.bind(this.initialize, this);

    if (!this.options.instance) {
        this.options.instance = 1;
    }

    if (!this.options.controllerTimeout) {
        //default timeout 3 minutes
        this.options.controllerTimeout = 180000;
    }

    this._initializeEnvironment();
    this._initializeErrorHandling();
};

_.extend(Minor.prototype, {

    //////////////////////////////////////////////////////////////////////
    // Public methods ///////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////

    /**
     * Minor.initialize()
     **/
    initialize : function() {
        var start = Date.now(),
            defaultPromise,
            environmentPromise;

        this.start = start;

        this.app.use(cookieParser());

        defaultPromise = this._initializeDefaultConfiguration();

        environmentPromise = this._isProduction()
            ? this._initializeProductionConfig()
            : this._initializeDevelopmentConfig();

        // listen for a shutdown message
        process.on('message', this._handleMessage.bind(this));

        return Promise.all([defaultPromise, environmentPromise])
            .then(function () {
                Logger.profile('Initialize MinorJS', start);
            });
    },

    /**
     * Minor.listen() -> Object
     **/
    listen : function() {
        var self  = this,
            start = Date.now();

        return Router.load(this.app, this.options.basePath + "/lib/controllers", this.options)
            .then(function startExpressListening() {
                Logger.profile('Load controllers', start);

                var port = self._getPort();
                self.server = self.app.listen(port);

                Logger.profile('Load MinorJS', self.start);

                Logger.info("MinorJS HTTP server listening on port " + port);
            })
            .catch(function (error) {
                console.error('Error loading controllers and registering routes.\n\n', error.stack);
                process.exit(1);
            });
    },

    //////////////////////////////////////////////////////////////////////
    // Psuedo-private methods ///////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////

    /**
     * Minor._getEnvironment() -> String
     **/
    _getEnvironment : function () {
        return typeof process.env.NODE_ENV === 'undefined'
            ? 'development'
            : process.env.NODE_ENV;
    },

    /**
     * Minor._getPort()
     **/
    _getPort : function() {
        if (this.options.port) {
            return this.options.port;
        }

        return Config.get('port');
    },

    /**
     * Minor._initializeDefaultConfiguration()
     **/
    _initializeDefaultConfiguration : function() {
        var self  = this,
            start = Date.now();

        return Promise.resolve()
            .then(function () {
                self.app.use(compression());

                self.app.set('views', self.options.basePath + '/lib/templates');

                self.app.locals.escapeAttributes = true;

                if (Array.isArray(self.options.templatePlugins)) {
                    for (var index in self.options.templatePlugins) {
                        var plugin = self.options.templatePlugins[index];
                        plugin.register(self.app);
                    }
                } else {
                    hamlcPlugin.register(self.app);
                }
            })
            .then(function () {
                // load all the template mixins
                return Template.loadMixins(self.options.basePath + '/lib/template_mixins');
            })
            .then(function () {
                // load all the filters
                return Filter.load(self.options.basePath + '/lib/filters');
            })
            .then(function () {
                var faviconPath = self.options.basePath + '/public/favicon.ico';

                if (fs.existsSync(faviconPath)) {
                    self.app.use(staticFavicon(faviconPath));
                }

                // parse application/x-www-form-urlencoded
                self.app.use(bodyParser.urlencoded({ extended: false }));

                // parse application/json
                self.app.use(bodyParser.json());
            })
            .then(function () {
                Logger.profile('Initialize default configuration', start);
            });
    },

    /**
     * Minor._initializeDevelopmentConfig()
     **/
    _initializeDevelopmentConfig : function() {
        var self            = this,
            start           = Date.now(),
            noCacheDefaults = ['lib/controllers',
                               'lib/controller_helpers',
                               'lib/views',
                               'lib/templates'];

        return Promise.resolve()
            .then(function() {
              var noCachePaths = self.options.noCache || noCacheDefaults;
              Backhoe.noCache(
                  Environment.getBasePath(),
                  noCachePaths
              );

              // pretty print the HTML
              self.app.locals.uglify = false;

              self.app.use(
                  errorHandler({
                      dumpExceptions : true,
                      showStack      : true
                  })
              );

              return self._loadMiddleware('development');
            })
            .then(function () {
                Logger.profile('Initialize development configuration', start);
            });
    },

    /**
     * Minor._initializeProductionConfig()
     **/
    _initializeProductionConfig : function() {
        var self  = this,
            start = Date.now();

        return Promise.resolve()
            .then(function() {
                self.app.locals.uglify = true;
                return self._loadMiddleware('production');
            })
            .then(function () {
                Logger.profile('Initialize production configuration', start);
            });
    },

    /**
     * Minor._initializeEnvironment()
     **/
    _initializeEnvironment : function() {
        // Initialize the environment and configs
        Environment.initialize({
            basePath     : this.options.basePath,
            environment  : this.app.get('env'),
            instance     : this.options.instance,
            loggers      : this.options.loggers || [],
            contextName  : this.options.contextName
        });
    },

    /**
     * Minor._initializeErrorHandling()
     **/
    _initializeErrorHandling : function () {
        process.on('uncaughtException', function handleException (error) {
            console.log(error.stack)

            Logger.error(error.stack);

            if (Environment.isWorker()) {
                cluster.worker.disconnect();
            } else {
                process.exit(1);
            }
        });

        this.app.on('error', function handleError (error) {
            Logger.error(error.stack);
        });
    },

    /**
     * Minor._isProduction() -> Boolean
     **/
    _isProduction : function () {
        return this._getEnvironment() === 'production';
    },

    /**
     * Minor._loadMiddleware()
     *
     * Load and register middleware.
     **/
    _loadMiddleware : function (environment) {
        var self            = this,
            startMiddleware = Date.now(),
            middlewarePath  = path.join(this.options.basePath, 'lib', 'middleware');

        if (!this.options.middleware || !this.options.middleware[environment]) {
            return;
        }

        this.options.middleware[environment].forEach(function loadFile (file) {
            var start      = Date.now(),
                middleware = require(path.join(middlewarePath, file));
            middleware.process(self.app);
            Logger.profile('Load middleware ' + file, start);
        });

        Logger.profile('Load middleware', startMiddleware);

        return Promise.resolve();
    },

    /**
     * Minor._handleMessage(message)
     **/
    _handleMessage : function (message) {
        switch (message) {
            case 'shutdown':
                this._shutdown();
                break;
        }
    },

    /**
     * Minor._shutdown()
     **/
    _shutdown : function () {
        if (this.closing === true) {
            // already shutting down the worker
            return;
        }

        this.closing = true;

        // stop accepting HTTP connections
        this.server.close(function () {
            // shut down the worker. the cluster manager will spawn a replacement worker.
            cluster.worker.disconnect();
        });
    }
});

module.exports = Minor;

// expose modules
module.exports.Config      = Config;
module.exports.Controller  = Controller;
module.exports.Environment = Environment;
module.exports.FileSystem  = FileSystem;
module.exports.Logger      = Logger;
module.exports.Path        = Path;
