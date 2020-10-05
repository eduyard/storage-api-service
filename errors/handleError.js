const logger = require('../logger');

const BadRequestError = require('./BadRequestError');
const ValidationError = require('./ValidationError');
const UnauthorizedError = require('./UnauthorizedError');
const ForbiddenError = require('./ForbiddenError');
const NotFoundError = require('./NotFoundError');
const NotAllowedError = require('./NotAllowedError');
const NotAcceptableError = require('./NotAcceptableError');
const SystemError = require('./SystemError');
const NotImplementedError = require('./NotImplementedError');

function log (error) {
  if (process.env.NODE_ENV !== 'production') {
    logger.error(error);
  }
}

/**
 * Handles error and responds with appropriate response object.
 * Developed to use with express route handler.
 * Better with try{}.catch(){} blocks.
 *
 * Example:
 *   router.get('/users/:id', async (req, res) => {
 *     try {
 *       const result = await User.findById(req.params.id);
 *       if (!result) throw new ForbiddenError('User not found');
 *       res.status(200).send(result);
 *     }
 *     catch (error) {
 *       handleError(error, res);
 *     }
 *   });
 *
 * @param error
 * @param responseObject
 * @param payload
 */
module.exports = (error, responseObject, payload = null) => {
  switch (error.constructor) {
    case BadRequestError :
    case ValidationError :
    case UnauthorizedError :
    case ForbiddenError :
    case NotFoundError :
    case NotAllowedError :
    case NotAcceptableError :
    case NotImplementedError :
      const data = {
        type: error.constructor.statusText,
        message: error.constructor.message,
      };

      if (error.messages) {
        data.messages = error.messages;
      }

      if (payload) {
        data.payload = payload;
      }

      return responseObject
        .status(error.constructor.statusCode)
        .send(data);
  }

  responseObject
    .status(SystemError.statusCode)
    .send({
      type: SystemError.statusText,
      message: SystemError.message,
      ...(payload ? { payload } : {}),
    });

  log(error);
};
