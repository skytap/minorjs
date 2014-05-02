var sinon = require('sinon');
module.exports = function () {
    this.name       = 'bar_logger';
    this.initialize = sinon.spy();
    this.log        = sinon.spy();
};