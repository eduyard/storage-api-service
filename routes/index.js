const express = require('express');
const router = express.Router();

router.use('/upload', require('./upload'));
router.use('/batches', require('./batches'));
router.use('/transactions', require('./transactions'));
router.use('/files', require('./files'));

module.exports = router;
