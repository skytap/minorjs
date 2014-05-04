[![Build Status](https://travis-ci.org/skytap/minorjs.svg?branch=master)](https://travis-ci.org/skytap/minorjs)

Clustered web framework for Node.js that favors convention over configuration.

# Installation

This package is available on npm as:

```
npm install minorjs
```

# Features

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

# CoffeeScript-friendly

While MinorJS is written in Javascript, the framework happily works with CoffeeScript.

# License

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

[Scott Brady](https://github.com/scottbrady) (Maintainer)