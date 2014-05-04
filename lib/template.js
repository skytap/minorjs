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

var Q          = require('q'),
    fs         = require('fs'),
    Filesystem = require('./filesystem'),
    Logger     = require('./logger');

/**
 * Module to load and register template mixins.
 **/
var Template = {

    mixins : {},

    //////////////////////////////////////////////////////////////////////////
    // Public methods ///////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Template.getMixins() -> Object
     **/
    getMixins : function() {
        return this.mixins;
    },

    /**
     * Template.loadMixins(path) -> Object
     * - path (String): Path to the template mixins
     **/
    loadMixins : function (path) {
        var self  = this,
            start = Date.now();

        if (!fs.existsSync(path)) {
            return Q();
        }

        return Filesystem.requireFilesInDirectory(path)
            .then(function(mixins) {
                self.mixins = mixins;
                Logger.profile('Load template mixins', start);
            });
    }
};

module.exports = Template;