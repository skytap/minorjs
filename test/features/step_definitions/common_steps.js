var should         = require('should'),
    FunctionalTest = require('../../lib/functional_test');

var CommonSteps = module.exports = function () {
  this.Given(/^I am on the hello page$/, function () {
    return FunctionalTest.browser.visit(FunctionalTest.getUrl('/hello'))
  });

  this.Given(/^I am on the hello new page$/, function () {
    return FunctionalTest.browser.visit(FunctionalTest.getUrl('/hello/new'))
  });

  this.Given(/^I am on the random page$/, function () {
    return FunctionalTest.browser.visit(FunctionalTest.getUrl('/random'))
  });

  this.Then(/^the page URL is "([^"]*)"$/, function (text, next) {
    FunctionalTest.browser.location.pathname.should.eql(text);
    next();
  });

  this.Then(/^the page header text is "([^"]*)"$/, function (text, next) {
    FunctionalTest.browser.text('h1').should.eql(text);
    next();
  });

  this.Then(/^the page header text is random color$/, function (next) {
    FunctionalTest.browser.text('h1').should.match(/Today's color of the day is: (\w*)./);
    next();
  });
}