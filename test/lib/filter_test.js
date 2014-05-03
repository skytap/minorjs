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

var should = require('should'),
    sinon  = require('sinon'),
    Backhoe = require('backhoe'),
    path   = require('path'),
    Q      = require('q'),
    Module;

describe('lib/filter.js', function () {
    beforeEach(function () {
        Backhoe.clear();
    });

    describe('getFilters', function () {
        it('returns all filters', function () {
            var filtersPath = './test/data/filters/',
                expected    = [
                    'foo',
                    'bar'
                ];

            Module = require('../../lib/filter');
            Module.filters = expected;
            Module.getFilters(filtersPath).should.eql(expected);
        });
    });

    describe('load', function () {
        it('should load all filters', function (done) {
            var Logger      = {
                    profile : sinon.spy()
                },
                filtersPath = path.join(
                    __dirname,
                    '../../test/data/filters'
                ),
                expected    = {
                    bar_filter : {
                        name : 'bar_filter'
                    },
                    foo_filter : {
                        name: 'foo_filter'
                    }
                };

            Backhoe.mock(require.resolve('../../lib/logger'), Logger);

            Module = require('../../lib/filter');
            Module.load(filtersPath)
                .then(function () {
                    Module.filters.bar_filter.name.should.eql(expected.bar_filter.name);
                    Module.filters.foo_filter.name.should.eql(expected.foo_filter.name);
                    Logger.profile.called.should.be.true;
                    done();
                })
                .done();
        });
    });

    describe('run', function () {
        it('should not run if no filters loaded', function (done) {
            var filters = [
                    'bar_filter',
                    'foo_filter'
                ],
                request  = {},
                response = {},
                next     = sinon.spy(),
                Logger   = {
                    debug : sinon.spy()
                };

            Backhoe.mock(require.resolve('../../lib/logger'), Logger);

            Module = require('../../lib/filter');
            Module.run(filters, request, response, next)
                .then(function () {
                    done();
                })
                .done();
        });

        it('should run all filters', function (done) {
            var filters = [
                    'bar_filter',
                    'foo_filter'
                ],
                request  = {},
                response = {},
                next     = sinon.spy(),
                Logger   = {
                    debug : sinon.spy()
                };

            Backhoe.mock(require.resolve('../../lib/logger'), Logger);

            Module = require('../../lib/filter');
            Module.filters = {
                'bar_filter' : {
                    process : sinon.spy(function () {
                        return true;
                    })
                },
                'foo_filter' : {
                    process : sinon.spy(function () {
                        return true;
                    })
                }
            };
            Module.run(filters, request, response, next)
                .then(function (results) {
                    results.should.be.true;
                    Module.filters.bar_filter.process.calledOnce.should.be.true;
                    Module.filters.bar_filter.process.calledWith(request, response, next);
                    Module.filters.foo_filter.process.calledOnce.should.be.true;
                    Module.filters.foo_filter.process.calledWith(request, response, next);
                    done();
                })
                .done();
        });

        it('should run subset of available filters', function (done) {
            var filters = [
                    'foo_filter'
                ],
                request  = {},
                response = {},
                next     = sinon.spy(),
                Logger   = {
                    debug : sinon.spy()
                };

            Backhoe.mock(require.resolve('../../lib/logger'), Logger);

            Module = require('../../lib/filter');
            Module.filters = {
                'bar_filter' : {
                    process : sinon.spy()
                },
                'foo_filter' : {
                    process : sinon.spy(function () {
                        return true;
                    })
                }
            };
            Module.run(filters, request, response, next)
                .then(function (results) {
                    results.should.be.true;
                    Module.filters.bar_filter.process.calledOnce.should.be.false;
                    Module.filters.foo_filter.process.calledOnce.should.be.true;
                    Module.filters.foo_filter.process.calledWith(request, response, next);
                    done();
                })
                .done();
        });

        it('should run filter that fails. does not run remaining filters', function (done) {
            var filters = [
                    'bar_filter',
                    'foo_filter'
                ],
                request  = {},
                response = {},
                next     = sinon.spy(),
                Logger   = {
                    debug : sinon.spy()
                };

            Backhoe.mock(require.resolve('../../lib/logger'), Logger);

            Module = require('../../lib/filter');
            Module.filters = {
                'bar_filter' : {
                    process : sinon.spy(function () {
                        throw new Error('failing filter');
                    })
                },
                'foo_filter' : {
                    process : sinon.spy()
                }
            };
            Module.run(filters, request, response, next)
                .then(function () {
                    should.fail();
                    done();
                })
                .fail(function (error) {
                    error.message.should.eql('failing filter');
                    Module.filters.bar_filter.process.calledOnce.should.be.true;
                    Module.filters.bar_filter.process.calledWith(request, response, next);
                    Module.filters.foo_filter.process.calledOnce.should.be.false;
                    done();
                })
                .done();
        });
    });

    describe('_runFilter', function () {
        it('should run correct filter', function (done) {
            var filter   = 'foo_filter',
                request  = {},
                response = {},
                next     = sinon.spy(),
                expected = 'some results',
                Logger   = {
                    debug : sinon.spy()
                };

            Backhoe.mock(require.resolve('../../lib/logger'), Logger);

            Module = require('../../lib/filter');
            Module.filters = {
                'foo_filter' : {
                    process : sinon.spy(function () {
                        return expected;
                    })
                },
                'bar_filter' : {
                    process : sinon.spy(function () {
                        return expected;
                    })
                }
            };
            var result = Module._runFilter(filter, request, response, next);
            result.should.be.type('function');
            result()
                .then(function (value) {
                    value.should.eql(expected);
                    Module.filters.bar_filter.process.calledOnce.should.be.false;
                    Module.filters.foo_filter.process.calledOnce.should.be.true;
                    Module.filters.foo_filter.process.calledWith(request, response, next);
                    done();
                })
                .done();
        });

        it('should run filter and return failed promise on exception', function (done) {
            var filter   = 'foo_filter',
                request  = {},
                response = {},
                next     = sinon.spy(),
                expected = 'some results',
                Logger   = {
                    debug : sinon.spy()
                };

            Backhoe.mock(require.resolve('../../lib/logger'), Logger);

            Module = require('../../lib/filter');
            Module.filters = {
                'foo_filter' : {
                    process : sinon.spy(function () {
                        throw new Error('some error');
                    })
                }
            };
            var result = Module._runFilter(filter, request, response, next);
            result.should.be.type('function');
            result()
                .fail(function (error) {
                    error.message.should.eql('some error');
                    Module.filters.foo_filter.process.calledOnce.should.be.true;
                    done();
                })
                .done();
        });
    });
});