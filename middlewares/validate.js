const Joi = require('joi');

const handleError = require('../errors/handleError');
const ValidationError = require('../errors/ValidationError');

module.exports = (schema) => {
  return (req, res, next) => {
    if (!schema) {
      return next();
    }

    if (!schema.query) {
      schema.query = {};
    }
    schema.query.accessToken = Joi.string().uuid();

    const toValidate = {};
    ['params', 'body', 'query']
      .forEach(key => {
        if (schema[key]) {
          toValidate[key] = req[key];
        }
      });

    Joi.validate(
      toValidate,
      schema,
      {
        abortEarly: false,
      },
      (error, validated) => {
        if (error) {
          const messages = error.details.map(item => {
            return {
              field: item.path[1],
              message: item.message,
            };
          });
          return handleError(new ValidationError(messages), res);
        }

        Object.assign(req, validated);

        next();
      });
  };
};
