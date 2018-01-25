/**
 * Copyright 2014 Skytap Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
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
 */

import sinon from 'sinon'
import Promise from 'bluebird'
import Router from '../../../src/router'

describe('src/router.js', () => {
  describe('load', () => {
    it('should discover and load all controllers', () => {
      const app = {}
      const controllers = './test/data/controllers'
      const expected = [
        'foo_controller.js',
        'bar/another_controller.js',
        'bar/baz_controller.js',
      ]

      sinon.stub(Router, 'loadAllControllers')

      Router.load(app, controllers).then(() => {
        Router.loadAllControllers.calledOnce.should.be.true()
        Router.loadAllControllers.calledWith(app, controllers, expected)
        Router.loadAllControllers.restore()
      })
    })
  })

  describe('buildRoutes', () => {
    it('should build the route', () => {
      const app = {}
      const controller = {}
      const url = '/foo/bar'
      const route = 'some route'
      const routes = [route]

      sinon.stub(Router, 'registerRoute')
      sinon.stub(Router, 'getRoutesForUrl').callsFake(() => (
        routes
      ))

      Router.buildRoutes(app, controller, url)

      Router.getRoutesForUrl.calledOnce.should.be.true()
      Router.getRoutesForUrl.calledWith(url)
      Router.registerRoute.calledOnce.should.be.true()
      Router.registerRoute.calledWith(app, controller, url, route)
      Router.registerRoute.restore()
      Router.getRoutesForUrl.restore()
    })
  })

  describe('filterControllers', () => {
    const testCases = [
      {
        file: '',
        expected: false,
      },
      {
        file: 'foo.txt',
        expected: false,
      },
      {
        file: 'foo.js',
        expected: true,
      },
      {
        file: 'foo.coffee',
        expected: true,
      },
    ]

    testCases.forEach((testCase) => {
      it('should correctly determine if file is controller', () => {
        Router.filterControllers(testCase.file).should.eql(testCase.expected)
      })
    })
  })

  describe('fixUrl', () => {
    const testCases = [
      {
        file: '',
        expected: '/',
      },
      {
        file: '/',
        expected: '/',
      },
      {
        file: 'index.js',
        expected: '/',
      },
      {
        file: 'index.coffee',
        expected: '/',
      },
      {
        file: '/foo/bar.js',
        expected: '/foo/bar',
      },
      {
        file: '/foo/bar/index.js',
        expected: '/foo/bar',
      },
    ]

    testCases.forEach((testCase) => {
      it('returns correct URL', () => {
        Router.fixUrl(testCase.file).should.eql(testCase.expected)
      })
    })
  })

  describe('getControllerName', () => {
    const testCases = [
      {
        parts: [],
        expected: '',
      },
      {
        parts: ['foo'],
        expected: 'Foo',
      },
      {
        parts: ['foo', 'bar'],
        expected: 'FooBar',
      },
    ]

    testCases.forEach((testCase) => {
      it(`should return ${JSON.stringify(testCase.expected)} when the URL parts are ${JSON.stringify(testCase.parts)}`, () => {
        Router.getControllerName(testCase.parts).should.eql(testCase.expected)
      })
    })
  })

  describe('getRoutesForUrl', () => {
    it('should return correct routes for root route', () => {
      const url = '/'
      const routes = [
        {
          method: 'get',
          url: '/',
          handler: 'index',
        },
        {
          method: 'get',
          url: '/new',
          handler: 'new',
        },
        {
          method: 'post',
          url: '/',
          handler: 'create',
        },
        {
          method: 'get',
          url: '/:id',
          handler: 'show',
        },
        {
          method: 'get',
          url: '/:id/edit',
          handler: 'edit',
        },
        {
          method: 'put',
          url: '/:id',
          handler: 'update',
        },
        {
          method: 'delete',
          url: '/:id',
          handler: 'destroy',
        },
      ]

      Router.getRoutesForUrl(url).should.eql(routes)
    })

    it('should return correct routes for nested resource', () => {
      const url = '/foo/bar'
      const routes = [
        {
          method: 'get',
          url: '/foo/bar',
          handler: 'index',
        },
        {
          method: 'get',
          url: '/foo/bar/new',
          handler: 'new',
        },
        {
          method: 'post',
          url: '/foo/bar',
          handler: 'create',
        },
        {
          method: 'get',
          url: '/foo/bar/:barId',
          handler: 'show',
        },
        {
          method: 'get',
          url: '/foo/bar/:barId/edit',
          handler: 'edit',
        },
        {
          method: 'put',
          url: '/foo/bar/:barId',
          handler: 'update',
        },
        {
          method: 'delete',
          url: '/foo/bar/:barId',
          handler: 'destroy',
        },
        {
          method: 'get',
          url: '/foo/:fooId/bar',
          handler: 'index',
        },
        {
          method: 'get',
          url: '/foo/:fooId/bar/new',
          handler: 'new',
        },
        {
          method: 'post',
          url: '/foo/:fooId/bar',
          handler: 'create',
        },
        {
          method: 'get',
          url: '/foo/:fooId/bar/:barId',
          handler: 'show',
        },
        {
          method: 'get',
          url: '/foo/:fooId/bar/:barId/edit',
          handler: 'edit',
        },
        {
          method: 'put',
          url: '/foo/:fooId/bar/:barId',
          handler: 'update',
        },
        {
          method: 'delete',
          url: '/foo/:fooId/bar/:barId',
          handler: 'destroy',
        },
      ]

      Router.getRoutesForUrl(url).should.eql(routes)
    })
  })

  describe('handleRequest', () => {
    it('should run controller', (done) => {
      const url = 'some/url'
      const filters = ['some filters']
      const controller = {
        getFilters: sinon.spy(() => (
          filters
        )),
        handleError: sinon.spy(),
      }
      const route = {
        handler: 'some handler',
      }
      const request = {
        url: 'some url',
        route: {
          path: 'some path',
        },
        get: sinon.spy(),
      }

      const response = {}
      const next = {}
      const Filter = {
        run: sinon.spy(() => (
          Promise.resolve(true)
        )),
      }
      const Logger = {
        info: sinon.spy(),
      }
      const startTime = Date.now()

      Router.__Rewire__('Filter', Filter)
      Router.__Rewire__('Logger', Logger)

      Router.options = { controllerTimeout: 180000 }

      sinon.stub(Router, 'runController').callsFake(() => {
        Filter.run.calledOnce.should.be.true()
        Filter.run.calledWith(filters, request, response, next)

        controller.getFilters.calledOnce.should.be.true()
        controller.getFilters.calledWith(url, route.handler)

        Router.runController.calledOnce.should.be.true()

        controller.handleError.called.should.be.false()

        Router.runController.restore()

        done()
      })
      Router.handleRequest(url, route, startTime, controller, request, response, next)
    })

    it('should handle error', (done) => {
      const route = {
        handler: 'some handler',
      }
      const url = 'some/url'
      const filters = ['some filters']
      const request = {
        url: 'some url',
        route: {
          path: 'some path',
        },
        get: sinon.spy(),
      }
      const response = {}
      const next = {}
      const error = 'some error'
      const Filter = {
        run: sinon.spy(() => (
          Promise.reject(error)
        )),
      }
      const getFilters = sinon.spy(() => (
        filters
      ))
      const handleError = sinon.spy(() => {
        Filter.run.calledOnce.should.be.true()
        Filter.run.calledWith(filters, request, response, next)

        getFilters.calledOnce.should.be.true()
        getFilters.calledWith(url, route.handler)

        Router.runController.called.should.be.false()

        Router.runController.restore()

        done()
      })
      const controller = {
        getFilters,
        handleError,
      }
      const Logger = {
        info: sinon.spy(),
      }
      const startTime = Date.now()

      Router.__Rewire__('Filter', Filter)
      Router.__Rewire__('Logger', Logger)

      Router.options = { controllerTimeout: 180000 }
      sinon.stub(Router, 'runController')

      Router.handleRequest(url, route, startTime, controller, request, response, next)
    })

    it('should handle browser id generation', () => {
      const url = 'some/url'
      const filters = ['some filters']
      const controller = {
        getFilters: sinon.spy(() => (
          filters
        )),
        handleError: sinon.spy(),
      }
      const route = {
        handler: 'some handler',
      }
      const requestWithId = {
        url: 'some url',
        route: {
          path: 'some path',
        },
        'Browser-Context-Id': 'some browser id',
        get: sinon.spy((key) => {
          key.should.equal('Browser-Context-Id')
          return 'some browser id'
        }),
      }
      const requestNoId = {
        url: 'some url',
        route: {
          path: 'some path',
        },
        get: sinon.spy((key) => {
          key.should.equal('Browser-Context-Id')
          return undefined
        }),
      }

      const response = {}
      const next = {}
      const Logger = {
        info: sinon.spy(),
      }
      const startTime = Date.now()

      Router.__Rewire__('Logger', Logger)

      sinon.stub(Router, 'runController')
      Router.options = { controllerTimeout: 180000 }

      Router.handleRequest(url, route, startTime, controller, requestWithId, response, next)
      requestWithId.get.calledWith('Browser-Context-Id')
      requestWithId.minorjs.browserId.should.eql('some browser id')

      Router.handleRequest(url, route, startTime, controller, requestNoId, response, next)
      requestNoId.get.calledWith('Browser-Context-Id')
      requestNoId.minorjs.browserId.indexOf('browser').should.eql(0)

      Router.runController.restore()
    })
  })

  describe('handleDevelopmentRequest', () => {
    it('should require and instantiate the controller', () => {
      const controller = {
        path: '../test/data/controllers/foo_controller',
      }
      const url = 'some url'
      const route = {
        handler: 'some handler',
      }

      const result = Router.handleDevelopmentRequest(controller, url, route)
      result.addFiltersForHandler.calledOnce.should.be.true()
      result.addFiltersForHandler.calledWith(url, route.handler)
      result.path.should.eql(controller.path)
    })
  })

  describe('incrementRequestCount', () => {
    let Logger

    beforeEach(() => {
      Logger = {
        info: sinon.spy(),
      }

      Router.__Rewire__('Logger', Logger)
    })

    it('should increment count', () => {
      Router.requestCount.should.eql(0)
      Router.incrementRequestCount()
      Router.requestCount.should.eql(1)
    })

    it('should fire event if over request limit', (done) => {
      const Config = {
        get() {
          return 1
        },
      }

      Router.__Rewire__('Config', Config)
      sinon.stub(Router, 'shouldStopWorker').callsFake(() => (
        true
      ))

      process.on('message', (message) => {
        message.should.eql('shutdown')
        Router.shouldStopWorker.calledOnce.should.be.true()
        Router.shouldStopWorker.restore()
        done()
      })

      Router.incrementRequestCount()
    })
  })

  describe('loadAllControllers', () => {
    it('should load all controllers', () => {
      const app = {}
      const controllerPath = 'foo/bar'
      const files = [
        'foo',
      ]

      sinon.stub(Router, 'loadController').callsFake(() => (
        Promise.resolve('fooresult')
      ))
      return Router.loadAllControllers(app, controllerPath, files).then((results) => {
        results.should.eql(['fooresult'])
        Router.loadController.calledOnce.should.be.true()
        Router.loadController.calledWith(app, controllerPath, 'foo')
        Router.loadController.restore()
      })
    })
  })

  describe('loadController', () => {
    it('should load controller', () => {
      const app = {}
      const controllerPath = '../test/data/controllers'
      const file = 'foo_controller'
      const Logger = {
        profile: sinon.spy(),
      }

      Router.__Rewire__('Logger', Logger)
      sinon.stub(Router, 'buildRoutes')
      Router.loadController(app, controllerPath, file)
      Router.buildRoutes.calledOnce.should.be.true()
      Logger.profile.calledOnce.should.be.true()
      Router.buildRoutes.restore()
    })
  })

  describe('parseControllerName', () => {
    const testCases = [
      {
        url: '',
        path: '/',
        expected: [],
      },
      {
        url: 'foobar',
        path: '/foobar',
        expected: ['foobar'],
      },
      {
        url: 'foobar/1',
        path: '/foobar/:id',
        expected: ['foobar'],
      },
      {
        url: 'foobar/1/edit',
        path: '/foobar/:id/edit',
        expected: ['foobar'],
      },
      {
        url: 'foobar/1/new',
        path: '/foobar/:id/new',
        expected: ['foobar'],
      },
      {
        url: 'foo/bar',
        path: '/foo/bar',
        expected: ['foo', 'bar'],
      },
      {
        url: 'foo/bar/1',
        path: '/foo/bar/:id',
        expected: ['foo', 'bar'],
      },
      {
        url: 'foo/bar/1/edit',
        path: '/foo/bar/:id/edit',
        expected: ['foo', 'bar'],
      },
      {
        url: 'foo/bar/1/new',
        path: '/foo/bar/:id/new',
        expected: ['foo', 'bar'],
      },
      {
        url: 'foo/9e107d9d372bb6826bd81d3542a419d6/bar',
        path: '/foo/:id/bar',
        expected: ['foo', 'bar'],
      },
      {
        url: 'error',
        path: '/error',
        expected: ['error'],
      },
    ]

    testCases.forEach((testCase) => {
      it(`should return ${JSON.stringify(testCase.expected)} when the URL is ${JSON.stringify(testCase.url)}`, () => {
        const request = {
          route: {
            path: testCase.path,
          },
        }
        Router.parseControllerName(request).should.eql(testCase.expected)
      })
    })
  })

  describe('registerRoute', () => {
    it('should register route', () => {
      const request = {}
      const response = {}
      const next = {}
      const app = {
        get: sinon.spy((url, callback) => {
          callback(request, response, next)
        }),
      }
      const route = {
        method: 'get',
        url: 'some/url',
        handler: 'some handler',
      }
      const controller = {
        addFiltersForHandler: sinon.spy(),
        emit: sinon.spy(),
      }
      const url = 'another url'
      const Environment = {
        isDevelopment: sinon.spy(() => (
          true
        )),
      }
      const Logger = {
        debug: sinon.spy(),
      }

      Router.__Rewire__('Environment', Environment)
      Router.__Rewire__('Logger', Logger)

      sinon.stub(Router, 'handleDevelopmentRequest').callsFake(() => (
        controller
      ))
      sinon.stub(Router, 'incrementRequestCount')
      sinon.stub(Router, 'handleRequest')

      Router.registerRoute(app, controller, url, route)

      controller.addFiltersForHandler.calledOnce.should.be.true()
      controller.addFiltersForHandler.calledWith(url, route.handler)
      controller.emit.calledOnce.should.be.true()
      controller.emit.calledWith('request-started', request)

      Router.incrementRequestCount.calledOnce.should.be.true()

      Router.handleRequest.calledOnce.should.be.true()
      Router.handleRequest.calledWith(
        url,
        route,
        sinon.match.number,
        controller,
        request,
        response,
        next,
      )

      Logger.debug.calledOnce.should.be.true()
      Environment.isDevelopment.calledOnce.should.be.true()

      Router.handleDevelopmentRequest.restore()
      Router.incrementRequestCount.restore()
      Router.handleRequest.restore()
    })

    it('should register route for development', () => {
      const request = {}
      const response = {}
      const next = {}
      const app = {
        get: sinon.spy((url, callback) => {
          callback(request, response, next)
        }),
      }
      const route = {
        method: 'get',
        url: 'some/url',
        handler: 'some handler',
      }
      const controller = {
        addFiltersForHandler: sinon.spy(),
        emit: sinon.spy(),
      }
      const url = 'another url'
      const Environment = {
        isDevelopment: sinon.spy(() => (
          true
        )),
      }
      const Logger = {
        debug: sinon.spy(),
      }

      Router.__Rewire__('Environment', Environment)
      Router.__Rewire__('Logger', Logger)

      sinon.stub(Router, 'handleDevelopmentRequest').callsFake(() => (
        controller
      ))
      sinon.stub(Router, 'incrementRequestCount')
      sinon.stub(Router, 'handleRequest')

      Router.registerRoute(app, controller, url, route)

      Router.handleDevelopmentRequest.calledOnce.should.be.true()
      Router.handleDevelopmentRequest.calledWith(controller, url, route)

      Environment.isDevelopment.calledOnce.should.be.true()

      Router.handleDevelopmentRequest.restore()
      Router.incrementRequestCount.restore()
      Router.handleRequest.restore()
    })

    it('should register route for production', () => {
      const request = {}
      const response = {}
      const next = {}
      const app = {
        get: sinon.spy((url, callback) => {
          callback(request, response, next)
        }),
      }
      const route = {
        method: 'get',
        url: 'some/url',
        handler: 'some handler',
      }
      const controller = {
        addFiltersForHandler: sinon.spy(),
        emit: sinon.spy(),
      }
      const url = 'another url'
      const Environment = {
        isDevelopment: sinon.spy(() => (
          false
        )),
      }
      const Logger = {
        debug: sinon.spy(),
      }

      Router.__Rewire__('Environment', Environment)
      Router.__Rewire__('Logger', Logger)

      sinon.stub(Router, 'handleDevelopmentRequest')
      sinon.stub(Router, 'incrementRequestCount')
      sinon.stub(Router, 'handleRequest')

      Router.registerRoute(app, controller, url, route)

      Router.handleDevelopmentRequest.called.should.be.false()

      Environment.isDevelopment.calledOnce.should.be.true()

      Router.handleDevelopmentRequest.restore()
      Router.incrementRequestCount.restore()
      Router.handleRequest.restore()
    })
  })

  describe('runController', () => {
    it('should run controller', () => {
      const controller = {
        index: sinon.spy(() => (
          'fooresult'
        )),
      }
      const route = {
        handler: 'index',
      }
      const request = {}
      const response = {}
      const next = {}

      const result = Router.runController(controller, route, request, response, next)

      result.should.eql('fooresult')

      controller.index.calledOnce.should.be.true()
      controller.index.calledWith(controller, request, response, next)
    })
  })

  describe('shouldStopWorker', () => {
    let Environment

    beforeEach(() => {
      Environment = {
        isWorker: sinon.spy(() => (
          true
        )),
      }
      const Logger = {
        info: sinon.spy(),
      }

      Router.__Rewire__('Environment', Environment)
      Router.__Rewire__('Logger', Logger)
    })

    it('should return false if max requests not set', () => {
      const Config = {
        get() {
          return undefined
        },
      }
      Router.__Rewire__('Config', Config)
      Router.requestCount = 100
      Router.shouldStopWorker().should.be.false()
    })

    it('should return false if max requests are set and under limit', () => {
      Router.maxRequests = 2
      Router.requestCount = 1
      Router.shouldStopWorker().should.be.false()

      Environment.isWorker.calledOnce.should.be.true()
    })

    it('should return true if max requests are set and at limit', () => {
      Router.maxRequests = 2
      Router.requestCount = 2
      Router.shouldStopWorker().should.be.true()

      Environment.isWorker.calledOnce.should.be.true()
    })

    it('should return true if max requests are set and over limit', () => {
      Router.maxRequests = 2
      Router.requestCount = 5
      Router.shouldStopWorker().should.be.true()

      Environment.isWorker.calledOnce.should.be.true()
    })

    it('should set max requests limit when undefined', () => {
      const Config = {
        get() {
          return 1000
        },
      }
      Router.__Rewire__('Config', Config)
      delete Router.maxRequests
      Router.shouldStopWorker().should.be.false()
      Router.maxRequests.should.be.a.Number()
    })
  })
})
