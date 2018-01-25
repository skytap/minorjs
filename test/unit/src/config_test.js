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

import Module from '../../../src/config'

describe('src/config.js', function () {
  beforeEach(function () {
    Module.configs = {}
  })

  describe('get', function () {
    it('should throw exception when no path supplied', function () {
      (function () {
        Module.get()
      }).should.throw('You must supply a config path')
    })

    it('should throw exception when no config value exists', function () {
      (function () {
        Module.get('does.not.exist')
      }).should.throw('No config value found for: does.not.exist')
    })

    it('should return correct value for key', function () {
      const expected = `some config value${Math.random()}`

      Module.configs = {
        somenewkey: expected,
      }

      Module.get('somenewkey').should.eql(expected)
    })

    it('should return correct value for nested key', function () {
      const expected = `some config value${Math.random()}`

      Module.configs = {
        some: {
          config: {
            key: expected,
          },
        },
      }

      Module.get('some.config.key').should.eql(expected)
    })
  })

  describe('getAll', function () {
    it('should return all config values', function () {
      const configs = { some: 'configs' }
      Module.configs = configs
      Module.getAll().should.eql(configs)
    })
  })

  describe('load', function () {
    it('empty config object', function () {
      const environment = 'development'
      const configs = {}
      const expected = {}
      Module.load(environment, configs)
      Module.configs.should.eql(expected)
    })

    it('config with literal string value', function () {
      const environment = 'development'
      const configs = {
        foo: 'bar',
      }
      const expected = {
        foo: 'bar',
      }
      Module.load(environment, configs)
      Module.configs.should.eql(expected)
    })

    it('config with literal integer value', function () {
      const environment = 'development'
      const configs = {
        foo: 42,
      }
      const expected = {
        foo: 42,
      }
      Module.load(environment, configs)
      Module.configs.should.eql(expected)
    })

    it('config with literal float value', function () {
      const environment = 'development'
      const configs = {
        foo: 4.2,
      }
      const expected = {
        foo: 4.2,
      }
      Module.load(environment, configs)
      Module.configs.should.eql(expected)
    })

    it('config with default value', function () {
      const environment = 'development'
      const configs = {
        foo: {
          default: 'bar',
        },
      }
      const expected = {
        foo: 'bar',
      }
      Module.load(environment, configs)
      Module.configs.should.eql(expected)
    })

    it('config with nested default value', function () {
      const environment = 'development'
      const configs = {
        foo: {
          bar: {
            default: 'baz',
          },
        },
      }
      const expected = {
        foo: {
          bar: 'baz',
        },
      }
      Module.load(environment, configs)
      Module.configs.should.eql(expected)
    })

    it('config with environment values; no match; uses default', function () {
      const environment = 'development'
      const configs = {
        foo: {
          production: 'prod',
          staging: 'staging',
          default: 'bar',
        },
      }
      const expected = {
        foo: 'bar',
      }
      Module.load(environment, configs)
      Module.configs.should.eql(expected)
    })

    it('config with environment value; uses environment config value', function () {
      const environment = 'development'
      const configs = {
        foo: {
          development: 'prod',
          default: 'bar',
        },
      }
      const expected = {
        foo: 'prod',
      }
      Module.load(environment, configs)
      Module.configs.should.eql(expected)
    })
  })

  describe('set', function () {
    it('should set correct value for key', function () {
      const expected = `some config value${Math.random()}`

      Module.set('somenewkey', expected)

      Module.configs.should.eql({ somenewkey: expected })
    })

    it('should set correct value for nested key', function () {
      const expected = `some config value${Math.random()}`

      Module.set('some.config.key', expected)

      Module.configs.should.eql({
        some: {
          config: {
            key: expected,
          },
        },
      })
    })
  })
})
