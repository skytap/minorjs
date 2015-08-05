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

var extend = require('extend'),
    should = require('should');

// should.eql is deprecated. turn off warnings for now.
should.warn = false;

module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('tests', [
    'mochaTest:unit',
    'shell:functional',
    'shell:cucumber'
  ]);

  grunt.initConfig({
    mochaTest : {
      options : {
        reporter : 'dot',
        require  : [
          'should',
          './test/lib/nocache.js'
        ]
      },
      unit : {
        src : [
          'test/unit/**/*.js'
        ]
      }
    },

    shell : {
      functional : {
        command : './test/minorjs-test',
        options : {
          execOptions : {
            env : extend({ MOCHA_COLORS : true }, process.env)
          }
        }
      },

      cucumber : {
        command : './test/minorjs-cuke-test',
        options : {
          execOptions : {
            env : extend({ MOCHA_COLORS : true }, process.env)
          }
        }
      }
    }
  });
};