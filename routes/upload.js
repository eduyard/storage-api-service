const Joi = require('joi');
const express = require('express');
const router = express.Router();

const {handleError, NotImplementedError} = require('../errors');
const {validate} = require('../middlewares');

router
  .post(
    '/prepare',
    validate({
      body: {
        files: Joi.array().required()
      }
    }),
    (req, res) => {
      try {
        throw new NotImplementedError();
      }
      catch (error) {
        handleError(error, res);
      }
    });

router
  .post(
    '/files/:id',
    (req, res) => {
      try {
        throw new NotImplementedError();
      }
      catch (error) {
        handleError(error, res);
      }
    });

module.exports = router;
