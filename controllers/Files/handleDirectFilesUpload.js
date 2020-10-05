const path = require('path');
const fs = require('fs');
const Busboy = require('busboy');
const { handleError, NotImplementedError } = require('../../errors');

const { STORAGE_TMP_PATH, STORAGE_FILES_PATH } =
  process.env.NODE_ENV === 'local'
    ? ({
      STORAGE_TMP_PATH: path.join(__dirname, '..', '..', 'data', 'uploads'),
      STORAGE_FILES_PATH: path.join(__dirname, '..', '..', 'data', 'files'),
    })
    : process.env;

const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));
const waitFilesToBeClosed = async (files) => {
  if (files.length === 0) return;

  let openFiles = 0;
  for (const file of files) {
    if (file.closed === true || file.error === true) {
      continue;
    }
    openFiles++;
  }

  if (openFiles > 0) {
    await delay();
    return waitFilesToBeClosed(files);
  }
};

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

module.exports = async (req, res) => {
  try {
    const files = [];

    const busboy = new Busboy({ headers: req.headers });

    busboy.on('file', (fieldName, readStream, filename) => {
      const tmpFile = path.join(STORAGE_TMP_PATH, filename);
      const writeStream = fs.createWriteStream(tmpFile);
      const fileInfo = {
        filename,
        tmpFile,
        closed: false,
        error: false,
        errorReason: null,
      };
      files.push(fileInfo);

      writeStream.on('error', (error) => {
        fileInfo.error = true;
        fileInfo.errorReason = error.message;
      });

      writeStream.on('close', () => {
        fileInfo.closed = true;
      });

      readStream.pipe(writeStream);
    });

    busboy.on('finish', async () => {
      await waitFilesToBeClosed(files);
      const result = await saveFiles(files);
      res.status(201).send({ result });
    });

    req.pipe(busboy);
  } catch (error) {
    handleError(error, res);
  }
};
