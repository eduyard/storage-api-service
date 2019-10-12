'use strict';

class NotFoundError extends Error {
  constructor (...args) {
    super(...args);
    Error.captureStackTrace(this, NotFoundError);
  }

  static get statusCode () {
    return 404;
  }

  static get statusText () {
    return 'notFound';
  }
}

module.exports = NotFoundError;
