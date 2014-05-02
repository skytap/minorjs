var sinon         = require('sinon'),
    FooController = function () {};
FooController.prototype.name = 'foo_controller';
FooController.prototype.addFiltersForHandler = sinon.spy();
module.exports = FooController;