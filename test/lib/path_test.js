var should  = require('should'),
    sinon   = require('sinon'),
    Backhoe = require('backhoe'),
    path    = require('path'),
    Q       = require('q'),
    Module  = require('../../lib/path');

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