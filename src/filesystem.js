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
import Wrench from 'wrench'
import Logger from './logger'

/**
 * Module for interacting with the filesystem.
 */
const Filesystem = {

  /**
   * Filesystem.recurseDirectory(path, filter) -> Object
   * - path (String): Directory to recurse
   * - filter (Function): Function to filter results
   *
   * Recursivly gets a list of all files in a directory.
   */
  recurseDirectory(path, filter) {
    return new Promise((resolve, reject) => {
      let results = []

      Wrench.readdirRecursive(path, (error, files) => {
        results = this.getAllFiles(resolve, reject, results, filter, error, files)
      })
    })
  },

  /**
   * Filesystem.requireFilesInDirectory(path, annotate) -> Object
   * - path (String): Directory to recurse
   * - annotate (Boolean): Whether to add the module path and name to the object
   */
  requireFilesInDirectory(path, annotate = false) {
    return Promise.promisify(fs.readdir)(path).then(files => (
      this.requireAllFiles(files, path, annotate)
    ))
  },

  /**
   * Filesystem.recurseDirectorySync(path, filter) -> Object
   * - path (String): Directory to recurse
   * - filter (Function): Function to filter results
   *
   * Synchronously, recursivly gets a list of all files in a directory.
   */
  recurseDirectorySync(path, filter) {
    const files = Wrench.readdirSyncRecursive(path)
    return files.filter(filter)
  },

  /**
   * Filesystem.getAllFiles(resolve, reject, results, filter, error, files) -> Array
   * - resolve (Object)
   * - reject (Object)
   * - results (Array)
   * - filter (Function): Function to filter results.
   * - error (Object): Error object.
   * - files (Array): Array of files.
   */
  getAllFiles(resolve, reject, results, filter, error, files) {
    if (error) {
      reject(error)
    }

    if (files === null) {
      resolve(results)
      return []
    }

    const filteredFiles = files.filter(filter)

    return results.concat(filteredFiles)
  },

  /**
   * Filesystem.requireAllFiles(files, path, annotate) -> Object
   * - files (Array): Array of files to require
   * - path (String): Path to the file
   * - annotate (Boolean): Whether to add the module path and name to the object
   */
  requireAllFiles(files, path, annotate) {
    const results = {}

    files.forEach((file) => {
      this.requireFile(results, file, path, annotate)
    })

    return results
  },

  /**
   * Filesystem.requireFile(results, file, path, annotate) -> Object
   * - results (Object): Hash of modules
   * - file (String): File to load
   * - path (String): Path to the file
   * - annotate (Boolean): Whether to add the module path and name to the object
   *
   * Require a module.
   */
  requireFile(results, file, path, annotate) {
    const start = Date.now()
    const name = file.replace(/\.(js|coffee)/, '')
    // eslint-disable-next-line import/no-dynamic-require, global-require
    let Module = require(`${path}/${name}`)
    Module = Module.default ? Module.default : Module

    if (annotate) {
      Module.modulePath = path
      Module.moduleName = name
    }

    results[name] = Module

    Logger.profile(`Require module ${name}`, start)
  },
}

export default Filesystem
