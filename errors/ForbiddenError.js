'use strict';

class ForbiddenError extends Error {
  constructor (...args) {
    super(...args);
    Error.captureStackTrace(this, ForbiddenError);
  }

  static get statusCode () {
    return 403;
  }

  static get statusText () {
    return 'forbidden';
  }
}

module.exports = ForbiddenError;
