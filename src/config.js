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

import 'babel-polyfill'
import extend from 'extend'

/**
 * class Config
 *
 * Module to handle configuration settings.
 */
const Config = {

  configs: {},

  /**
   * Config.get(path) -> Mixed
   * - path (String): Dot-delimited configuration path. Example: 'api.ratelimit'
   *
   * Get a config value.
   */
  get(path) {
    if (!path) {
      throw new Error('You must supply a config path')
    }

    let config = this.configs
    const parts = path.split('.')

    parts.forEach((currentPart) => {
      if (!{}.hasOwnProperty.call(config, currentPart)) {
        throw new Error(`No config value found for: ${path}`)
      }
      config = config[currentPart]
    })

    return config
  },

  /**
   * Config.getAll() -> Object
   *
   * Get all available config values.
   */
  getAll() {
    return this.configs
  },

  /**
   * Config.load(environment, configs) -> Object
   * - environment (String): Select configs specific to this environment
   * - configs (Object): The configs to process
   *
   * Loads environment-specific config values.
   */
  load(environment, configs) {
    extend(
      this.configs,
      this.processConfigs(environment, configs),
    )
  },

  /**
   * Config.set(path, value)
   * - path (String): Dot-delimited configuration path. Example: 'api.ratelimit'
   * - value (Mixed): Config value
   *
   * Set a config value.
   */
  set(path, value) {
    const parts = path.split('.')
    let config = this.configs

    parts.forEach((currentPart, index) => {
      if (index === parts.length - 1) {
        config[currentPart] = value
        return
      }

      if (!{}.hasOwnProperty.call(config, currentPart)) {
        config[currentPart] = {}
      }

      config = config[currentPart]
    })
  },

  /**
   * Config.processConfigs(environment, configs) -> Object
   * - environment (String): Select configs specific to this environment
   * - configs (Object): The configs to process
   *
   * Produces a config object that contains environment-specific config values.
   */
  processConfigs(environment, configs) {
    const results = {}
    Object.entries(configs).forEach(([key, value]) => {
      let derivedValue

      // literal config value
      if (typeof value === 'string' || typeof value === 'number') {
        results[key] = value
        return
      }

      if ({}.hasOwnProperty.call(value, environment)) {
        // environment-specific config
        derivedValue = value[environment]
      } else if ({}.hasOwnProperty.call(value, 'default')) {
        // fallback if environment-specific config isn't found
        derivedValue = value.default
      } else {
        // nested object
        derivedValue = this.processConfigs(environment, value)
      }

      results[key] = derivedValue
    })

    return results
  },
}

export default Config
