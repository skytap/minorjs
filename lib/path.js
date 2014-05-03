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
 * Module to help with common path manipulation.
 **/
var Path = function(path) {
    this._path = path;
};

_.extend(Path.prototype, {

    //////////////////////////////////////////////////////////////////////////
    // Public methods ///////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Path.isCoffeescriptFile() -> Boolean
     **/
    isCoffeescriptFile : function () {
        return this._hasExtension('.coffee');
    },

    /**
     * Path.isJavascriptFile() -> Boolean
     **/
    isJavascriptFile : function() {
        return this._hasExtension('.js');
    },

    //////////////////////////////////////////////////////////////////////////
    // Psuedo-private methods ///////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Path._hasExtension(path, extension) -> Boolean
     * - path (String)
     * - extension (String)
     **/
    _hasExtension : function(extension) {
        var index = this._path.indexOf(extension);
        return index > 0 && index === this._path.length - extension.length;
    }
});

module.exports = Path;