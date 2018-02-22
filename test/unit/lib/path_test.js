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
    Module  = require('../../../lib/path');

describe('lib/path.js', function () {
    beforeEach(function () {
        Backhoe.clear();
    });

    describe('isCoffeescriptFile', function () {
        [
            {
                file     : '',
                expected : false
            },
            {
                file     : 'coffeescript.js',
                expected : false
            },
            {
                file     : 'foo.notcoffee',
                expected : false
            },
            {
                file     : '.coffee',
                expected : false
            },
            {
                file     : 'foo.coffee',
                expected : true
            }
        ].forEach(function (testCase) {
            it('returns correct value for: ' + JSON.stringify(testCase), function () {
                var module = new Module(testCase.file);
                module.isCoffeescriptFile().should.eql(testCase.expected);
            });
        });
    });

    describe('isJavascriptFile', function () {
        [
            {
                file     : '',
                expected : false
            },
            {
                file     : 'js.coffee',
                expected : false
            },
            {
                file     : 'foo.notjs',
                expected : false
            },
            {
                file     : '.js',
                expected : false
            },
            {
                file     : 'foo.js',
                expected : true
            }
        ].forEach(function (testCase) {
            it('returns correct value for: ' + JSON.stringify(testCase), function () {
                var module = new Module(testCase.file);
                module.isJavascriptFile().should.eql(testCase.expected);
            });
        });
    });
});