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

var _ = require('underscore');

/**
 * class Config
 *
 * Module to handle configuration settings.
 **/
var Config = {

    configs: {},

    //////////////////////////////////////////////////////////////////////////
    // Public methods ///////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Config.get(path) -> Mixed
     * - path (String): Dot-delimited configuration path. Example: 'api.ratelimit'
     *
     * Get a config value.
     **/
    get : function (path) {
        if (!path) {
            throw new Error('You must supply a config path');
        }

        var config = this.configs,
            parts  = path.split(".");

        for (var i in parts) {
            var currentPart = parts[i];
            if (!config.hasOwnProperty(currentPart)) {
                throw new Error('No config value found for: ' + path);
            }
            config = config[currentPart];
        }

        return config;
    },

    /**
     * Config.getAll() -> Object
     *
     * Get all available config values.
     **/
    getAll : function () {
        return this.configs;
    },

    /**
     * Config.load(environment, configs) -> Object
     * - environment (String): Select configs specific to this environment
     * - configs (Object): The configs to process
     *
     * Loads environment-specific config values.
     **/
    load : function(environment, configs) {
        _.extend(
            this.configs,
            this._processConfigs(environment, configs)
        );
    },

    /**
     * Config.set(path, value)
     * - path (String): Dot-delimited configuration path. Example: 'api.ratelimit'
     * - value (Mixed): Config value
     *
     * Set a config value.
     **/
    set : function (path, value) {
        var config = this.configs,
            parts  = path.split(".");

        parts.forEach(function (currentPart, index) {
            if (index === parts.length - 1) {
                config[currentPart] = value;
                return;
            }

            if (!config.hasOwnProperty(currentPart)) {
                config[currentPart] = {};
            }

            config = config[currentPart];
        });
    },

    //////////////////////////////////////////////////////////////////////////
    // Pseudo-private methods ///////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Config._processConfigs(environment, configs) -> Object
     * - environment (String): Select configs specific to this environment
     * - configs (Object): The configs to process
     *
     * Produces a config object that contains environment-specific config values.
     **/
    _processConfigs : function(environment, configs) {
        var self    = this,
            results = {},
            derivedValue;

        _.each(configs, function (value, key) {
            // literal config value
            if (typeof(value) === 'string' || typeof(value) === 'number') {
                results[key] = value;
                return;
            }

            if (value.hasOwnProperty(environment)) {
                // environment-specific config
                derivedValue = value[environment];
            } else if (value.hasOwnProperty('default')) {
                // fallback if environment-specific config isn't found
                derivedValue = value['default'];
            } else {
                // nested object
                derivedValue = self._processConfigs(environment, value);
            }

            results[key] = derivedValue;
        });

        return results;
    },
};

module.exports = Config;