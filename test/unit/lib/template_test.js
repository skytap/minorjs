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

var path    = require('path'),
    should  = require('should'),
    sinon   = require('sinon'),
    Backhoe = require('backhoe'),
    Module;

describe('lib/template.js', function () {
    beforeEach(function () {
        Backhoe.clear();
    });

    describe('getMixins', function () {
        it('should return all mixins', function () {
            var expected = {
                foo : 42
            };

            Module = require('../../../lib/template');
            Module.mixins = expected;
            Module.getMixins().should.eql(expected);
        });
    });

    describe('loadMixins', function () {
        it('should load all template mixins', function (done) {
            var Logger        = {
                    profile : sinon.spy()
                },
                templatesPath = path.join(
                    __dirname,
                    '../../../test/data/mixins'
                ),
                expected      = {
                    bar_mixin : {
                        name : 'bar_mixin'
                    },
                    foo_mixin : {
                        name: 'foo_mixin'
                    }
                };

            Backhoe.mock(require.resolve('../../../lib/logger'), Logger);

            Module = require('../../../lib/template');
            Module.loadMixins(templatesPath)
                .then(function () {
                    Module.mixins.should.eql(expected);
                    Logger.profile.called.should.be.true();
                    done();
                })
                .done();
        });
    });
});