# MinorJS Changelog

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