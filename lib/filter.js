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

var _          = require('underscore'),
    Promise    = require('bluebird'),
    Filesystem = require('./filesystem'),
    Logger     = require('./logger');

/**
 * Module to load and manage controller filters.
 **/
var Filter = {

    filters : {},

    //////////////////////////////////////////////////////////////////////////
    // Public methods ///////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Filter.getFilters() -> Object
     **/
    getFilters : function() {
        return this.filters;
    },

    /**
     * Filter.load(path) -> Object
     * - path (String): Path to the filters
     **/
    load : function (path) {
        var self  = this,
            start = Date.now();

        return Filesystem.requireFilesInDirectory(path, true)
            .then(function(filters) {
                self.filters = filters;
                Logger.profile('Load filters', start);
            });
    },

    /**
     * Filter.run(filters, request, response, next) -> Boolean
     * - filters (Array): All filters to run
     * - request (Object): Express request object
     * - response (Object): Express response object
     * - next (Function): Express next callback
     **/
    run : function (filters, request, response, next) {
        var self            = this,
            filterFunctions = [];

        if (!filters) {
            return Promise.resolve();
        }

        _.each(filters, function (filter, index) {
            if (self.filters[filter] !== undefined) {
                filterFunctions.push(
                    self._runFilter(filter, request, response, next)
                );
            }
        });

        // run each filter in sequence
        return filterFunctions.reduce(
            function (current, next) {
                return current.then(next);
            },
            Promise.resolve()
        );
    },

    //////////////////////////////////////////////////////////////////////////
    // Psuedo-private methods ///////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Filter._runFilter(filter, request, response, next) -> Function
     * - filter (String): Filter name
     * - request (Object): Express request object
     * - response (Object): Express response object
     * - next (Function): Express next callback
     **/
    _runFilter : function (filter, request, response, next) {
        var self = this;

        return function () {
            var result;

            try {
                Logger.debug("Running the " + self.filters[filter].moduleName + " filter", request);
                result = self.filters[filter].process(request, response, next);
                return result instanceof Promise ? result : Promise.resolve(result);
            } catch (e) {
                Logger.debug("Rejected " + self.filters[filter].moduleName + " filter", request);
                return Promise.reject(e);
            }
        };
    }
};

module.exports = Filter;