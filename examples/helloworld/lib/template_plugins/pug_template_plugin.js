/**
 * Copyright 2017 Skytap Inc.
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

import pug from 'pug'

require.extensions['.pug'] = function (module, filename) {
  module.exports = pug.compileFile(filename, {filename})
}

const PugTemplatePlugin = {
  register(app) {
    app.engine('pug', pug.__express)
    app.set('view engine', 'pug')
  }
}

export default PugTemplatePlugin
