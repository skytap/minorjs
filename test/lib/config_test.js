var should = require('should'),
    Module = require('../../lib/config');

describe('lib/config.js', function () {
    beforeEach(function () {
        Module.configs = {};
    });

    describe('get', function () {
        it('should throw exception when no path supplied', function () {
            (function () {
                Module.get();
            }).should.throw('You must supply a config path');
        });

        it('should throw exception when no config value exists', function () {
            var key = 'does.not.exist';
            (function () {
                Module.get(key);
            }).should.throw('No config value found for: ' + key);
        });

        it('should return correct value for key', function () {
            var expected = 'some config value' + Math.random();

            Module.configs = {
                'somenewkey' : expected
            };

            Module.get('somenewkey').should.eql(expected);
        });

        it('should return correct value for nested key', function () {
            var expected = 'some config value' + Math.random();

            Module.configs = {
                some : {
                    config : {
                        key : expected
                    }
                }
            };

            Module.get('some.config.key').should.eql(expected);
        });
    });

    describe('getAll', function () {
        it('should return all config values', function () {
            var configs = { some : 'configs' };
            Module.configs = configs;
            Module.getAll().should.eql(configs);
        });
    });

    describe('load', function () {
        it('empty config object', function () {
            var environment = 'development',
                configs     = {},
                expected    = {};
            Module.load(environment, configs);
            Module.configs.should.eql(expected);
        });

        it('config with literal string value', function () {
            var environment = 'development',
                configs     = {
                    foo : 'bar'
                },
                expected    = {
                    foo : 'bar'
                };
            Module.load(environment, configs);
            Module.configs.should.eql(expected);
        });

        it('config with literal integer value', function () {
            var environment = 'development',
                configs     = {
                    foo : 42
                },
                expected    = {
                    foo : 42
                };
            Module.load(environment, configs);
            Module.configs.should.eql(expected);
        });

        it('config with literal float value', function () {
            var environment = 'development',
                configs     = {
                    foo : 4.2
                },
                expected    = {
                    foo : 4.2
                };
            Module.load(environment, configs);
            Module.configs.should.eql(expected);
        });

        it('config with default value', function () {
            var environment = 'development',
                configs     = {
                    foo : {
                        default : 'bar'
                    }
                },
                expected    = {
                    foo : 'bar'
                };
            Module.load(environment, configs);
            Module.configs.should.eql(expected);
        });

        it('config with nested default value', function () {
            var environment = 'development',
                configs     = {
                    foo : {
                        bar : {
                            default : 'baz'
                        }
                    }
                },
                expected    = {
                    foo : {
                        bar : 'baz'
                    }
                };
            Module.load(environment, configs);
            Module.configs.should.eql(expected);
        });

        it('config with environment values; no match; uses default', function () {
            var environment = 'development',
                configs     = {
                    foo : {
                        production : 'prod',
                        staging    : 'staging',
                        default    : 'bar'
                    }
                },
                expected    = {
                    foo : 'bar'
                };
            Module.load(environment, configs);
            Module.configs.should.eql(expected);
        });

        it('config with environment value; uses environment config value', function () {
            var environment = 'development',
                configs     = {
                    foo : {
                        development : 'prod',
                        default     : 'bar'
                    }
                },
                expected    = {
                    foo : 'prod'
                };
            Module.load(environment, configs);
            Module.configs.should.eql(expected);
        });
    });

    describe('set', function () {
        it('should set correct value for key', function () {
            var expected = 'some config value' + Math.random();

            Module.set('somenewkey', expected);

            Module.configs.should.eql({ 'somenewkey' : expected });
        });

        it('should set correct value for nested key', function () {
            var expected = 'some config value' + Math.random();

            Module.set('some.config.key', expected);

            Module.configs.should.eql({
                some : {
                    config : {
                        key : expected
                    }
                }
            });
        });
    });
});