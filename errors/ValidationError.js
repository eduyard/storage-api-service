'use strict';

class ValidationError extends Error {
  constructor (...args) {
    const message = Array.isArray(args[0]) ? 'Validation conditions unmet' : args[0];
    super(message);
    this._messages = Array.isArray(args[0]) ? args[0] : [];
    Error.captureStackTrace(this, ValidationError);
  }

  get messages () {
    return this._messages;
  }

  static get statusCode () {
    return 400;
  }

  static get statusText () {
    return 'validation';
  }
}

module.exports = ValidationError;
