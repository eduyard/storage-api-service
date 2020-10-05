const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { nanoid } = require('nanoid/async');

const logger = require('./../../logger');
const { handleError, NotImplementedError } = require('../../errors');

const { STORAGE_TMP_PATH, STORAGE_FILES_PATH } = process.env;

const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

const saveFiles = async (files) => {
  if (files.length === 0) return [];

  // ToDo: create Batch record
  //
  // ToDo: create File record
  //
  // ToDo: create data/files/{id} folder
  //
  // ToDo: move file to unique folder
  //

  return files;
};

function cleanup (files) {
  files.forEach(fileInfo => {
    if (fileInfo.error) {
      fs.unlink(fileInfo.tmpFile, () => {});
    }
  });
}

module.exports = async (req, res) => {
  const files = [];

  try {
    const { files: filesToDownload } = req.body;

    for (const fileToDownload of filesToDownload) {
      const { remoteUrl, tags } = fileToDownload;

      const filename = path.basename(remoteUrl);
      if (!filename) continue;
      if (!(remoteUrl.startsWith('http://') || remoteUrl.startsWith('https://'))) continue;

      const fileInfo = {
        remoteUrl,
        filename,
        closed: false,
        error: false,
        errorReason: null,
      };

      try {
        const rnd = await nanoid(64);
        fileInfo.tmpFile = path.join(STORAGE_TMP_PATH, `${rnd}${path.extname(filename)}`);

        const writeStream = fs.createWriteStream(fileInfo.tmpFile);

        const transport = remoteUrl.startsWith('https://') ? https : http;
        const transportOptions = {
          rejectUnauthorized: false,
          requestCert: false,
          agent: false,
        };
        transport.get(remoteUrl, transportOptions, (response) => {
          response.pipe(writeStream);
        });

        writeStream.on('close', () => {
          fileInfo.closed = true;
        });

        writeStream.on('error', (error) => {
          fileInfo.error = true;
          fileInfo.errorReason = error.message;
        });

        while (!(fileInfo.closed || fileInfo.error)) {
          await delay(100);
        }
      } catch (error) {
        fileInfo.error = true;
        fileInfo.errorReason = error.message;
      } finally {
        files.push(fileInfo);
      }
    }

    await saveFiles(files);

    res.status(201).send({ result: files });
  } catch (error) {
    handleError(error, res, { reason: error.message });
  } finally {
    cleanup(files);
  }
};
