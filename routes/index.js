const express = require('express');
const router = express.Router();

router.use('/batches', require('./batches'));
router.use('/files', require('./files'));
router.use('/upload', require('./files')); // alias

router.get('/test', (req, res) => res.sendFile(__dirname + '/test.html'));

module.exports = router;
