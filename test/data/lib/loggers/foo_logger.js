var sinon = require('sinon');
module.exports = function () {
    this.name       = 'foo_logger';
    this.initialize = sinon.spy();
    this.log        = sinon.spy();
};