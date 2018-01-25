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
import Controller from '../../../src/controller'

describe('src/controller.js', () => {
  const testCases = [
    'index',
    'new',
    'create',
    'show',
    'edit',
    'update',
    'destroy',
  ]

  testCases.forEach((action) => {
    describe(action, () => {
      it('default action should call Express next callback', () => {
        const request = {}
        const response = {}
        const next = sinon.spy()

        const module = new Controller()
        module[action](request, response, next)

        next.calledOnce.should.be.true()
      })
    })
  })

  describe('addFiltersForHandler', () => {
    it('no before filters', () => {
      const url = 'someurl'
      const handler = 'somehandler'

      const module = new Controller()
      module.addFiltersForHandler(url, handler)

      module.filtersByRoute.should.containDeep({
        someurl: {
          somehandler: [],
        },
      })
    })

    it('no matching before filters', () => {
      const url = 'someurl'
      const handler = 'somehandler'

      const module = new Controller()
      module.before = {
        index: ['nomatch'],
      }

      module.addFiltersForHandler(url, handler)

      module.filtersByRoute.should.containDeep({
        someurl: {
          somehandler: [],
        },
      })
    })

    it('adds only matching before filter', () => {
      const url = 'someurl'
      const handler = 'somehandler'

      const module = new Controller()
      module.before = {
        index: ['somehandler', 'otherfilter'],
      }

      module.addFiltersForHandler(url, handler)

      module.filtersByRoute.should.containDeep({
        someurl: {
          somehandler: [
            'index',
          ],
        },
      })
    })

    it('adds matching before filter when action is all', () => {
      const url = 'someurl'
      const handler = 'somehandler'

      const module = new Controller()
      module.before = {
        index: ['all'],
      }

      module.addFiltersForHandler(url, handler)

      module.filtersByRoute.should.containDeep({
        someurl: {
          somehandler: [
            'index',
          ],
        },
      })
    })
  })

  describe('getFilters', () => {
    it('returns filters', () => {
      const url = 'someurl'
      const handler = 'somehandler'
      const filters = ['index']

      const module = new Controller()
      module.filtersByRoute[url] = {}
      module.filtersByRoute[url][handler] = filters
      module.getFilters(url, handler).should.eql(filters)
    })
  })

  describe('getFullError', () => {
    it('returns correct error message', () => {
      const request = {}
      const response = {}
      const error = {
        stack: 'some stack',
      }
      const incidentId = 'ABC123'

      const module = new Controller()
      module.getFullError(request, response, error, incidentId)
        .should.eql(`Incident ${incidentId} - ${error.stack}`)
    })
  })

  describe('getUserError', () => {
    it('returns correct error message', () => {
      const request = {}
      const response = {}
      const error = {}
      const incidentId = 'ABC123'

      const module = new Controller()
      module.getUserError(request, response, error, incidentId)
        .should.eql(`An error occurred. Please try again. (${incidentId})`)
    })
  })

  describe('handleError', () => {
    it('should get error information', () => {
      const incidentId = 'ABC123'
      const request = {
        xhr: true,
      }
      const response = {}
      const error = 'some error'
      const Logger = {
        error: sinon.spy(),
      }
      const Identifier = {
        generate: sinon.spy(() => (
          incidentId
        )),
      }

      Controller.__Rewire__('Identifier', Identifier)
      Controller.__Rewire__('Logger', Logger)

      const module = new Controller()
      module.handleXhrError = sinon.spy()
      module.handleNormalError = sinon.spy()
      module.getFullError = sinon.spy()
      module.handleError(request, response, error)

      Identifier.generate.calledOnce.should.be.true()
      module.getFullError.calledOnce.should.be.true()
      module.getFullError.calledWith(request, response, error, incidentId)

      Logger.error.calledOnce.should.be.true()
    })

    it('should call XHR handler', () => {
      const incidentId = 'ABC123'
      const request = {
        xhr: true,
      }
      const response = {}
      const error = 'some error'
      const Logger = {
        error: sinon.spy(),
      }
      const Identifier = {
        generate: sinon.spy(() => (
          incidentId
        )),
      }

      Controller.__Rewire__('Identifier', Identifier)
      Controller.__Rewire__('Logger', Logger)

      const module = new Controller()
      module.handleXhrError = sinon.spy()
      module.handleNormalError = sinon.spy()
      module.getFullError = sinon.spy()
      module.handleError(request, response, error)

      module.handleXhrError.calledOnce.should.be.true()
      module.handleXhrError.calledWith(request, response, error)
      module.handleNormalError.called.should.be.false()

      Logger.error.calledOnce.should.be.true()
    })

    it('should call non-XHR handler', () => {
      const incidentId = 'ABC123'
      const fullError = 'some full error'
      const request = {
        xhr: false,
      }
      const response = {}
      const error = 'some error'
      const Logger = {
        error: sinon.spy(),
      }
      const Identifier = {
        generate: sinon.spy(() => (
          incidentId
        )),
      }

      Controller.__Rewire__('Identifier', Identifier)
      Controller.__Rewire__('Logger', Logger)

      const module = new Controller()
      module.handleXhrError = sinon.spy()
      module.handleNormalError = sinon.spy()
      module.getFullError = sinon.spy(() => (
        fullError
      ))
      module.handleError(request, response, error)

      module.handleNormalError.calledOnce.should.be.true()
      module.handleNormalError.calledWith(request, response, error, incidentId, fullError)
      module.handleXhrError.called.should.be.false()

      Logger.error.calledOnce.should.be.true()
    })
  })

  describe('handleXhrError', () => {
    it('should render error for development', () => {
      const request = {}
      const statusResult = {
        send: sinon.spy(),
      }
      const response = {
        status: sinon.spy(() => (
          statusResult
        )),
      }
      const error = {
        stack: 'some stack trace',
      }

      const module = new Controller()
      module.handleXhrError(request, response, error)

      response.status.calledOnce.should.be.true()
      response.status.calledWith(500).should.be.true()

      statusResult.send.calledOnce.should.be.true()
      statusResult.send.calledWith({
        success: false,
        error,
      })
    })
  })

  describe('handleNormalError', () => {
    it('should render error for development', () => {
      const incidentId = 'ABC123'
      const fullError = 'some full error'
      const userError = 'some user error'
      const request = {}
      const response = {
        status: sinon.spy(),
      }
      const error = {
        stack: 'some stack trace',
      }
      const Environment = {
        isDevelopment: sinon.spy(() => (
          true
        )),
      }

      Controller.__Rewire__('Environment', Environment)

      const module = new Controller()
      module.getUserError = sinon.spy(() => (
        userError
      ))
      module.render = sinon.spy()
      module.handleNormalError(request, response, error, incidentId, fullError)

      response.status.calledOnce.should.be.true()
      response.status.calledWith(500)

      module.getUserError.calledOnce.should.be.true()
      module.getUserError.calledWith(request, response, error, incidentId)

      module.render.calledOnce.should.be.true()
      module.render.calledWith(request, response, 'error', {
        error: userError,
        fullError: error.stack,
      })
    })

    it('should render error for production', () => {
      const incidentId = 'ABC123'
      const fullError = 'some full error'
      const userError = 'some user error'
      const request = {}
      const response = {
        status: sinon.spy(),
      }
      const error = {
        stack: 'some stack trace',
      }
      const Environment = {
        isDevelopment: sinon.spy(() => (
          false
        )),
      }

      Controller.__Rewire__('Environment', Environment)

      const module = new Controller()
      module.getUserError = sinon.spy(() => (
        userError
      ))
      module.render = sinon.spy()
      module.handleNormalError(request, response, error, incidentId, fullError)

      response.status.calledOnce.should.be.true()
      response.status.calledWith(500)

      module.getUserError.calledOnce.should.be.true()
      module.getUserError.calledWith(request, response, error, incidentId)

      module.render.calledOnce.should.be.true()
      module.render.calledWith(request, response, 'error', {
        error: userError,
        fullError: null,
      })
    })
  })

  describe('requestFinished', () => {
    it('should emit event', () => {
      const request = {
        minorjs: {
          page: 'some/page',
          action: 'index',
          start: 12345,
        },
        method: 'get',
      }

      const module = new Controller()
      module.emit = sinon.stub()

      module.requestFinished(request)

      module.emit.calledOnce.should.be.true()
      module.emit.calledWith('request-started', request, sinon.match.object)
    })
  })
})
