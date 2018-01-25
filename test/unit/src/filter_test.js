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

import path from 'path'
import should from 'should'
import sinon from 'sinon'
import Filter from '../../../src/filter'

describe('src/filter.js', () => {
  describe('getFilters', () => {
    it('returns all filters', () => {
      const filtersPath = './test/data/filters/'
      const expected = [
        'foo',
        'bar',
      ]

      Filter.filters = expected
      Filter.getFilters(filtersPath).should.eql(expected)
    })
  })

  describe('load', () => {
    it('should load all filters', () => {
      const Logger = {
        profile: sinon.spy(),
      }
      const filtersPath = path.join(
        __dirname,
        '../../../test/data/filters',
      )
      const expected = {
        bar_filter: {
          name: 'bar_filter',
        },
        foo_filter: {
          name: 'foo_filter',
        },
      }

      Filter.__Rewire__('Logger', Logger)

      return Filter.load(filtersPath).then(() => {
        Filter.filters.bar_filter.name.should.eql(expected.bar_filter.name)
        Filter.filters.foo_filter.name.should.eql(expected.foo_filter.name)
        Logger.profile.called.should.be.true()
      })
    })
  })

  describe('run', () => {
    it('should not run if no filters loaded', () => {
      const filters = [
        'bar_filter',
        'foo_filter',
      ]
      const request = {}
      const response = {}
      const next = sinon.spy()
      const Logger = {
        debug: sinon.spy(),
        profile: sinon.spy(),
      }

      Filter.__Rewire__('Logger', Logger)
      Filter.filters = {}

      return Filter.run(filters, request, response, next)
    })

    it('should run all filters', () => {
      const filters = [
        'bar_filter',
        'foo_filter',
      ]
      const request = {}
      const response = {}
      const next = sinon.spy()
      const Logger = {
        debug: sinon.spy(),
      }

      Filter.__Rewire__('Logger', Logger)
      Filter.filters = {
        bar_filter: {
          process: sinon.spy(() => (
            true
          )),
        },
        foo_filter: {
          process: sinon.spy(() => (
            true
          )),
        },
      }
      return Filter.run(filters, request, response, next).then((results) => {
        results.should.be.true()
        Filter.filters.bar_filter.process.calledOnce.should.be.true()
        Filter.filters.bar_filter.process.calledWith(request, response, next)
        Filter.filters.foo_filter.process.calledOnce.should.be.true()
        Filter.filters.foo_filter.process.calledWith(request, response, next)
      })
    })

    it('should run subset of available filters', () => {
      const filters = [
        'foo_filter',
      ]
      const request = {}
      const response = {}
      const next = sinon.spy()
      const Logger = {
        debug: sinon.spy(),
      }

      Filter.__Rewire__('Logger', Logger)
      Filter.filters = {
        bar_filter: {
          process: sinon.spy(),
        },
        foo_filter: {
          process: sinon.spy(() => (
            true
          )),
        },
      }
      return Filter.run(filters, request, response, next).then((results) => {
        results.should.be.true()
        Filter.filters.bar_filter.process.calledOnce.should.be.false()
        Filter.filters.foo_filter.process.calledOnce.should.be.true()
        Filter.filters.foo_filter.process.calledWith(request, response, next)
      })
    })

    it('should run filter that fails. does not run remaining filters', () => {
      const filters = [
        'bar_filter',
        'foo_filter',
      ]
      const request = {}
      const response = {}
      const next = sinon.spy()
      const Logger = {
        debug: sinon.spy(),
      }

      Filter.__Rewire__('Logger', Logger)
      Filter.filters = {
        bar_filter: {
          process: sinon.spy(() => {
            throw new Error('failing filter')
          }),
        },
        foo_filter: {
          process: sinon.spy(),
        },
      }
      return Filter.run(filters, request, response, next).then(() => {
        should.fail('should have rejected the promise')
      }).catch((error) => {
        error.message.should.eql('failing filter')
        Filter.filters.bar_filter.process.calledOnce.should.be.true()
        Filter.filters.bar_filter.process.calledWith(request, response, next)
        Filter.filters.foo_filter.process.calledOnce.should.be.false()
      })
    })
  })

  describe('runFilter', () => {
    it('should run correct filter', () => {
      const filter = 'foo_filter'
      const request = {}
      const response = {}
      const next = sinon.spy()
      const expected = 'some results'
      const Logger = {
        debug: sinon.spy(),
      }

      Filter.__Rewire__('Logger', Logger)
      Filter.filters = {
        foo_filter: {
          process: sinon.spy(() => (
            expected
          )),
        },
        bar_filter: {
          process: sinon.spy(() => (
            expected
          )),
        },
      }
      const result = Filter.runFilter(filter, request, response, next)
      result.should.be.type('function')
      return result().then((value) => {
        value.should.eql(expected)
        Filter.filters.bar_filter.process.calledOnce.should.be.false()
        Filter.filters.foo_filter.process.calledOnce.should.be.true()
        Filter.filters.foo_filter.process.calledWith(request, response, next)
      })
    })

    it('should run filter and return failed promise on exception', () => {
      const filter = 'foo_filter'
      const request = {}
      const response = {}
      const next = sinon.spy()
      const Logger = {
        debug: sinon.spy(),
      }

      Filter.__Rewire__('Logger', Logger)
      Filter.filters = {
        foo_filter: {
          process: sinon.spy(() => {
            throw new Error('some error')
          }),
        },
      }
      const result = Filter.runFilter(filter, request, response, next)
      result.should.be.type('function')
      return result().catch((error) => {
        error.message.should.eql('some error')
        Filter.filters.foo_filter.process.calledOnce.should.be.true()
      })
    })
  })
})
