var should  = require('should'),
    sinon   = require('sinon'),
    Backhoe = require('backhoe'),
    path    = require('path'),
    Module;

describe('lib/filesystem.js', function () {
    beforeEach(function () {
        Backhoe.clear();
    });

    describe('recurseDirectory', function () {
        it('returns correct results', function (done) {
            var filter      = function (filename) {
                    return filename.split('.').pop() === 'js';
                },
                controllers = './test/data/controllers/',
                expected    = [
                    'foo_controller.js',
                    'bar/another_controller.js',
                    'bar/baz_controller.js'
                ];

            Module = require('../../lib/filesystem');
            Module.recurseDirectory(controllers, filter)
                .then(function (results) {
                    results.should.eql(expected);
                    done();
                })
                .done();
        });
    });

    describe('requireFilesInDirectory', function () {
        it('should require all files in the directory', function (done) {
            var Logger      = {
                    profile : sinon.spy()
                },
                controllers = path.join(
                    __dirname,
                    '../../test/data/controllers/bar'
                );

            Backhoe.mock(require.resolve('../../lib/logger'), Logger);

            Module = require('../../lib/filesystem');
            Module.requireFilesInDirectory(controllers)
                .then(function (results) {
                    results.another_controller.prototype.name.should.eql('another_controller');
                    results.baz_controller.prototype.name.should.eql('baz_controller');
                    Logger.profile.called.should.be.true;
                    done();
                })
                .done();
        });
    });

    describe('recurseDirectorySync', function () {
        it('returns correct results', function () {
            var filter      = function (filename) {
                    return filename.split('.').pop() === 'js';
                },
                controllers = './test/data/controllers/',
                expected    = [
                    'foo_controller.js',
                    'bar/another_controller.js',
                    'bar/baz_controller.js'
                ];

            Module = require('../../lib/filesystem');
            Module.recurseDirectorySync(controllers, filter).should.eql(expected);
        });
    });
});