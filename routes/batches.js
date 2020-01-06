const express = require('express');
const router = express.Router();

const BatchesController = require('../controllers/Batches');

router.get('/:id',
  BatchesController.getBatchInfoById);

router.delete('/:id',
  BatchesController.deleteBatchById);

module.exports = router;
