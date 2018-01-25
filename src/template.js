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
import fs from 'fs'
import Promise from 'bluebird'
import Filesystem from './filesystem'
import Logger from './logger'

/**
 * Module to load and register template mixins.
 */
const Template = {

  mixins: {},

  /**
   * Template.getMixins() -> Object
   */
  getMixins() {
    return this.mixins
  },

  /**
   * Template.loadMixins(path) -> Object
   * - path (String): Path to the template mixins
   */
  loadMixins(path) {
    const start = Date.now()

    if (!fs.existsSync(path)) {
      return Promise.resolve()
    }

    return Filesystem.requireFilesInDirectory(path).then((mixins) => {
      this.mixins = mixins
      Logger.profile('Load template mixins', start)
    })
  },
}

export default Template
