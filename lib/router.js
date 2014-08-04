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

var extend      = require('extend'),
    Q           = require('q'),
    Backhoe     = require('backhoe'),
    Humanize    = require('humanize-plus'),
    Path        = require('./path'),
    Filesystem  = require('./filesystem'),
    Logger      = require('./logger'),
    Filter      = require('./filter'),
    Environment = require('./environment'),
    Config      = require('./config');

/**
 * Module for loading controllers and wiring up routes.
 **/
var Router = {

    requestCount : 0,

    //////////////////////////////////////////////////////////////////////////
    // Public methods ///////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Router.load(app, controllerPath) -> Object
     * - app (Object): Express instance.
     * - controllerPath (String): Directory containing controllers.
     *
     * Discovers and loads all controllers.
     **/
    load : function (app, controllerPath) {
        var self = this;

        return Filesystem.recurseDirectory(controllerPath, this._filterControllers)
            .then(function loadAllControllers (files) {
                return self._loadAllControllers(app, controllerPath, files);
            });
    },

    //////////////////////////////////////////////////////////////////////////
    // Psuedo-private methods ///////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Router._buildRoutes(app) -> Null
     * - app (Object): Express app object
     *
     * Add routes for all REST methods.
     * Inspired by http://guides.rubyonrails.org/routing.html
     **/
    _buildRoutes : function (app, controller, url) {
        var self = this,
            routes;

        url = this._fixUrl(url);

        routes = this._getRoutesForUrl(url);

        routes.forEach(function(route) {
            self._registerRoute(app, controller, url, route);
        });
    },

    /**
     * Router._filterControllers(file) -> Boolean
     * - file (String): controller pathname
     **/
    _filterControllers : function (file) {
        var path = new Path(file);
        return path.isJavascriptFile() || path.isCoffeescriptFile();
    },

    /**
     * Router._fixUrl(url) -> String
     * - url (String)
     **/
    _fixUrl : function(url) {
        // remove filename
        url = url.replace(/index\.(js|coffee)/, '')
            .replace(/\.(js|coffee)/, '');

        // remove trailing slash
        if (url.lastIndexOf('/') === url.length - 1) {
            url = url.slice(0, url.length - 1);
        }

        // make sure URL starts with a slash
        if (url[0] !== '/') {
            url = '/' + url;
        }

        return url.replace(/\/\//g, '/');
    },

    /**
     * Router._getControllerName(parts) -> String
     * - parts (Array)
     **/
    _getControllerName : function (parts) {
        return parts
            .map(function (value) {
                return Humanize.capitalize(value);
            })
            .join('');
    },

    /**
     * Router._getPage(request) -> String
     * - request (String)
     **/
    _getPage : function (request) {
        return request.url
            .split('?')[0]       // remove query string
            .replace(/^\//, '')  // remove leading slashes
            .replace(/\/$/, ''); // remove trailing slashes
    },

    /**
     * Router._getRoutesForUrl(url) -> Array
     * - url (String)
     **/
    _getRoutesForUrl : function (url) {
        return [
            {
                // GET /resource
                method  : 'get',
                url     : url,
                handler : 'index'
            },
            {
                // GET /resource/new
                method  : 'get',
                url     : this._fixUrl(url + '/new'),
                handler : 'new'
            },
            {
                // POST /resource
                method  : 'post',
                url     : url,
                handler : 'create'
            },
            {
                // GET /resource/:id
                method  : 'get',
                url     : this._fixUrl(url + '/:id'),
                handler : 'show'
            },
            {
                // GET /resource/:id/edit
                method  : 'get',
                url     : this._fixUrl(url + '/:id/edit'),
                handler : 'edit'
            },
            {
                // PUT /resource/:id
                method  : 'put',
                url     : this._fixUrl(url + '/:id'),
                handler : 'update'
            },
            {
                // DELETE /resource/:id
                method  : 'delete',
                url     : this._fixUrl(url + '/:id'),
                handler : 'destroy'
            }
        ];
    },

    /**
     * Router._handleRequest(url, route, controller, request, response, next)
     **/
    _handleRequest : function (url, route, controller, request, response, next) {
        var self            = this,
            filters         = controller.getFilters(url, route.handler),
            startTime       = Date.now(),
            page            = this._getPage(request),
            controllerParts = this._parseControllerName(page),
            controllerName  = this._getControllerName(controllerParts);

        request.minorjs = {
            page       : page,
            controller : {
              name   : controllerName,
              action : route.handler,
              parts  : controllerParts
            },
            start      : startTime
        };

        Logger.info('Request for ' + controllerName + '#' + route.handler);

        Filter.run(filters, request, response, next)
            .then(function runController (success) {
                // call the handler and return any promises
                return self._runController(controller, route, startTime, request, response, next);
            })
            .fail(function handleError (error) {
                controller._handleError(request, response, error);
            })
            .done();
    },

    /**
     * Router._handleDevelopmentRequest(controller, url, route)
     **/
    _handleDevelopmentRequest : function (controller, url, route) {
        Backhoe.clearCache();

        var controllerPath = controller.path,
            Controller     = require(controllerPath),
            newController  = new Controller();

        newController.path = controllerPath;
        newController.addFiltersForHandler(url, route.handler);

        return newController;
    },

    /**
     * Router._incrementRequestCount()
     **/
    _incrementRequestCount : function () {
        this.requestCount++;

        if (this._shouldStopWorker()) {
            process.emit('message', 'shutdown');
        }
    },

    /**
     * Router._loadAllControllers(app, controllerPath, files) -> Object
     * - app (Object): Express instance.
     * - path (String): Directory containing controllers.
     * - files (Array): All controllers.
     *
     * Loads all controllers.
     **/
    _loadAllControllers : function (app, controllerPath, files) {
        var self        = this,
            controllers = [];

        files.forEach(function requireController (file) {
            controllers.push(
                self._loadController(app, controllerPath, file)
            );
        });

        return Q.all(controllers);
    },

    /**
     * Router._loadController(app, controllerPath, file) -> Object
     * - app (Object): Express instance.
     * - controllerPath (String): controller directory
     * - file (String): controller pathname
     **/
    _loadController : function (app, controllerPath, file) {
        var start = Date.now(),
            path  = controllerPath + '/' + file.replace(/\.(js|coffee)/, '');

        try {
            Controller = require(path);
        } catch (err) {
            Logger.error("Error while loading controller '" + file + "': " + err);

            if (Environment.isWorker()) {
                process.emit('message', 'shutdown');
            } else {
                process.exit();
            }

            return;
        }

        controller = new Controller();

        controller.path = path;
        this._buildRoutes(app, controller, file);

        Logger.profile('Load controller ' + file, start);
    },

    /**
     * Router._parseControllerName(page) -> Array
     * - page (String)
     **/
    _parseControllerName : function (page) {
        var exclude = [ 'new', 'edit' ];

        return page
            .split('/')
            .filter(function (value) {
                // ignore IDs and new/edit
                return value.length > 0 && isNaN(parseInt(value)) && exclude.indexOf(value) == -1;
            });
    },

    /**
     * Router._registerRoute(app, controller, url, route)
     * - app (Object): Express app object.
     * - controller (Object): Controller instance.
     * - url (String)
     * - route (Object): Route hash
     **/
    _registerRoute : function (app, controller, url, route) {
        var self = this;

        controller.addFiltersForHandler(url, route.handler);

        app[route.method](route.url, function (request, response, next) {
            Logger.debug(
                request.method + ' ' + request.url + ' START. ' +
                'PARAMS: ' + JSON.stringify(request.params) + ', ' +
                'BODY: ' + JSON.stringify(request.body) + ', ' +
                'QUERY: ' + JSON.stringify(request.query)
            );

            if (Environment.isDevelopment()) {
                controller = self._handleDevelopmentRequest(controller, url, route);
            }

            self._incrementRequestCount();

            self._handleRequest(url, route, controller, request, response, next);
        });
    },

    /**
     * Router._requestFinished(controller, request, startTime)
     * - controller (Object): Controller instance.
     * - request (Object): Request object.
     * - startTime (Integer): Start time in milliseconds.
     **/
    _requestFinished : function (controller, request, startTime) {
        var results = extend(
            {
                method : request.method,
                time   : Date.now() - startTime
            },
            request.minorjs
        );
        controller.emit('request-finished', results);
    },

    /**
     * Router._runController(controller, route, startTime, request, response, next) -> Object
     * - controller (Object): Controller instance.
     * - route (Object): Route hash.
     * - startTime (Integer): Start time in milliseconds.
     * - request (Object): Express request object.
     * - response (Object): Express response object.
     * - next (Object): Express next object.
     **/
    _runController : function (controller, route, startTime, request, response, next) {
        var promise = controller[route.handler]
            .call(controller, request, response, next);

        if (Q.isPromise(promise)) {
            result = promise.then(this._requestFinished(controller, request, startTime));
        } else {
            this._requestFinished(controller, request, startTime);
            result = promise;
        }

        return result;
    },

    /**
     * Router._shouldStopWorker() -> Boolean
     *
     * Return true if we're a worker and we've reached the request limit.
     **/
    _shouldStopWorker : function () {
        var maxRequests;

        try {
            maxRequests = Config.get('max_requests');
        } catch (e) {
            maxRequests = 0;
        }

        return Environment.isWorker() && maxRequests > 0 && this.requestCount >= maxRequests;
    }
};

module.exports = Router;