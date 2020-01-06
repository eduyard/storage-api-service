const express = require('express');
const router = express.Router();

const Joi = require('joi');

const FilesController = require('../controllers/Files');
const {validate} = require('../middlewares');

// creating signed upload urls
router.post('/prepare',
  validate({
    body: {
      files: Joi.array().items(
        Joi.object().keys({
          filename: Joi.string().required(),
          size: Joi.number().integer().required(),
          tags: Joi.array().items(Joi.string()).default([])
        })
      ).required()
    }
  }),
  FilesController.createSignedUploadUrls);

// upload single file by prepared (signed) url (has limitation per file size)
router.post('/:id',
  FilesController.handleFileThroughSignedUploadUrl);

// direct upload multiple files without signing (has overall limitation on multiple files)
router.post('/',
  FilesController.handleDirectFilesUpload);

router.get('/:id',
  FilesController.getFileInfoById);

router.delete('/:id',
  FilesController.deleteFileById);

module.exports = router;
