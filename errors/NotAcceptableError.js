class NotAcceptableError extends Error {
  constructor (...args) {
    const message = Array.isArray(args[0]) ? 'Not acceptable request' : args[0];
    super(message);
    this._messages = Array.isArray(args[0]) ? args[0] : [];
    Error.captureStackTrace(this, NotAcceptableError);
  }

  get messages () {
    return this._messages;
  }

  static get statusCode () {
    return 405;
  }

  static get statusText () {
    return 'notAcceptable';
  }
}

module.exports = NotAcceptableError;
