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

var should  = require('should'),
    sinon   = require('sinon'),
    Backhoe = require('backhoe'),
    Module;

describe('lib/identifier.js', function () {
    beforeEach(function () {
        Backhoe.clear();
    });

    describe('generate', function () {
        it('returns string', function () {
            Module = require('../../../lib/identifier');
            var result = Module.generate();
            result.should.be.type('string');
        });

        it('returns string with default length', function () {
            Module = require('../../../lib/identifier');
            var result = Module.generate();
            result.length.should.eql(8);
        });

        it('returns string with specified length', function () {
            Module = require('../../../lib/identifier');
            var result = Module.generate(20);
            result.length.should.eql(20);
        });
    });
});