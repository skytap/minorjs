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

var should  = require('should'),
    sinon   = require('sinon'),
    Backhoe = require('backhoe'),
    Module;

describe('lib/controller.js', function () {
    beforeEach(function () {
        Backhoe.clear();
    });

    [
        'index',
        'new',
        'create',
        'show',
        'edit',
        'update',
        'destroy'
    ].forEach(function (action) {
        describe(action, function () {
            it('default action should call Express next callback', function () {
                var request  = {},
                    response = {},
                    next     = sinon.spy(),
                    module;

                Module = require('../../../lib/controller');
                module = new Module();
                module[action](request, response, next);

                next.calledOnce.should.be.true;
            });
        });
    });

    describe('addFiltersForHandler', function () {
        it('no before filters', function () {
            var url     = 'someurl',
                handler = 'somehandler',
                module;

            Module = require('../../../lib/controller');
            module = new Module();
            module.addFiltersForHandler(url, handler);

            module.filtersByRoute.should.eql({
                'someurl' : {
                    'somehandler' : []
                }
            });
        });

        it('no matching before filters', function () {
            var url     = 'someurl',
                handler = 'somehandler',
                module;

            Module = require('../../../lib/controller');
            module = new Module();
            module.before = {
                'index' : [ 'nomatch' ]
            };

            module.addFiltersForHandler(url, handler);

            module.filtersByRoute.should.eql({
                'someurl' : {
                    'somehandler' : []
                }
            });
        });

        it('adds only matching before filter', function () {
            var url     = 'someurl',
                handler = 'somehandler',
                module;

            Module = require('../../../lib/controller');
            module = new Module();
            module.before = {
                'index' : [ 'somehandler', 'otherfilter' ]
            };

            module.addFiltersForHandler(url, handler);

            module.filtersByRoute.should.eql({
                'someurl' : {
                    'somehandler' : [
                        'index'
                    ]
                }
            });
        });

        it('adds matching before filter when action is all', function () {
            var url     = 'someurl',
                handler = 'somehandler',
                module;

            Module = require('../../../lib/controller');
            module = new Module();
            module.before = {
                'index' : [ 'all' ]
            };

            module.addFiltersForHandler(url, handler);

            module.filtersByRoute.should.eql({
                'someurl' : {
                    'somehandler' : [
                        'index'
                    ]
                }
            });
        });
    });

    describe('getFilters', function () {
        it('returns filters', function () {
            var url     = 'someurl',
                handler = 'somehandler',
                filters = [ 'index' ],
                module;

            Module = require('../../../lib/controller');
            module = new Module();
            module.filtersByRoute[url] = {};
            module.filtersByRoute[url][handler] = filters;
            module.getFilters(url, handler).should.eql(filters);
        });
    });

    describe('_getFullError', function () {
        it('returns correct error message', function () {
            var request    = {},
                response   = {},
                error      = {
                    stack : 'some stack'
                },
                incidentId = 'ABC123',
                module;

            Module = require('../../../lib/controller');
            module = new Module();
            module._getFullError(request, response, error, incidentId)
                .should.eql('Incident ' + incidentId + ' - ' + error.stack);
        });
    });

    describe('_getUserError', function () {
        it('returns correct error message', function () {
            var request    = {},
                response   = {},
                error      = {},
                incidentId = 'ABC123',
                module;

            Module = require('../../../lib/controller');
            module = new Module();
            module._getUserError(request, response, error, incidentId)
                .should.eql('An error occurred. Please try again.' + ' (' + incidentId + ')');
        });
    });

    describe('_getIncidentId', function () {
        it('returns string', function () {
            Module = require('../../../lib/controller');
            var module = new Module();
            var result = module._getIncidentId();
            result.should.be.type('string');
        });

        it('returns string of correct length', function () {
            Module = require('../../../lib/controller');
            var module = new Module();
            var result = module._getIncidentId();
            result.length.should.eql(8);
        });
    });

    describe('_handleError', function () {
        it('should get error information', function () {
            var incidentId  = 'ABC123',
                request     = {
                    xhr : true
                },
                response    = {},
                error       = 'some error',
                Logger      = {
                    error : sinon.spy()
                },
                module;

            Backhoe.mock(require.resolve('../../../lib/logger'), Logger);

            Module = require('../../../lib/controller');
            module = new Module();
            module._handleXhrError = sinon.spy();
            module._handleNormalError = sinon.spy();
            module._getIncidentId = sinon.spy(function () {
                return incidentId;
            });
            module._getFullError = sinon.spy();
            module._handleError(request, response, error);

            module._getIncidentId.calledOnce.should.be.true;
            module._getFullError.calledOnce.should.be.true;
            module._getFullError.calledWith(request, response, error, incidentId);

            Logger.error.calledOnce.should.be.true;
        });

        it('should call XHR handler', function () {
            var incidentId  = 'ABC123',
                request     = {
                    xhr : true
                },
                response    = {},
                error       = 'some error',
                Logger  = {
                    error : sinon.spy()
                },
                module;

            Backhoe.mock(require.resolve('../../../lib/logger'), Logger);

            Module = require('../../../lib/controller');
            module = new Module();
            module._handleXhrError = sinon.spy();
            module._handleNormalError = sinon.spy();
            module._getIncidentId = sinon.spy(function () {
                return incidentId;
            });
            module._getFullError = sinon.spy();
            module._handleError(request, response, error);

            module._handleXhrError.calledOnce.should.be.true;
            module._handleXhrError.calledWith(request, response, error);
            module._handleNormalError.called.should.be.false;

            Logger.error.calledOnce.should.be.true;
        });

        it('should call non-XHR handler', function () {
            var incidentId  = 'ABC123',
                fullError   = 'some full error',
                request     = {
                    xhr : false
                },
                response    = {},
                error       = 'some error',
                Logger  = {
                    error : sinon.spy()
                },
                module;

            Backhoe.mock(require.resolve('../../../lib/logger'), Logger);

            Module = require('../../../lib/controller');
            module = new Module();
            module._handleXhrError = sinon.spy();
            module._handleNormalError = sinon.spy();
            module._getIncidentId = sinon.spy(function () {
                return incidentId;
            });
            module._getFullError = sinon.spy(function () {
                return fullError;
            });
            module._handleError(request, response, error);

            module._handleNormalError.calledOnce.should.be.true;
            module._handleNormalError.calledWith(request, response, error, incidentId, fullError);
            module._handleXhrError.called.should.be.false;

            Logger.error.calledOnce.should.be.true;
        });
    });

    describe('_handleXhrError', function () {
        it('should render error for development', function () {
            var request    = {},
                response   = {
                    status : sinon.spy(function () {
                        return this;
                    }),
                    send   : sinon.spy()
                },
                error      = {
                    stack : 'some stack trace'
                },
                module;

            Module = require('../../../lib/controller');
            module = new Module();
            module._handleXhrError(request, response, error);

            response.status.calledOnce.should.be.true;
            response.status.calledWith(500);

            response.send.calledOnce.should.be.true;
            response.send.calledWith(
                {
                    success : false,
                    error   : error
                }
            );
        });
    });

    describe('_handleNormalError', function () {
        it('should render error for development', function () {
            var incidentId  = 'ABC123',
                fullError   = 'some full error',
                userError   = 'some user error',
                request     = {},
                response    = {
                    status : sinon.spy()
                },
                error       = {
                    stack : 'some stack trace'
                },
                Environment = {
                    isDevelopment : sinon.spy(function () {
                        return true;
                    })
                },
                module;

            Backhoe.mock(require.resolve('../../../lib/environment'), Environment);

            Module = require('../../../lib/controller');
            module = new Module();
            module._getUserError = sinon.spy(function () {
                return userError;
            });
            module.render = sinon.spy();
            module._handleNormalError(request, response, error, incidentId, fullError);

            response.status.calledOnce.should.be.true;
            response.status.calledWith(500);

            module._getUserError.calledOnce.should.be.true;
            module._getUserError.calledWith(request, response, error, incidentId);

            module.render.calledOnce.should.be.true;
            module.render.calledWith(request, response, 'error', {
                error     : userError,
                fullError : error.stack
            });
        });

        it('should render error for production', function () {
            var incidentId  = 'ABC123',
                fullError   = 'some full error',
                userError   = 'some user error',
                request     = {},
                response    = {
                    status : sinon.spy()
                },
                error       = {
                    stack : 'some stack trace'
                },
                Environment = {
                    isDevelopment : sinon.spy(function () {
                        return false;
                    })
                },
                module;

            Backhoe.mock(require.resolve('../../../lib/environment'), Environment);

            Module = require('../../../lib/controller');
            module = new Module();
            module._getUserError = sinon.spy(function () {
                return userError;
            });
            module.render = sinon.spy();
            module._handleNormalError(request, response, error, incidentId, fullError);

            response.status.calledOnce.should.be.true;
            response.status.calledWith(500);

            module._getUserError.calledOnce.should.be.true;
            module._getUserError.calledWith(request, response, error, incidentId);

            module.render.calledOnce.should.be.true;
            module.render.calledWith(request, response, 'error', {
                error     : userError,
                fullError : null
            });
        });
    });
});