/**
 * Copyright 2015 Skytap Inc.
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

var _               = require('underscore'),
    hamlc           = require('haml-coffee'),
    ExpressPartials = require('express-partials');

require('haml-coffee-loader').register({
    escapeAttributes : true
});

module.exports = MinorjsTemplateHamlc = {

    /**
     * MinorjsTemplateHamlc.register(app)
     * - app (Object): Express application instance
     **/
    register : function (app) {
        app.use(ExpressPartials());

        ExpressPartials.register('hamlc', function (src, opts) {
            return hamlc.__express(opts.filename, opts, function (err, result) {
                if (err) {
                    throw err;
                }
                return result;
            });
        });

        // configure the templating engine
        app.engine('hamlc', hamlc.__express);
        app.set('view engine', 'hamlc');
    }
};
