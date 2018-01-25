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
 */

import FunctionalTest from '../../lib/functional_test'

const CommonSteps = function () {
  this.Given(/^I am on the hello page$/, () => (
    FunctionalTest.browser.visit(FunctionalTest.getUrl('/hello'))
  ))

  this.Given(/^I am on the hello new page$/, () => (
    FunctionalTest.browser.visit(FunctionalTest.getUrl('/hello/new'))
  ))

  this.Given(/^I am on the random page$/, () => (
    FunctionalTest.browser.visit(FunctionalTest.getUrl('/random'))
  ))

  this.Given(/^I am on the frames page$/, () => (
    FunctionalTest.browser.visit(FunctionalTest.getUrl('/frames'))
  ))

  this.Then(/^the page URL is "([^"]*)"$/, (text, next) => {
    FunctionalTest.browser.location.pathname.should.eql(text)
    next()
  })

  this.Then(/^the page header text is "([^"]*)"$/, (text, next) => {
    FunctionalTest.browser.text('h1').should.eql(text)
    next()
  })

  this.Then(/^the page header text is random color$/, (next) => {
    FunctionalTest.browser.text('h1').should.match(/Today's color of the day is: (\w*)./)
    next()
  })

  this.Then(/^the name is "([^"]*)"$/, (text, next) => {
    FunctionalTest.browser.text('.name').should.eql(text)
    next()
  })
}

// eslint-disable-next-line import/no-commonjs
module.exports = CommonSteps
