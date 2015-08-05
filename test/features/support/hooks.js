var FunctionalTest = require('../../lib/functional_test');

module.exports = function () {
  this.BeforeFeatures(function (feature, done) {
    FunctionalTest.setup();
    return FunctionalTest._before(done);
  });

  return this.BeforeScenario(function (scenario, done) {
    return FunctionalTest._beforeEach(done);
  });
};