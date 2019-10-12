/**
 * NotImplementedError class
 *
 * @extends Error
 */
class NotImplementedError extends Error {
  constructor (...args) {
    super(...args);
    Error.captureStackTrace(this, NotImplementedError);
  }

  static get statusCode () {
    return 501;
  }

  static get statusText () {
    return 'notImplemented';
  }

  static get message () {
    return 'Requested method and/or resource not implemented';
  }
}

module.exports = NotImplementedError;
