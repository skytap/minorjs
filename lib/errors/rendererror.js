function RenderError (message) {
    this.name    = 'RenderError';
    this.message = message;
    this.stack   = (new Error()).stack;
}

RenderError.prototype = new Error;

module.exports = RenderError;