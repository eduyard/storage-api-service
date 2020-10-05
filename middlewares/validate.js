const Joi = require('joi');

const handleError = require('../errors/handleError');
const ValidationError = require('../errors/ValidationError');

module.exports = (schema) => {
  return async (req, res, next) => {
    if (!schema) {
      return next();
    }

    if (!schema.query) {
      schema.query = {};
    }

    try {
      const toValidate = {};
      ['params', 'body', 'query']
        .forEach(key => {
          if (schema[key]) {
            toValidate[key] = req[key];
          }
        });

      const validation = Joi.object(schema);
      const validated = await validation.validateAsync(toValidate);

      Object.assign(req, validated);

      next();
    } catch (error) {
      const messages = error.details.map(item => {
        return {
          field: item.path[1],
          message: item.message,
        };
      });
      return handleError(new ValidationError(messages), res);
    }
  };
};
