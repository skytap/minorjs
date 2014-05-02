var Express         = require('express'),
    ExpressPartials = require('express-partials'),
    cookieParser    = require('cookie-parser'),
    errorHandler    = require('errorhandler'),
    compression     = require('compression'),
    staticFavicon   = require('static-favicon'),
    bodyParser      = require('body-parser'),
    Config          = require('./config'),
    Controller      = require('./controller'),
    Environment     = require('./environment'),
    Router          = require('./router'),
    Logger          = require('./logger'),
    _               = require('underscore'),
    hamlc           = require('haml-coffee'),
    Template        = require('./template'),
    Filter          = require('./filter'),
    fs              = require('fs'),
    path            = require('path'),
    Path            = require('./path'),
    FileSystem      = require('./filesystem'),
    Q               = require('q'),
    Backhoe         = require('backhoe'),
    cluster         = require('cluster');

require('haml-coffee-loader').register({
    escapeAttributes : false
});

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

        return Q.all([defaultPromise, environmentPromise])
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

        return Router.load(this.app, this.options.basePath + "/lib/controllers")
            .then(function startExpressListening() {
                Logger.profile('Load controllers', start);

                var port = self._getPort();
                self.server = self.app.listen(port);

                Logger.profile('Load MinorJS', self.start);

                Logger.info("MinorJS HTTP server listening on port " + port);
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

        return Q()
            .then(function () {
                self.app.use(compression());

                self.app.use(ExpressPartials());

                self.app.locals.escapeAttributes = false;

                ExpressPartials.register('.hamlc', function (src, opts) {
                    return hamlc.__express(opts.filename, opts, function (err, result) {
                        if (err) {
                            throw err;
                        }
                        return result;
                    });
                });

                // configure the templating engine
                self.app.set('views', self.options.basePath + '/lib/templates');
                self.app.engine('hamlc', hamlc.__express);
                self.app.set('view engine', 'hamlc');
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
                self.app.use(
                    staticFavicon(self.options.basePath + '/public/favicon.ico')
                );

                self.app.use(bodyParser());
            })
            .then(function () {
                Logger.profile('Initialize default configuration', start);
            });
    },

    /**
     * Minor._initializeDevelopmentConfig()
     **/
    _initializeDevelopmentConfig : function() {
        var self  = this,
            start = Date.now();

        return Q()
            .then(function() {
                Backhoe.noCache(
                    Environment.getBasePath(),
                    [
                        'lib/models',
                        'lib/collections',
                        'lib/controllers',
                        'lib/controller_helpers',
                        'lib/views',
                        'lib/templates'
                    ]
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

        return Q()
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
            basePath    : this.options.basePath,
            environment : this.app.get('env'),
            instance    : this.options.instance,
            loggers     : this.options.loggers || []
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

        return Q();
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
            // shut down the worker. pm2 will spawn a replacement worker.
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