var _      = require('underscore'),
    Q      = require('q'),
    fs     = require('fs'),
    Wrench = require('wrench'),
    Logger = require('./logger');

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
        var self     = this,
            deferred = Q.defer(),
            results  = [];

        Wrench.readdirRecursive(path, function getAllFiles (error, files) {
            results = self._getAllFiles(deferred, results, filter, error, files);
        });

        return deferred.promise;
    },

    /**
     * Filesystem.requireFilesInDirectory(path, annotate) -> Object
     * - path (String): Directory to recurse
     * - annotate (Boolean): Whether to add the module path and name to the object
     **/
    requireFilesInDirectory : function (path, annotate) {
        var self     = this,
            deferred = Q.defer(),
            annotate = annotate || false;

        fs.readdir(
            path,
            deferred.makeNodeResolver()
        );

        return deferred.promise
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
     * Filesystem._getAllFiles(deferred, results, filter, error, files)
     * - deferred (Object): Promise object.
     * - results (Array)
     * - filter (Function): Function to filter results.
     * - error (Object): Error object.
     * - files (Array): Array of files.
     **/
    _getAllFiles : function (deferred, results, filter, error, files) {
        if (error) {
            deferred.reject(error);
        }

        if (files === null) {
            deferred.resolve(results);
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