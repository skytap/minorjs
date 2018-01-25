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

import 'babel-polyfill'

/**
 * Module to create unique ID strings.
 */
const Identifier = {

  CHARS: 'ABCDEF1234567890',

  LENGTH: 8,

  /**
   * Identifier.generate(length) -> String
   * - length (Integer)
   */
  generate(length) {
    let id = ''

    const desiredLength = length || this.LENGTH

    for (let i = 0; i < desiredLength; i += 1) {
      const randomNumber = Math.floor(Math.random() * this.CHARS.length)
      id += this.CHARS.substring(randomNumber, randomNumber + 1)
    }

    return id
  },
}

export default Identifier
