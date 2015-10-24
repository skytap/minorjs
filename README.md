[![Build Status](https://travis-ci.org/skytap/minorjs.svg?branch=master)](https://travis-ci.org/skytap/minorjs)
[![NPM version](https://badge.fury.io/js/minorjs.svg)](http://badge.fury.io/js/minorjs)

# MinorJS

MinorJS is an unopinionated, ultra-minimal web framework that alleviates the pain of routing, testing, and deployment clustering for Node.js applications.

## Why MinorJS?

By starting with MinorJS you maintain the freedom to develop your application with whichever technologies and philosophies you find appropriate for your Node.js project. MinorJS only handles routing, testing, and deployment clustering, ensuring that you have the tools to develop with speed and ship with confidence.

## Installation

This package is available on npm as:

```
npm install minorjs
```

## Features

* Clustered to support fault tolerance and load balancing.
* Zero-downtime rolling restarts.
* Framework-level error handling and logging to keep your site running.
* Per-environment configurations.
* Automatic route wiring; just create a controller module!
* Run filters before each request.
* Request profiling.
* Automatically reload changed modules (controllers/templates/etc) in development with no manual restarting. Save and refresh your browser!
* Express-style request middleware.
* Template mixins: execute Javascript from your templates.

## Functional testing

You can easily write functional tests of your MinorJS application using the
[MinorJS testing framework](https://github.com/skytap/minorjs-test).

You can make requests to your site with a headless browser, access data
in the DOM with jQuery-style selectors and build your tests with standard
tools like Mocha and Should.

## CoffeeScript-friendly

While MinorJS is written in Javascript, the framework happily works with CoffeeScript.

## Node.js 0.10

minorjs version 2 and newer works with Node.js 4.  If you need to run minorjs on Node.js 0.10 you can install minorjs version 1.4.0.

## License

Copyright 2014 Skytap Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Contributors

* [Scott Brady](https://github.com/scottbrady) (Maintainer)
* [Matt Mehlhope](https://github.com/mmehlhope)
