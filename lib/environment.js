var Config  = require('./config'),
    Logger  = require('./logger'),
    fs      = require('fs'),
    cluster = require('cluster');

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

    getEnvironment : function () {
        return this.environment;
    },

    getInstance : function () {
        return this.instance;
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