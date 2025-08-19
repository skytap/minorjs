# MinorJS Changelog

## Version 7.0.5 Aug 14th, 2025
* chore: update compression version to ~1.8.1 to remediate CVE

## Version 7.0.4 October 16th, 2024
* chore: update express version to ^4.21.0 to remediate CVE
* chore: update body parser version to ~1.20.3 to remediate CVE
* chore: update cookie parser version to ~1.4.7 to remediate CVE

## Version 7.0.3 April 4th, 2024
* chore: update express version to ~4.19.2 to remediate CVE

## Version 7.0.2 December 21st, 2022
* chore: update express version to ~4.18.0 to remediate CVE
* chore: update body parser version to ~1.19.0 to remediate CVE

## Version 7.0.1, June 24, 2021

* chore: update minorjs-test version and upgrade underscore

## Version 7.0.0, March 24, 2021

* breaking: updated pug to 3.0.1, which only supports node.js 10 and up, updated accepted packages of node.

## Version 6.0.0, March 31th, 2020

* breaking: changed default template loader from haml to pug

## Version 5.1.1, April 5th, 2018

* chore: update minorjs-test version and adding tests for manual and nozombie

## Version 5.1.0, April 5th, 2018

* feature: upgrade dependencies
* chore: run tests on node.js version 8
* chore: ignore the package-lock file

## Version 5.0.0, March 1st, 2018

* breaking: revert ES6 conversion

## Version 4.2.0, February 13th, 2018

* feature: use getters/setters for controller properties
* fix: corrected issue with reloading controllers in development mode

## Version 4.1.0, January 25th, 2018

* feature: added an .npmignore file so npm won't use the .gitignore file
* fix: simplify publish command

## Version 4.0.2, January 25th, 2018

* fix: compile JS before running tests

## Version 4.0.1, January 25th, 2018

* fix: corrected comment formatting

## Version 4.0.0, January 25th, 2018

* breaking: converted project to ES6+

## Version 3.0.1, November 19th, 2016

* chore: add node.js v6 to testing matrix
* chore: upgrade minorjs-test module

## Version 3.0.0, July 29th, 2016

* breaking: use IPv4 0.0.0.0 hostname by default

## Version 2.5.0, June 23rd, 2016

* feature: add jitter to the worker restart interval

## Version 2.4.3, June 21st, 2016

* chore: updated module dependencies

## Version 2.4.2, April 19th, 2016

* fix: provide stub implementations of Logger methods

## Version 2.4.1, March 2nd, 2016

* docs: added minorjs-frames to the example app

## Version 2.4.0, February 19th, 2016

* make noCache configurable

## Version 2.3.0, January 14th, 2016

* Added support for supplying a logger module instead of just a logger name.

## Version 2.2.0, December 8th, 2015

* Updated module dependencies.

## Version 2.1.0, December 7th, 2015

* Updated module dependencies.

## Version 2.0.0, October 23rd, 2015

* Now with support for Node.js 4.

## Version 1.4.0, October 12th, 2015

* Upgraded dependencies.

## Version 1.3.4, July 21st, 2015

* Upgraded minorjs-test module.

## Version 1.3.3, June 1st, 2015

* Upgraded minorjs-test module.

## Version 1.3.2, June 1st, 2015

* Upgraded dev dependencies.

## Version 1.3.1, April 9th, 2015

* Upgraded dev dependencies.

## Version 1.3.0, April 3rd, 2015

* Upgraded minorjs-test module.

## Version 1.2.0, March 5th, 2015

* Added controller timeout option (jsu).

## Version 1.1.0, February 25th, 2015

* Upgraded dependencies.

## Version 1.0.1, February 19th, 2015

* Show a generic error if the error page also generates an error.

## Version 1.0.0, February 19th, 2015

* Stopped using zero based versioning for the project.
* Switched from Q to bluebird promises. bluebird implements Promises/A+.

## Version 0.15.2, February 18th, 2015

* Make the error template filename a constant on the controller.

## Version 0.15.1, February 15th, 2015

* Upgraded to the latest version of minorjs-test and zombie.

## Version 0.15.0, February 11th, 2015

* Fixed a bug with conditionally sending a response after a render.

## Version 0.14.0, February 5th, 2015

* Moved template engine configuration into a plugin module. This makes it easier to override the default haml-coffee template engine.

## Version 0.13.0, February 3rd, 2015

* Allow controller to yield (e.g. to an extending class) the responsibility of sending the response to the client (kjacobson).

## Version 0.12.0, January 16th, 2015

* Updating tests for browser id and logging changes (jsu).
* Adding browser context id and changing logging parameter order (jsu).

## Version 0.11.2, January 8th, 2015

* Allow end time as optional param for Logger.profile (jsu).

## Version 0.11.1, January 8th, 2015

* Added context name to the environment module (jsu).

## Version 0.11.0, December 30th, 2014

* Updated module dependencies.
* Switched from static-favicon to serve-favicon.

## Version 0.10.1, December 17th, 2014

* Added context id to environment.

## Version 0.10.0, December 8th, 2014

* Added a failsafe if rendering the error page also fails.

## Version 0.9.0, December 3rd, 2014

* Reversed routes array resulting in deeper paths being registered first (dkramer).

## Version 0.8.1, November 24th, 2014

* Fixed a bug with determining the error controller name.

## Version 0.8.0, November 21st, 2014

* Made the URL parsing code more flexible to support more resource ID formats.

## Version 0.7.1, November 7th, 2014

* Updated module dependencies.

## Version 0.7.0, November 7th, 2014

* Wait until the render is finished to log the request completion.
* Now emitting events on the controller when the request starts and when rendering is finished.

## Version 0.6.1, October 15th, 2014

* Include a stack trace in the error message when loading a controller fails.

## Version 0.6.0, October 13th, 2014

* Now attaching a unique identifier token on every request. Useful for filtering
  logs from a single request.

## Version 0.5.4, October 10th, 2014

* Updated module dependencies.

## Version 0.5.3, September 2nd, 2014

* Stop using the deprecated method of sending the HTTP status.
* Gracefully handle errors generated from template files.
* Turn on long stack traces of promises when in development mode.

## Version 0.5.2, August 19th, 2014

* Treat MD5 strings as resource IDs.

## Version 0.5.1, August 7th, 2014

* Use the standard mechanism for registering a controller for the error controller.
  Fixes a bug accessing request.minorjs.*.

## Version 0.5.0, August 7th, 2014

* Changed the router to generate routes for nested resources.
* Added the ability to define a default error controller to handle 404s.
* Show errors encountered while loading Controllers.

## Version 0.4.0, August 4th, 2014

* Fixed parsing of the current page to avoid including IDs and actions like new and edit.

## Version 0.3.0, July 31st, 2014

* Updated module dependencies.
* Changed how we call bodyParser to support the new API.

## Version 0.2.0, July 16th, 2014

* Added better logging when there's a problem loading a controller (rdevaissiere).

## Version 0.1.0, July 16th, 2014

* Bumping up module dependencies.
* Updated documentation.

## Version 0.0.2, May 30th, 2014

* Updated documentation and minor code cleanup.

## Version 0.0.1, May 1st, 2014

* Initial release.
