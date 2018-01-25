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
import sinon from 'sinon'
import Filesystem from '../../../src/filesystem'

describe('src/filesystem.js', () => {
  describe('recurseDirectory', () => {
    it('returns correct results', () => {
      const filter = filename => (
        filename.split('.').pop() === 'js'
      )
      const controllers = './test/data/controllers/'
      const expected = [
        'foo_controller.js',
        'bar/another_controller.js',
        'bar/baz_controller.js',
      ]

      return Filesystem.recurseDirectory(controllers, filter).then((results) => {
        results.should.eql(expected)
      })
    })
  })

  describe('requireFilesInDirectory', () => {
    it('should require all files in the directory', () => {
      const Logger = {
        profile: sinon.spy(),
      }
      const controllers = path.join(
        __dirname,
        '../../../test/data/controllers/bar',
      )

      Filesystem.__Rewire__('Logger', Logger)

      return Filesystem.requireFilesInDirectory(controllers).then((results) => {
        results.another_controller.prototype.name.should.eql('another_controller')
        results.baz_controller.prototype.name.should.eql('baz_controller')
        Logger.profile.called.should.be.true()
      })
    })
  })

  describe('recurseDirectorySync', () => {
    it('returns correct results', () => {
      const filter = filename => (
        filename.split('.').pop() === 'js'
      )
      const controllers = './test/data/controllers/'
      const expected = [
        'foo_controller.js',
        'bar/another_controller.js',
        'bar/baz_controller.js',
      ]

      Filesystem.recurseDirectorySync(controllers, filter).should.eql(expected)
    })
  })
})
