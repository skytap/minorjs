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

describe('/hello', () => {
  FunctionalTest.setup().run()

  it('should successfully load the hello page', () => (
    FunctionalTest.browser.visit(FunctionalTest.getUrl('/hello')).then(() => {
      FunctionalTest.browser.location.pathname.should.eql('/hello')
      FunctionalTest.browser.text('h1').should.eql('Welcome to the hello index page!')
    })
  ))

  it('should successfully load the new page which defers rendering to the hello controller', () => (
    FunctionalTest.browser.visit(FunctionalTest.getUrl('/hello/new')).then(() => {
      FunctionalTest.browser.location.pathname.should.eql('/hello/new')
      FunctionalTest.browser.text('h1').should.eql('Welcome to the new hello page!')
    })
  ))
})
