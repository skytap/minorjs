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

# Coffee Script-friendly

While MinorJS is written in Javascript, the framework happily works with Coffee Script.

# License

MIT

## Contributors

[Scott Brady](https://github.com/scottbrady) (Maintainer)