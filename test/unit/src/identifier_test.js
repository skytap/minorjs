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

import Identifier from '../../../src/identifier'

describe('src/identifier.js', () => {
  describe('generate', () => {
    it('returns string', () => {
      const result = Identifier.generate()
      result.should.be.type('string')
    })

    it('returns string with default length', () => {
      const result = Identifier.generate()
      result.length.should.eql(8)
    })

    it('returns string with specified length', () => {
      const result = Identifier.generate(20)
      result.length.should.eql(20)
    })
  })
})
