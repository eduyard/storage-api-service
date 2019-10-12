'use strict';

class UnauthorizedError extends Error {
  constructor (...args) {
    super(...args);
    Error.captureStackTrace(this, UnauthorizedError);
  }

  static get statusCode () {
    return 401;
  }

  static get statusText () {
    return 'unauthorized';
  }
}

module.exports = UnauthorizedError;
