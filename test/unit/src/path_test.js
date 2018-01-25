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

import Module from '../../../src/path'

describe('src/path.js', () => {
  describe('isCoffeescriptFile', () => {
    const testCases = [
      {
        file: '',
        expected: false,
      },
      {
        file: 'coffeescript.js',
        expected: false,
      },
      {
        file: 'foo.notcoffee',
        expected: false,
      },
      {
        file: '.coffee',
        expected: false,
      },
      {
        file: 'foo.coffee',
        expected: true,
      },
    ]

    testCases.forEach((testCase) => {
      it(`returns correct value for: ${JSON.stringify(testCase)}`, () => {
        const module = new Module(testCase.file)
        module.isCoffeescriptFile().should.eql(testCase.expected)
      })
    })
  })

  describe('isJavascriptFile', () => {
    const testCases = [
      {
        file: '',
        expected: false,
      },
      {
        file: 'js.coffee',
        expected: false,
      },
      {
        file: 'foo.notjs',
        expected: false,
      },
      {
        file: '.js',
        expected: false,
      },
      {
        file: 'foo.js',
        expected: true,
      },
    ]

    testCases.forEach((testCase) => {
      it(`returns correct value for: ${JSON.stringify(testCase)}`, () => {
        const module = new Module(testCase.file)
        module.isJavascriptFile().should.eql(testCase.expected)
      })
    })
  })
})
