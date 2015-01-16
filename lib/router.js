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

var path        = require('path'),
    fs          = require('fs'),
    q           = require('q'),
    backhoe     = require('backhoe'),
    humanize    = require('humanize-plus'),
    inflected   = require('inflected'),
    Path        = require('./path'),
    Filesystem  = require('./filesystem'),
    Logger      = require('./logger'),
    Filter      = require('./filter'),
    Environment = require('./environment'),
    Config      = require('./config'),
    Indentifier = require('./identifier'),
    uuid        = require('node-uuid');

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
                files = files.reverse()                                      // deeper paths need to be registered first
                return self._loadAllControllers(app, controllerPath, files);
            })
            .then(function registerErrorController () {
                self._registerErrorController(app, controllerPath);
            });
    },

    //////////////////////////////////////////////////////////////////////////
    // Psuedo-private methods ///////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Router._buildRoutes(app) -> Null
     * - app (Object): Express app object
     **/
    _buildRoutes : function (app, controller, url) {
        var self = this,
            routes;

        url    = this._fixUrl(url);
        routes = this._getRoutesForUrl(url);

        routes.forEach(function registerRoute (route) {
            self._registerRoute(app, controller, url, route);
        });
    },

    /**
     * Router._filterControllers(file) -> Boolean
     * - file (String): controller pathname
     **/
    _filterControllers : function (file) {
        var controller = file.replace(path.extname(file), '')             // remove file extension
                .split('').reverse().join(''),                            // reverse string
            search     = 'controller/error'.split('').reverse().join(''); // reverse string

        if (controller.lastIndexOf(search) === 0) {
            return false;
        }

        var controllerPath = new Path(file);
        return controllerPath.isJavascriptFile() || controllerPath.isCoffeescriptFile();
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
                return humanize.capitalize(value);
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
     * Router._getParentPathsForUrl(url) -> Array
     * - url (String)
     **/
    _getParentPathsForUrl : function (urlParts) {
        var resource = urlParts.shift();

        if (urlParts.length === 0) {
            return [ resource ];
        }

        var paths      = [
                resource,
                resource + '/:' + this._getResourceIdName(resource)
            ],
            childPaths = this._getParentPathsForUrl(urlParts),
            results    = [];

        paths.forEach(function (parentPath) {
            childPaths.forEach(function (childPath) {
                results.push(parentPath + '/' + childPath);
            });
        })

        return results;
    },

    /**
     * Router._getRoutesForUrl(url) -> Array
     * - url (String)
     **/
    _getRoutesForUrl : function (url) {
        var self     = this,
            urlParts = url.split('/')
                .filter(function ignoreEmptyString (value) {
                    return value.length > 0;
                }),
            paths    = this._getParentPathsForUrl(urlParts)
                .map(function addLeadingSlash (value) {
                    return '/' + (value ? value : '');
                }),
            routes   = [];

        paths.forEach(function addRoutes (basePath) {
            routes = routes.concat(self._getRouteTable(basePath));
        });

        return routes;
    },

    /**
     * Router._getRouteTable(url) -> Array
     * - url (String)
     *
     * Add routes for all REST methods.
     * Inspired by http://guides.rubyonrails.org/routing.html
     **/
    _getRouteTable : function (url) {
        var resourceIdName = this._getResourceIdName(url);

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
                // GET /resource/:resourceId
                method  : 'get',
                url     : this._fixUrl(url + '/:' + resourceIdName),
                handler : 'show'
            },
            {
                // GET /resource/:resourceId/edit
                method  : 'get',
                url     : this._fixUrl(url + '/:' + resourceIdName + '/edit'),
                handler : 'edit'
            },
            {
                // PUT /resource/:resourceId
                method  : 'put',
                url     : this._fixUrl(url + '/:' + resourceIdName),
                handler : 'update'
            },
            {
                // DELETE /resource/:resourceId
                method  : 'delete',
                url     : this._fixUrl(url + '/:' + resourceIdName),
                handler : 'destroy'
            }
        ];
    },

    /**
     * Router._getResourceName(url) -> String
     * - url (String)
     **/
    _getResourceName : function (url) {
        var parts    = url.split('/'),
            resource = parts.pop();
        return inflected.singularize(resource);
    },

    /**
     * Router._getResourceIdName(url) -> String
     * - url (String)
     **/
    _getResourceIdName : function (url) {
        if (url === '/') {
            return 'id';
        }
        var resourceName = this._getResourceName(url);
        return resourceName + 'Id';
    },

    /**
     * Router._handleRequest(url, route, startTime, controller, request, response, next)
     * - url (String)
     * - route (Object)
     * - startTime (Integer)
     * - controller (Object)
     * - request (Object): Express request object.
     * - response (Object): Express response object.
     * - next (Object): Express next object.
     **/
    _handleRequest : function (url, route, startTime, controller, request, response, next) {
        var self            = this,
            filters         = controller.getFilters(url, route.handler),
            page            = this._getPage(request),
            controllerParts = this._parseControllerName(request, url),
            controllerName  = this._getControllerName(controllerParts);

        request.minorjs = {
            page         : page,
            controller   : {
              name   : controllerName,
              action : route.handler,
              parts  : controllerParts
            },
            start        : startTime,
            requestToken : Indentifier.generate(),
            browserId    : request.get('Browser-Context-Id') ? request.get('Browser-Context-Id') : 'browser.' + uuid.v4().replace(/-/g, '')
        };

        Logger.info('Request for ' + controllerName + '#' + route.handler, request);

        Filter.run(filters, request, response, next)
            .then(function runController (success) {
                // call the handler and return any promises
                return self._runController(controller, route, request, response, next);
            })
            .fail(function handleError (error) {
                controller._handleError(request, response, error);
            })
            .done();
    },

    /**
     * Router._handleDevelopmentRequest(controller, url, route) -> Object
     * - controller (Object)
     * - url (String)
     * - route (Object)
     **/
    _handleDevelopmentRequest : function (controller, url, route) {
        backhoe.clearCache();

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
     * - controllerPath (String): Directory containing controllers.
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

        return q.all(controllers);
    },

    /**
     * Router._loadController(app, controllerPath, file) -> Object
     * - app (Object): Express instance.
     * - controllerPath (String): controller directory
     * - file (String): controller pathname
     **/
    _loadController : function (app, controllerPath, file) {
        var start      = Date.now(),
            fullPath   = controllerPath + '/' + file.replace(/\.(js|coffee)/, ''),
            controller = this._requireController(fullPath);

        if (!controller) {
            return;
        }

        this._buildRoutes(app, controller, file);

        Logger.profile('Load controller ' + file, start);
    },

    /**
     * Router._parseControllerName(request, url) -> Array
     * - request (Object): Express request object
     **/
    _parseControllerName : function (request, url) {
        if (url === '/error') {
            return [ 'error' ];
        }

        var exclude = [ 'new', 'edit' ];

        return request.route.path
            .split('/')
            .filter(function (value) {
                // ignore IDs and new/edit
                return value.length > 0 &&
                  value[0] !== ':' &&
                  exclude.indexOf(value) === -1;
            });
    },

    /**
     * Router._registerErrorController(app, controllerPath) -> Promise
     * - app (Object): Express app object.
     * - controllerPath (String)
     **/
    _registerErrorController : function (app, controllerPath) {
        var errorControllerPath = path.join(controllerPath, 'error');

        if (!fs.existsSync(errorControllerPath + '.js') && !fs.existsSync(errorControllerPath + '.coffee')) {
            // can't find error controller. will fall back on default Express.js
            // 404 behavior.
            return;
        }

        var controller = this._requireController(errorControllerPath),
            route      = {
                method  : 'get',
                url     : /^(.*)$/,
                handler : 'index'
            },
            url        = '/error';

        this._registerRoute(app, controller, url, route);
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
            var startTime = Date.now();

            controller.emit('request-started', request);

            Logger.debug(
                request.method + ' ' + request.url + ' START. ' +
                'PARAMS: ' + JSON.stringify(request.params) + ', ' +
                'BODY: ' + JSON.stringify(request.body) + ', ' +
                'QUERY: ' + JSON.stringify(request.query),
                request
            );

            if (Environment.isDevelopment()) {
                controller = self._handleDevelopmentRequest(controller, url, route);
            }

            self._incrementRequestCount();

            self._handleRequest(url, route, startTime, controller, request, response, next);
        });
    },

    /**
     * Router._requireController(controllerPath) -> Object
     * - controllerPath (String): controller module
     **/
    _requireController : function (controllerPath) {
        var Controller,
            controller;

        try {
            Controller = require(controllerPath);
        } catch (error) {
            Logger.error("Error while loading controller '" + controllerPath + "': " + error.stack);

            if (Environment.isWorker()) {
                process.emit('message', 'shutdown');
            } else {
                process.exit();
            }

            return;
        }

        controller      = new Controller();
        controller.path = controllerPath;

        return controller;
    },

    /**
     * Router._runController(controller, route, request, response, next) -> Object
     * - controller (Object): Controller instance.
     * - route (Object): Route hash.
     * - request (Object): Express request object.
     * - response (Object): Express response object.
     * - next (Object): Express next object.
     **/
    _runController : function (controller, route, request, response, next) {
        var self = this;

        return controller[route.handler].call(controller, request, response, next);
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
