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

var _           = require('underscore'),
    extend      = require('extend'),
    Q           = require('q'),
    Logger      = require('./logger'),
    Config      = require('./config'),
    Template    = require('./template'),
    Environment = require('./environment'),
    Indentifier = require('./identifier'),
    events      = require('events');

/**
 * Module with common controller functionality.
 **/
function Controller () {}

_.extend(Controller.prototype, events.EventEmitter.prototype, {

    DEFAULT_ERROR_MESSAGE : 'An error occurred. Please try again.',

    before : {},

    templatePath : '/lib/template',

    filtersByRoute : [],

    //////////////////////////////////////////////////////////////////////////
    // Boilerplate REST methods /////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Controller.index(request, response, next)
     * - request (Object): Express request object
     * - response (Object): Express response object
     * - next (Function): Express function to invoke the next handler
     *
     * GET /resource
     **/
    index : function(request, response, next) {
        next();
    },

    /**
     * Controller.new(request, response, next)
     * - request (Object): Express request object
     * - response (Object): Express response object
     * - next (Function): Express function to invoke the next handler
     *
     * GET /resource/new
     **/
    new : function(request, response, next) {
        next();
    },

    /**
     * Controller.create(request, response, next)
     * - request (Object): Express request object
     * - response (Object): Express response object
     * - next (Function): Express function to invoke the next handler
     *
     * POST /resource
     **/
    create : function(request, response, next) {
        next();
    },

    /**
     * Controller.show(request, response, next)
     * - request (Object): Express request object
     * - response (Object): Express response object
     * - next (Function): Express function to invoke the next handler
     *
     * GET /resource/:id
     **/
    show : function(request, response, next) {
        next();
    },

    /**
     * Controller.edit(request, response, next)
     * - request (Object): Express request object
     * - response (Object): Express response object
     * - next (Function): Express function to invoke the next handler
     *
     * GET /resource/:id/edit
     **/
    edit : function(request, response, next) {
        next();
    },

    /**
     * Controller.update(request, response, next)
     * - request (Object): Express request object
     * - response (Object): Express response object
     * - next (Function): Express function to invoke the next handler
     *
     * PUT /resource/:id
     **/
    update : function(request, response, next) {
        next();
    },

    /**
     * Controller.destroy(request, response, next)
     * - request (Object): Express request object
     * - response (Object): Express response object
     * - next (Function): Express function to invoke the next handler
     *
     * DELETE /resource/:id
     **/
    destroy : function(request, response, next) {
        next();
    },

    //////////////////////////////////////////////////////////////////////////
    // Public methods ///////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Controller.addFiltersForHandler(url, handler)
     * - url (String)
     * - handler (String)
     **/
    addFiltersForHandler : function (url, handler) {
        var self = this;

        if (this.filtersByRoute[url] === undefined) {
            this.filtersByRoute[url] = {};
        }

        this.filtersByRoute[url][handler] = [];

        _.each(this.before, function cacheFilters (handlers, filter) {
            if (handlers.indexOf(handler) !== -1 || handlers[0] === 'all') {
                self.filtersByRoute[url][handler].push(filter);
            }
        });
    },

    /**
     * Controller.getFilters(url, handler) -> Array
     * - url (String)
     * - handler (String)
     **/
    getFilters : function(url, handler) {
        return this.filtersByRoute[url][handler];
    },

    /**
     * Controller.render(request, response, templateName, templateValues)
     **/
    render : function (request, response, templateName, templateValues, send) {
        var self           = this,
            deferred       = Q.defer(),
            defaults       = {
                layout      : 'layouts/application',
                title       : '',
                stylesheets : [],
                response    : response,
                request     : request,
                flash       : {},
                Config      : Config,
                _content    : {}
            },
            templateMixins = Template.getMixins(),
            startTime,
            send = (typeof send === 'undefined') ? true : send;

        templateValues = _.extend(
            defaults,
            templateValues
        );

        _.each(templateMixins, function (Helper, name) {
            templateValues[name] = Helper.bind(templateValues);
        });

        _.each(templateValues, function (value, key) {
            response.locals[key] = value;
        });

        startTime = Date.now();

        response.on('finish', function () {
            self.emit('render-finished', self, request, startTime, templateName);
            self._requestFinished(request);
        });

        response.render(templateName, { layout : templateValues.layout }, function (error, result) {
            Logger.debug(request.method + ' ' + request.url + ' DONE', request);

            Logger.info(
                'Request for ' + request.minorjs.controller.name + '#' +
                request.minorjs.controller.action + ' done in ' +
                (Date.now() - request.minorjs.start) + 'ms',
                request
            );

            if (error) {
                self._handleRenderError(request, response, error, templateName);
                deferred.reject(error);
            } else {
                if (send) {
                    response.send(result);
                }
                deferred.resolve(result);
            }
        });

        return deferred.promise;
    },

    //////////////////////////////////////////////////////////////////////////
    // Psuedo-private methods ///////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Controller._getFullError() -> String
     **/
    _getFullError : function (request, response, error, incidentId) {
        return 'Incident ' + incidentId + ' - ' + error.stack;
    },

    /**
     * Controller._getUserError() -> String
     **/
    _getUserError : function (request, response, error, incidentId) {
        return this.DEFAULT_ERROR_MESSAGE + ' (' + incidentId + ')';
    },

    /**
     * Controller._handleError(request, response, error)
     **/
    _handleError : function (request, response, error) {
        var incidentId = Indentifier.generate(),
            fullError  = this._getFullError(request, response, error, incidentId),
            userError;

        Logger.error(fullError, request);

        if (request.xhr) {
            this._handleXhrError(request, response, error);
        } else {
            this._handleNormalError(request, response, error, incidentId);
        }
    },

    /**
     * Controller._handleXhrError(request, response, error)
     **/
    _handleXhrError : function (request, response, error) {
        response.status(500).send(
            {
                success : false,
                error   : error
            }
        );
    },

    /**
     * Controller._handleNormalError(request, response, error, incidentId)
     **/
    _handleNormalError : function (request, response, error, incidentId) {
        var userError = this._getUserError(request, response, error, incidentId);

        response.status(500);

        this.render(
            request,
            response,
            'error',
            {
                userError : userError,
                error     : Environment.isDevelopment() ? error : null,
                layout    : 'layouts/error'
            }
        );
    },

    /**
     * Controller._handleRenderError(request, response, error, templateName)
     * - request (Object): Request object.
     * - response (Object): Response object.
     * - error (Object)
     * - templateName (String)
     **/
    _handleRenderError: function (request, response, error, templateName) {
        if (templateName === 'error') {
            var incidentId = Indentifier.generate(),
                fullError  = this._getFullError(request, response, error, incidentId),
                userError  = this._getUserError(request, response, error, incidentId);
            Logger.error('Could not render error page. ' + fullError, request);
            response.send(userError);
        } else {
            this._handleError(request, response, error);
        }
    },

    /**
     * Controller._requestFinished(request)
     * - request (Object): Request object.
     **/
    _requestFinished : function (request) {
        var results = extend(
            {
                method : request.method,
                time   : Date.now() - request.minorjs.start
            },
            request.minorjs
        );
        this.emit('request-finished', request, results);
    }
});

module.exports = Controller;
