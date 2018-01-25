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
import Logger from '../../../src/logger'

describe('src/logger.js', () => {
  describe('initialize', () => {
    it('loads a subset of loggers', () => {
      const options = {
        basePath: '../test/data/',
        loggers: [
          'foo',
        ],
      }

      Logger.initialize(options)
      Logger.options.should.eql(options)
      Logger.loggers.length.should.eql(1)
      Logger.loggers[0].name.should.eql('foo_logger')
    })

    it('loads all loggers', () => {
      const options = {
        basePath: '../test/data/',
        loggers: [
          'bar',
          'foo',
        ],
      }

      Logger.initialize(options)
      Logger.options.should.eql(options)
      Logger.loggers.length.should.eql(2)
      Logger.loggers[0].name.should.eql('bar_logger')
      Logger.loggers[1].name.should.eql('foo_logger')
    })
  })

  describe('profile', () => {
    it('logs performance data', () => {
      const name = 'some name'
      const start = 12345

      sinon.stub(Logger, 'log').callsFake((level, message) => {
        level.should.eql('debug')
        message.should.match(/Performance: some name took [0-9]*ms/)
      })
      Logger.profile(name, start)

      Logger.log.calledOnce.should.be.true()

      Logger.log.restore()
    })
  })

  describe('log', () => {
    it('use all loggers', () => {
      const loggers = [
        {
          log: sinon.spy(),
        },
        {
          log: sinon.spy(),
        },
      ]
      const level = 'debug'
      const message = 'some log message'

      Logger.loggers = loggers
      Logger.log(message)

      Logger.loggers[0].log.calledOnce.should.be.true()
      Logger.loggers[0].log.calledWith(level, message)
      Logger.loggers[1].log.calledOnce.should.be.true()
      Logger.loggers[1].log.calledWith(level, message)
    })
  })
})
