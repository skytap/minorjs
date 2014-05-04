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
    Logger      = require('./logger'),
    Config      = require('./config'),
    Template    = require('./template'),
    Environment = require('./environment'),
    events      = require('events');

/**
 * Module with common controller functionality.
 **/
function Controller () {}

_.extend(Controller.prototype, events.EventEmitter.prototype, {

    CHARS : 'ABCDEF1234567890',

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
    render : function (request, response, templateName, templateValues) {
        var defaults       = {
                layout      : 'layouts/application',
                title       : '',
                stylesheets : [],
                response    : response,
                request     : request,
                flash       : {},
                Config      : Config,
                _content    : {}
            },
            templateMixins = Template.getMixins();

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

        response.render(templateName, { layout : templateValues.layout });

        Logger.debug(request.method + ' ' + request.url + ' DONE');

        Logger.info(
            'Request for ' + request.minorjs.controllerName + '#' +
            request.minorjs.action + ' done in ' +
            (Date.now() - request.minorjs.start) + 'ms'
        );
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
     * Controller._getIncidentId() -> String
     **/
    _getIncidentId : function () {
        var incidentId = '',
            randomNumber;

        for (var i = 0; i < 8; i++) {
            randomNumber = Math.floor(Math.random() * this.CHARS.length);
            incidentId += this.CHARS.substring(randomNumber, randomNumber + 1);
        }

        return incidentId;
    },

    /**
     * Controller._handleError(request, response, error)
     **/
    _handleError : function (request, response, error) {
        var incidentId = this._getIncidentId(),
            fullError  = this._getFullError(request, response, error, incidentId),
            userError;

        Logger.error(fullError);

        if (request.xhr) {
            this._handleXhrError(request, response, error);
        } else {
            this._handleNormalError(request, response, error, incidentId, fullError);
        }
    },

    /**
     * Controller._handleXhrError(request, response, error)
     **/
    _handleXhrError : function (request, response, error) {
        response.send(
            500,
            {
                success : false,
                error   : error
            }
        );
    },

    /**
     * Controller._handleNormalError(request, response, error, incidentId, fullError)
     **/
    _handleNormalError : function (request, response, error, incidentId, fullError) {
        response.status(500);

        userError  = this._getUserError(request, response, error, incidentId);

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
    }
});

module.exports = Controller;