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
import Environment from '../../../src/environment'

describe('src/environment.js', () => {
  describe('getBasePath', () => {
    it('returns correct path', () => {
      const path = 'some path'
      Environment.basePath = path
      Environment.getBasePath().should.eql(path)
    })
  })

  describe('getEnvironment', () => {
    it('returns correct environment', () => {
      const environment = 'some env'
      Environment.environment = environment
      Environment.getEnvironment().should.eql(environment)
    })
  })

  describe('getInstance', () => {
    it('returns correct instance', () => {
      const instance = 42
      Environment.instance = instance
      Environment.getInstance().should.eql(instance)
    })
  })

  describe('getContextId', () => {
    it('returns correct context id', () => {
      const contextId = '5cd03c6306834f81a5ee2fd3a18d254e.10061'
      Environment.contextId = contextId
      Environment.getContextId().should.eql(contextId)
    })
  })

  describe('getContextName', () => {
    it('returns correct specified context name', () => {
      const contextName = 'mycontext'
      Environment.contextName = contextName
      Environment.getContextName().should.eql(contextName)
    })
  })

  describe('initialize', () => {
    it('returns correct instance', () => {
      const configs = { foo: 'bar' }
      const Config = {
        load: sinon.spy(),
      }

      Environment.__Rewire__('Config', Config)

      sinon.stub(Environment, 'loadConfigs').callsFake(() => (
        configs
      ))
      sinon.stub(Environment, 'initLogger')

      Environment.initialize({
        environment: 'development',
        basePath: 'somebasepath',
        instance: 42,
        loggers: ['some loggers'],
      })

      Environment.environment.should.eql('development')
      Environment.basePath.should.eql('somebasepath')
      Environment.instance.should.eql(42)
      Environment.loggers.should.eql(['some loggers'])
      Environment.contextName.should.eql('minorjs')

      Environment.loadConfigs.calledOnce.should.be.true()
      Environment.initLogger.calledOnce.should.be.true()

      Config.load.calledOnce.should.be.true()
      Config.load.calledWith('development', configs)

      Environment.__ResetDependency__('Config')
      Environment.loadConfigs.restore()
      Environment.initLogger.restore()
    })
  })

  describe('isDevelopment', () => {
    it('returns false', () => {
      Environment.environment = 'production'
      Environment.isDevelopment().should.be.false()
    })

    it('returns true', () => {
      Environment.environment = 'development'
      Environment.isDevelopment().should.be.true()
    })
  })

  describe('isProduction', () => {
    it('returns false', () => {
      Environment.environment = 'development'
      Environment.isProduction().should.be.false()
    })

    it('returns true', () => {
      Environment.environment = 'production'
      Environment.isProduction().should.be.true()
    })
  })

  describe('getConfigFilePath', () => {
    it('returns correct path', () => {
      Environment.basePath = 'foo/bar'
      Environment.getConfigFilePath().should.eql('foo/bar/config/app.json')
    })
  })

  describe('initLogger', () => {
    it('returns correct instance', () => {
      const Logger = {
        initialize: sinon.spy(),
      }

      Environment.__Rewire__('Logger', Logger)

      Environment.environment = 'development'
      Environment.basePath = 'foo/bar'
      Environment.instance = 42
      Environment.loggers = ['foobar']

      Environment.initLogger()

      Logger.initialize.calledOnce.should.be.true()
      Logger.initialize.calledWith({
        isProduction: false,
        basePath: 'foo/bar',
        instance: 42,
        loggers: ['foobar'],
      })
    })
  })

  describe('loadConfigs', () => {
    it('returns parsed config file', () => {
      Environment.basePath = 'test/data'
      Environment.loadConfigs().should.eql({
        foo: 'bar',
      })
    })
  })
})
