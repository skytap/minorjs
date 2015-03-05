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
    Promise = require('bluebird'),
    Module;

describe('lib/router.js', function () {
    beforeEach(function () {
        Backhoe.clear();
    });

    describe('load', function () {
        it('should discover and load all controllers', function (done) {
            var app         = {},
                controllers = './test/data/controllers',
                expected    = [
                    'foo_controller.js',
                    'bar/another_controller.js',
                    'bar/baz_controller.js'
                ];

            Module = require('../../../lib/router');
            Module._loadAllControllers = sinon.spy();
            Module.load(app, controllers)
                .then(function () {
                    Module._loadAllControllers.calledOnce.should.be.true;
                    Module._loadAllControllers.calledWith(app, controllers, expected);
                    done();
                })
                .done();
        });
    });

    describe('_buildRoutes', function () {
        it('should build the route', function () {
            var app        = {},
                controller = {},
                url        = '/foo/bar',
                route      = 'some route',
                routes     = [ route ];

            Module = require('../../../lib/router');
            Module._registerRoute = sinon.spy();
            Module._getRoutesForUrl = sinon.spy(function () {
                return routes;
            });
            Module._buildRoutes(app, controller, url);

            Module._getRoutesForUrl.calledOnce.should.be.true;
            Module._getRoutesForUrl.calledWith(url);
            Module._registerRoute.calledOnce.should.be.true;
            Module._registerRoute.calledWith(app, controller, url, route);
        });
    });

    describe('_filterControllers', function () {
        [
            {
                file     : '',
                expected : false
            },
            {
                file     : 'foo.txt',
                expected : false
            },
            {
                file     : 'foo.js',
                expected : true
            },
            {
                file     : 'foo.coffee',
                expected : true
            }
        ]
        .forEach(function (testCase) {
            it('should correctly determine if file is controller', function () {
                Module = require('../../../lib/router');
                Module._filterControllers(testCase.file).should.eql(testCase.expected);
            });
        });
    });

    describe('_fixUrl', function () {
        [
            {
                file     : '',
                expected : '/'
            },
            {
                file     : '/',
                expected : '/'
            },
            {
                file     : 'index.js',
                expected : '/'
            },
            {
                file     : 'index.coffee',
                expected : '/'
            },
            {
                file     : '/foo/bar.js',
                expected : '/foo/bar'
            },
            {
                file     : '/foo/bar/index.js',
                expected : '/foo/bar'
            }
        ]
        .forEach(function (testCase) {
            it('returns correct URL', function () {
                Module = require('../../../lib/router');
                Module._fixUrl(testCase.file).should.eql(testCase.expected);
            });
        });
    });

    describe('_getControllerName', function () {
        [
            {
                parts    : [],
                expected : ''
            },
            {
                parts    : [ 'foo' ],
                expected : 'Foo'
            },
            {
                parts    : [ 'foo', 'bar' ],
                expected : 'FooBar'
            }
        ]
        .forEach(function (testCase) {
            it('should return ' + JSON.stringify(testCase.expected) + ' when the URL parts are ' + JSON.stringify(testCase.parts), function () {
                Module = require('../../../lib/router');
                Module._getControllerName(testCase.parts).should.eql(testCase.expected);
            });
        });
    });

    describe('_getRoutesForUrl', function () {
        it('should return correct routes for root route', function () {
            var url    = '/',
                routes = [
                    {
                        method  : 'get',
                        url     : '/',
                        handler : 'index'
                    },
                    {
                        method  : 'get',
                        url     : '/new',
                        handler : 'new'
                    },
                    {
                        method  : 'post',
                        url     : '/',
                        handler : 'create'
                    },
                    {
                        method  : 'get',
                        url     : '/:id',
                        handler : 'show'
                    },
                    {
                        method  : 'get',
                        url     : '/:id/edit',
                        handler : 'edit'
                    },
                    {
                        method  : 'put',
                        url     : '/:id',
                        handler : 'update'
                    },
                    {
                        method  : 'delete',
                        url     : '/:id',
                        handler : 'destroy'
                    }
                ];

            Module = require('../../../lib/router');
            Module._getRoutesForUrl(url).should.eql(routes);
        });

        it('should return correct routes for nested resource', function () {
            var url    = '/foo/bar',
                routes = [
                    {
                        method: 'get',
                        url: '/foo/bar',
                        handler: 'index'
                    },
                    {
                        method: 'get',
                        url: '/foo/bar/new',
                        handler: 'new'
                    },
                    {
                        method: 'post',
                        url: '/foo/bar',
                        handler: 'create'
                    },
                    {
                        method: 'get',
                        url: '/foo/bar/:barId',
                        handler: 'show'
                    },
                    {
                        method: 'get',
                        url: '/foo/bar/:barId/edit',
                        handler: 'edit'
                    },
                    {
                        method: 'put',
                        url: '/foo/bar/:barId',
                        handler: 'update'
                    },
                    {
                        method: 'delete',
                        url: '/foo/bar/:barId',
                        handler: 'destroy'
                    },
                    {
                        method: 'get',
                        url: '/foo/:fooId/bar',
                        handler: 'index'
                    },
                    {
                        method: 'get',
                        url: '/foo/:fooId/bar/new',
                        handler: 'new'
                    },
                    {
                        method: 'post',
                        url: '/foo/:fooId/bar',
                        handler: 'create'
                    },
                    {
                        method: 'get',
                        url: '/foo/:fooId/bar/:barId',
                        handler: 'show'
                    },
                    {
                        method: 'get',
                        url: '/foo/:fooId/bar/:barId/edit',
                        handler: 'edit'
                    },
                    {
                        method: 'put',
                        url: '/foo/:fooId/bar/:barId',
                        handler: 'update'
                    },
                    {
                        method: 'delete',
                        url: '/foo/:fooId/bar/:barId',
                        handler: 'destroy'
                    }
                ];

            Module = require('../../../lib/router');
            Module._getRoutesForUrl(url).should.eql(routes);
        });
    });

    describe('_handleRequest', function () {
        it('should run controller', function (done) {
            var url         = 'some/url',
                filters     = [ 'some filters' ],
                controller  = {
                    getFilters : sinon.spy(function () {
                        return filters;
                    })
                },
                route       = {
                    handler : 'some handler'
                },
                request     = {
                    url   : 'some url',
                    route : {
                        path : 'some path'
                    },
                    get   : sinon.spy()
                },

                response    = {},
                next        = {},
                Filter      = {
                    run : sinon.spy(function () {
                        return Promise.resolve(true);
                    })
                },
                Logger         = {
                    info : sinon.spy()
                },
                startTime = Date.now();

            Backhoe.mock(require.resolve('../../../lib/filter'), Filter);
            Backhoe.mock(require.resolve('../../../lib/logger'), Logger);

            Module = require('../../../lib/router');

            Module.options = {controllerTimeout: 180000};
            Module._handleError = sinon.spy();
            Module._runController = sinon.spy(function () {
                Filter.run.calledOnce.should.be.true;
                Filter.run.calledWith(filters, request, response, next);

                controller.getFilters.calledOnce.should.be.true;
                controller.getFilters.calledWith(url, route.handler);

                Module._runController.calledOnce.should.be.true;

                Module._handleError.called.should.be.false;

                done();
            });
            Module._handleRequest(url, route, startTime, controller, request, response, next);
        });

        it('should handle error', function (done) {
            var url         = 'some/url',
                filters     = [ 'some filters' ],
                controller  = {
                    getFilters : sinon.spy(function () {
                        return filters;
                    }),
                    _handleError : sinon.spy(function () {
                        return true;
                    })
                },
                route       = {
                    handler : 'some handler'
                },
                request     = {
                    url   : 'some url',
                    route : {
                        path : 'some path'
                    },
                    get   : sinon.spy()
                },
                response    = {},
                next        = {},
                error       = 'some error',
                Filter      = {
                    run : sinon.spy(function () {
                        return Promise.reject(error);
                    })
                },
                Logger         = {
                    info : sinon.spy()
                },
                startTime = Date.now();

            Backhoe.mock(require.resolve('../../../lib/filter'), Filter);
            Backhoe.mock(require.resolve('../../../lib/logger'), Logger);

            Module = require('../../../lib/router');

            Module.options = {controllerTimeout: 180000};
            Module._runController = sinon.spy();

            controller._handleError = sinon.spy(function () {
                Filter.run.calledOnce.should.be.true;
                Filter.run.calledWith(filters, request, response, next);

                controller.getFilters.calledOnce.should.be.true;
                controller.getFilters.calledWith(url, route.handler);

                Module._runController.called.should.be.false;

                done();
            });

            Module._handleRequest(url, route, startTime, controller, request, response, next);
        });

        it('should handle browser id generation', function (done) {
            var url         = 'some/url',
                filters     = [ 'some filters' ],
                controller  = {
                    getFilters : sinon.spy(function () {
                        return filters;
                    })
                },
                route       = {
                    handler : 'some handler'
                },
                req_w_id    = {
                    url                  : 'some url',
                    route                : {
                        path : 'some path'
                    },
                    'Browser-Context-Id' : 'some browser id',
                    get                  : sinon.spy(function(key){
                        return this[key];
                    })
                },
                req_no_id   = {
                    url   : 'some url',
                    route : {
                        path : 'some path'
                    },
                    get   : sinon.spy(function(key){
                        return this[key];
                    })
                },

                response    = {},
                next        = {},
                Filter      = {
                    run : sinon.spy(function () {
                        return Promise.resolve(true);
                    })
                },
                Logger         = {
                    info : sinon.spy()
                },
                startTime = Date.now();

            Backhoe.mock(require.resolve('../../../lib/logger'), Logger);

            Module = require('../../../lib/router');

            Module._runController = sinon.spy();
            Module._handleError = sinon.spy();

            Module._handleRequest(url, route, startTime, controller, req_w_id, response, next);
            req_w_id.get.calledWith('Browser-Context-Id');
            req_w_id.minorjs.browserId.should.eql('some browser id');

            Module._handleRequest(url, route, startTime, controller, req_no_id, response, next);
            req_no_id.get.calledWith('Browser-Context-Id');
            req_no_id.minorjs.browserId.indexOf('browser').should.eql(0);

            done();
        });
    });

    describe('_handleDevelopmentRequest', function () {
        it('should require and instantiate the controller', function () {
            var controller = {
                    path : '../test/data/controllers/foo_controller'
                },
                url        = 'some url',
                route      = {
                    handler : 'some handler'
                };

            Module = require('../../../lib/router');
            var result = Module._handleDevelopmentRequest(controller, url, route);
            result.addFiltersForHandler.calledOnce.should.be.true;
            result.addFiltersForHandler.calledWith(url, route.handler);
            result.path.should.eql(controller.path);
        });
    });

    describe('_incrementRequestCount', function () {
        it('should increment count', function () {
            Module = require('../../../lib/router');
            Module.requestCount.should.eql(0);
            Module._incrementRequestCount();
            Module.requestCount.should.eql(1);
        });

        it('should fire event if over request limit', function (done) {
            var Config = require('../../../lib/config');
            Config.set('max_requests', 1);

            Module = require('../../../lib/router');
            Module._shouldStopWorker = sinon.spy(function () {
                return true;
            });

            process.on('message', function (message) {
                message.should.eql('shutdown');
                Module._shouldStopWorker.calledOnce.should.be.true;
                done();
            });

            Module._incrementRequestCount();
        });
    });

    describe('_loadAllControllers', function () {
        it('should load all controllers', function (done) {
            var app            = {},
                controllerPath = 'foo/bar',
                files          = [
                    'foo'
                ];

            Module = require('../../../lib/router');
            Module._loadController = sinon.spy(function () {
                return Promise.resolve('fooresult');
            });
            Module._loadAllControllers(app, controllerPath, files)
                .then(function (results) {
                    results.should.eql([ 'fooresult' ]);
                    Module._loadController.calledOnce.should.be.true;
                    Module._loadController.calledWith(app, controllerPath, 'foo');
                    done();
                })
                .done();
        });
    });

    describe('_loadController', function () {
        it('should load controller', function () {
            var app            = {},
                controllerPath = '../test/data/controllers',
                file           = 'foo_controller',
                Logger         = {
                    profile : sinon.spy()
                };

            Backhoe.mock(require.resolve('../../../lib/logger'), Logger);

            Module = require('../../../lib/router');
            Module._buildRoutes = sinon.spy();
            Module._loadController(app, controllerPath, file);
            Module._buildRoutes.calledOnce.should.be.true;
            Logger.profile.calledOnce.should.be.true;
        });
    });

    describe('_parseControllerName', function () {
        [
            {
                url      : '',
                path     : '/',
                expected : []
            },
            {
                url      : 'foobar',
                path     : '/foobar',
                expected : [ 'foobar' ]
            },
            {
                url      : 'foobar/1',
                path     : '/foobar/:id',
                expected : [ 'foobar' ]
            },
            {
                url      : 'foobar/1/edit',
                path     : '/foobar/:id/edit',
                expected : [ 'foobar' ]
            },
            {
                url      : 'foobar/1/new',
                path     : '/foobar/:id/new',
                expected : [ 'foobar' ]
            },
            {
                url      : 'foo/bar',
                path     : '/foo/bar',
                expected : [ 'foo', 'bar' ]
            },
            {
                url      : 'foo/bar/1',
                path     : '/foo/bar/:id',
                expected : [ 'foo', 'bar' ]
            },
            {
                url      : 'foo/bar/1/edit',
                path     : '/foo/bar/:id/edit',
                expected : [ 'foo', 'bar' ]
            },
            {
                url      : 'foo/bar/1/new',
                path     : '/foo/bar/:id/new',
                expected : [ 'foo', 'bar' ]
            },
            {
                url      : 'foo/9e107d9d372bb6826bd81d3542a419d6/bar',
                path     : '/foo/:id/bar',
                expected : [ 'foo', 'bar' ]
            },
            {
                url      : 'error',
                path     : '/error',
                expected : [ 'error' ]
            }
        ]
        .forEach(function (testCase) {
            it('should return ' + JSON.stringify(testCase.expected) + ' when the URL is ' + JSON.stringify(testCase.url), function () {
                var request = {
                    route : {
                        path : testCase.path
                    }
                };
                Module = require('../../../lib/router');
                Module._parseControllerName(request).should.eql(testCase.expected);
            });
        });
    });

    describe('_registerRoute', function () {
        it('should register route', function () {
            var request        = {},
                response       = {},
                next           = {},
                app            = {
                    get : sinon.spy(function (url, callback) {
                        callback(request, response, next);
                    })
                },
                route          = {
                    method  : 'get',
                    url     : 'some/url',
                    handler : 'some handler'
                },
                controller     = {
                    addFiltersForHandler : sinon.spy(),
                    emit                 : sinon.spy()
                },
                url            = 'another url',
                Environment    = {
                    isDevelopment : sinon.spy(function () {
                        return true;
                    })
                },
                Logger         = {
                    debug : sinon.spy()
                };

            Backhoe.mock(require.resolve('../../../lib/environment'), Environment);
            Backhoe.mock(require.resolve('../../../lib/logger'), Logger);

            Module = require('../../../lib/router');
            Module._handleDevelopmentRequest = sinon.spy();
            Module._incrementRequestCount = sinon.spy();
            Module._handleRequest = sinon.spy();
            Module._registerRoute(app, controller, url, route);

            controller.addFiltersForHandler.calledOnce.should.be.true;
            controller.addFiltersForHandler.calledWith(url, route.handler);
            controller.emit.calledOnce.should.be.true;
            controller.emit.calledWith('request-started', request);

            Module._incrementRequestCount.calledOnce.should.be.true;

            Module._handleRequest.calledOnce.should.be.true;
            Module._handleRequest.calledWith(url, route, sinon.match.number, controller, request, response, next);

            Logger.debug.calledOnce.should.be.true;
            Environment.isDevelopment.calledOnce.should.be.true;
        });

        it('should register route for development', function () {
            var request        = {},
                response       = {},
                next           = {},
                app            = {
                    get : sinon.spy(function (url, callback) {
                        callback(request, response, next);
                    })
                },
                route          = {
                    method  : 'get',
                    url     : 'some/url',
                    handler : 'some handler'
                },
                controller     = {
                    addFiltersForHandler : sinon.spy(),
                    emit                 : sinon.spy()
                },
                url            = 'another url',
                Environment    = {
                    isDevelopment : sinon.spy(function () {
                        return true;
                    })
                },
                Logger         = {
                    debug : sinon.spy()
                };

            Backhoe.mock(require.resolve('../../../lib/environment'), Environment);
            Backhoe.mock(require.resolve('../../../lib/logger'), Logger);

            Module = require('../../../lib/router');
            Module._handleDevelopmentRequest = sinon.spy();
            Module._incrementRequestCount = sinon.spy();
            Module._handleRequest = sinon.spy();
            Module._registerRoute(app, controller, url, route);

            Module._handleDevelopmentRequest.calledOnce.should.be.true;
            Module._handleDevelopmentRequest.calledWith(controller, url, route);

            Environment.isDevelopment.calledOnce.should.be.true;
        });

        it('should register route for production', function () {
            var request        = {},
                response       = {},
                next           = {},
                app            = {
                    get : sinon.spy(function (url, callback) {
                        callback(request, response, next);
                    })
                },
                route          = {
                    method  : 'get',
                    url     : 'some/url',
                    handler : 'some handler'
                },
                controller     = {
                    addFiltersForHandler : sinon.spy(),
                    emit                 : sinon.spy()
                },
                url            = 'another url',
                Environment    = {
                    isDevelopment : sinon.spy(function () {
                        return false;
                    })
                },
                Logger         = {
                    debug : sinon.spy()
                };

            Backhoe.mock(require.resolve('../../../lib/environment'), Environment);
            Backhoe.mock(require.resolve('../../../lib/logger'), Logger);

            Module = require('../../../lib/router');
            Module._handleDevelopmentRequest = sinon.spy();
            Module._incrementRequestCount = sinon.spy();
            Module._handleRequest = sinon.spy();
            Module._registerRoute(app, controller, url, route);

            Module._handleDevelopmentRequest.called.should.be.false;

            Environment.isDevelopment.calledOnce.should.be.true;
        });
    });

    describe('_runController', function () {
        it('should run controller', function () {
            var controller = {
                    index : sinon.spy(function () {
                        return 'fooresult';
                    })
                },
                route      = {
                    handler : 'index'
                },
                request    = {},
                response   = {},
                next       = {};

            Module = require('../../../lib/router');
            Module._requestFinished = sinon.spy();
            var result = Module._runController(controller, route, request, response, next);

            result.should.eql('fooresult');

            controller.index.calledOnce.should.be.true;
            controller.index.calledWith(controller, request, response, next);
        });
    });

    describe('_shouldStopWorker', function () {
        var Environment;

        beforeEach(function () {
            Environment = {
                isWorker : sinon.spy(function () {
                    return true;
                })
            };

            Backhoe.mock(require.resolve('../../../lib/environment'), Environment);
        });

        it('should return false if max requests not set', function () {
            var Config = require('../../../lib/config');
            Config.configs = {};
            Module = require('../../../lib/router');
            Module.requestCount = 100;
            Module._shouldStopWorker().should.be.false;
        });

        it('should return false if max requests are set and under limit', function () {
            var Config  = require('../../../lib/config');
            Config.set('max_requests', 2);

            Module = require('../../../lib/router');
            Module.requestCount = 1;
            Module._shouldStopWorker().should.be.false;

            Environment.isWorker.calledOnce.should.be.true;
        });

        it('should return true if max requests are set and at limit', function () {
            var Config  = require('../../../lib/config');
            Config.set('max_requests', 2);

            Module = require('../../../lib/router');
            Module.requestCount = 2;
            Module._shouldStopWorker().should.be.true;

            Environment.isWorker.calledOnce.should.be.true;
        });

        it('should return true if max requests are set and over limit', function () {
            var Config  = require('../../../lib/config');
            Config.set('max_requests', 2);

            Module = require('../../../lib/router');
            Module.requestCount = 5;
            Module._shouldStopWorker().should.be.true;

            Environment.isWorker.calledOnce.should.be.true;
        });
    });
});