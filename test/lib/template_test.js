var should  = require('should'),
    sinon   = require('sinon'),
    Backhoe = require('backhoe'),
    path    = require('path'),
    Q       = require('q'),
    Module;

describe('lib/template.js', function () {
    beforeEach(function () {
        Backhoe.clear();
    });

    describe('getMixins', function () {
        it('should return all mixins', function () {
            var expected = {
                foo : 42
            };

            Module = require('../../lib/template');
            Module.mixins = expected;
            Module.getMixins().should.eql(expected);
        });
    });

    describe('loadMixins', function () {
        it('should load all template mixins', function (done) {
            var Logger        = {
                    profile : sinon.spy()
                },
                templatesPath = path.join(
                    __dirname,
                    '../../test/data/mixins'
                ),
                expected      = {
                    bar_mixin : {
                        name : 'bar_mixin'
                    },
                    foo_mixin : {
                        name: 'foo_mixin'
                    }
                };

            Backhoe.mock(require.resolve('../../lib/logger'), Logger);

            Module = require('../../lib/template');
            Module.loadMixins(templatesPath)
                .then(function () {
                    Module.mixins.should.eql(expected);
                    Logger.profile.called.should.be.true;
                    done();
                })
                .done();
        });
    });
});