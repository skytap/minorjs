var _ = require('underscore');

/**
 * Module to help with common path manipulation.
 **/
var Path = function(path) {
    this._path = path;
};

_.extend(Path.prototype, {

    //////////////////////////////////////////////////////////////////////////
    // Public methods ///////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Path.isCoffeescriptFile() -> Boolean
     **/
    isCoffeescriptFile : function () {
        return this._hasExtension('.coffee');
    },

    /**
     * Path.isJavascriptFile() -> Boolean
     **/
    isJavascriptFile : function() {
        return this._hasExtension('.js');
    },

    //////////////////////////////////////////////////////////////////////////
    // Psuedo-private methods ///////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Path._hasExtension(path, extension) -> Boolean
     * - path (String)
     * - extension (String)
     **/
    _hasExtension : function(extension) {
        var index = this._path.indexOf(extension);
        return index > 0 && index === this._path.length - extension.length;
    }
});

module.exports = Path;