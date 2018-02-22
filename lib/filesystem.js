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

var _       = require('underscore'),
    Promise = require('bluebird'),
    fs      = require('fs'),
    Wrench  = require('wrench'),
    Logger  = require('./logger');

/**
 * Module for interacting with the filesystem.
 **/
var Filesystem = {

    //////////////////////////////////////////////////////////////////////////
    // Public methods ///////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Filesystem.recurseDirectory(path, filter) -> Object
     * - path (String): Directory to recurse
     * - filter (Function): Function to filter results
     *
     * Recursivly gets a list of all files in a directory.
     **/
    recurseDirectory : function (path, filter) {
        var self = this;

        return new Promise(function (resolve, reject) {
            var results = [];

            Wrench.readdirRecursive(path, function getAllFiles (error, files) {
                results = self._getAllFiles(resolve, reject, results, filter, error, files);
            });
        });
    },

    /**
     * Filesystem.requireFilesInDirectory(path, annotate) -> Object
     * - path (String): Directory to recurse
     * - annotate (Boolean): Whether to add the module path and name to the object
     **/
    requireFilesInDirectory : function (path, annotate) {
        var self     = this,
            annotate = annotate || false;

        return Promise.promisify(fs.readdir)(path)
            .then(function (files) {
                return self._requireAllFiles(files, path, annotate);
            });
    },

    /**
     * Filesystem.recurseDirectorySync(path, filter) -> Object
     * - path (String): Directory to recurse
     * - filter (Function): Function to filter results
     *
     * Synchronously, recursivly gets a list of all files in a directory.
     **/
    recurseDirectorySync : function (path, filter) {
        var files = Wrench.readdirSyncRecursive(path);
        return _.filter(files, filter);
    },

    //////////////////////////////////////////////////////////////////////////
    // Psuedo-private methods ///////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Filesystem._getAllFiles(resolve, reject, results, filter, error, files)
     * - resolve (Object)
     * - reject (Object)
     * - results (Array)
     * - filter (Function): Function to filter results.
     * - error (Object): Error object.
     * - files (Array): Array of files.
     **/
    _getAllFiles : function (resolve, reject, results, filter, error, files) {
        if (error) {
            reject(error);
        }

        if (files === null) {
            resolve(results);
            return;
        }

        files = _.filter(files, filter);

        return results.concat(files);
    },

    /**
     * Filesystem._requireAllFiles(files, path, annotate) -> Object
     * - files (Array): Array of files to require
     * - path (String): Path to the file
     * - annotate (Boolean): Whether to add the module path and name to the object
     **/
    _requireAllFiles : function (files, path, annotate) {
        var self    = this,
            results = {};

        files.forEach(function loadFile (file) {
            self._requireFile(results, file, path, annotate);
        });

        return results;
    },

    /**
     * Filesystem._requireFile(results, file, path, annotate) -> Object
     * - results (Object): Hash of modules
     * - file (String): File to load
     * - path (String): Path to the file
     * - annotate (Boolean): Whether to add the module path and name to the object
     *
     * Require a module.
     **/
    _requireFile : function (results, file, path, annotate) {
        var start  = Date.now(),
            name   = file.replace(/\.(js|coffee)/, ''),
            Module = require(path + '/' + name);

        if (annotate) {
            Module.modulePath = path;
            Module.moduleName = name;
        }

        results[name] = Module;

        Logger.profile('Require module ' + name, start);
    }
};

module.exports = Filesystem;