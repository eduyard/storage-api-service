const express = require('express');
const router = express.Router();

const Joi = require('joi');

const {handleError, NotImplementedError} = require('../errors');

router
  .get(
    '/:id',
    (req, res) => {
      try {
        throw new NotImplementedError();
      }
      catch (error) {
        handleError(error, res);
      }
    });

router
  .delete(
    '/:id',
    (req, res) => {
      try {
        throw new NotImplementedError();
      }
      catch (error) {
        handleError(error, res);
      }
    });

module.exports = router;
