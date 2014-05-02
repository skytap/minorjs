var Filesystem = require('./filesystem'),
    Logger     = require('./logger');

/**
 * Module to load and register template mixins.
 **/
var Template = {

    mixins : {},

    //////////////////////////////////////////////////////////////////////////
    // Public methods ///////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    /**
     * Template.getMixins() -> Object
     **/
    getMixins : function() {
        return this.mixins;
    },

    /**
     * Template.loadMixins(path) -> Object
     * - path (String): Path to the template mixins
     **/
    loadMixins : function (path) {
        var self  = this,
            start = Date.now();

        return Filesystem.requireFilesInDirectory(path)
            .then(function(mixins) {
                self.mixins = mixins;
                Logger.profile('Load template mixins', start);
            });
    }
};

module.exports = Template;