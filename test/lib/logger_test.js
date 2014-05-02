var should  = require('should'),
    sinon   = require('sinon'),
    Backhoe = require('backhoe'),
    path    = require('path'),
    Q       = require('q'),
    Module;

describe('lib/logger.js', function () {
    beforeEach(function () {
        Backhoe.clear();
    });

    describe('initialize', function () {
        it('loads a subset of loggers', function () {
            var options     = {
                    basePath : '../test/data/',
                    loggers  : [
                        'foo'
                    ]
                };

            Module = require('../../lib/logger');
            Module.initialize(options);
            Module._options.should.eql(options);
            Module.loggers.length.should.eql(1);
            Module.loggers[0].name.should.eql('foo_logger');
        });

        it('loads all loggers', function () {
            var options     = {
                    basePath : '../test/data/',
                    loggers  : [
                        'bar',
                        'foo'
                    ]
                };

            Module = require('../../lib/logger');
            Module.initialize(options);
            Module._options.should.eql(options);
            Module.loggers.length.should.eql(2);
            Module.loggers[0].name.should.eql('bar_logger');
            Module.loggers[1].name.should.eql('foo_logger');
        });
    });

    describe('profile', function () {
        it('logs performance data', function () {
            var name  = 'some name',
                start = 12345;

            Module = require('../../lib/logger');
            Module._log = sinon.spy(function (level, message) {
                level.should.eql('debug');
                message.should.match(/Performance: some name took [0-9]*ms/);
            });
            Module.profile(name, start);

            Module._log.calledOnce.should.be.true;
        });
    });

    describe('_log', function () {
        it('use all loggers', function () {
            var loggers = [
                    {
                        log : sinon.spy()
                    },
                    {
                        log : sinon.spy()
                    }
                ],
                level   = 'debug',
                message = 'some log message';

            Module = require('../../lib/logger');
            Module.loggers = loggers;
            Module._log(message);

            Module.loggers[0].log.calledOnce.should.be.true;
            Module.loggers[0].log.calledWith(level, message);
            Module.loggers[1].log.calledOnce.should.be.true;
            Module.loggers[1].log.calledWith(level, message);
        });
    });
});