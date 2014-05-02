var should  = require('should'),
    sinon   = require('sinon'),
    Backhoe = require('backhoe'),
    Module;

describe('lib/environment.js', function () {
    beforeEach(function () {
        Backhoe.clear();
    });

    describe('getBasePath', function () {
        it('returns correct path', function () {
            var path = 'some path';
            Module = require('../../lib/environment');
            Module.basePath = path;
            Module.getBasePath().should.eql(path);
        });
    });

    describe('getEnvironment', function () {
        it('returns correct environment', function () {
            var environment = 'some env';
            Module = require('../../lib/environment');
            Module.environment = environment;
            Module.getEnvironment().should.eql(environment);
        });
    });

    describe('getInstance', function () {
        it('returns correct instance', function () {
            var instance = 42;
            Module = require('../../lib/environment');
            Module.instance = instance;
            Module.getInstance().should.eql(instance);
        });
    });

    describe('initialize', function () {
        it('returns correct instance', function () {
            var configs = { 'foo' : 'bar' },
                Config  = {
                    load : sinon.spy()
                };

            Backhoe.mock(require.resolve('../../lib/config'), Config);

            Module = require('../../lib/environment');

            Module._loadConfigs = sinon.spy(function () {
                return configs;
            });
            Module._initLogger = sinon.spy();

            Module.initialize({
                environment : 'development',
                basePath    : 'somebasepath',
                instance    : 42,
                loggers     : [ 'some loggers' ]
            });

            Module.environment.should.eql('development');
            Module.basePath.should.eql('somebasepath');
            Module.instance.should.eql(42);
            Module.loggers.should.eql([ 'some loggers' ]);

            Module._loadConfigs.calledOnce.should.be.true;
            Module._initLogger.calledOnce.should.be.true;

            Config.load.calledOnce.should.be.true;
            Config.load.calledWith('development', configs);
        });
    });

    describe('isDevelopment', function () {
        it('returns false', function () {
            Module = require('../../lib/environment');
            Module.environment = 'production';
            Module.isDevelopment().should.be.false;
        });

        it('returns true', function () {
            Module = require('../../lib/environment');
            Module.environment = 'development';
            Module.isDevelopment().should.be.true;
        });
    });

    describe('isProduction', function () {
        it('returns false', function () {
            Module = require('../../lib/environment');
            Module.environment = 'development';
            Module.isProduction().should.be.false;
        });

        it('returns true', function () {
            Module = require('../../lib/environment');
            Module.environment = 'production';
            Module.isProduction().should.be.true;
        });
    });

    describe('_getConfigFilePath', function () {
        it('returns correct path', function () {
            Module = require('../../lib/environment');
            Module.basePath = 'foo/bar';
            Module._getConfigFilePath().should.eql('foo/bar/config/app.json');
        });
    });

    describe('_initLogger', function () {
        it('returns correct instance', function () {
            var Logger  = {
                    initialize : sinon.spy()
                };

            Backhoe.mock(require.resolve('../../lib/logger'), Logger);

            Module = require('../../lib/environment');

            Module.environment = 'development';
            Module.basePath    = 'foo/bar';
            Module.instance    = 42;
            Module.loggers    = [ 'foobar' ];

            Module._initLogger();

            Logger.initialize.calledOnce.should.be.true;
            Logger.initialize.calledWith({
                isProduction : false,
                basePath     : 'foo/bar',
                instance     : 42,
                loggers      : [ 'foobar' ]
            });
        });
    });

    describe('_loadConfigs', function () {
        it('returns parsed config file', function () {
            Module = require('../../lib/environment');
            Module.basePath = 'test/data';
            Module._loadConfigs().should.eql({
                "foo" : "bar"
            });
        });
    });
});