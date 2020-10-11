const { handleError } = require('../../errors');

const { STORAGE_TMP_PATH, STORAGE_FILES_PATH } = process.env;

const { Downloader } = require('./utils/downloader');

const saveFiles = async (downloadResult) => {
  if (downloadResult.entries.length === 0) return [];

  downloadResult
    .entries
    .filter(f => f.closed === true && f.error === false);
  // ToDo: create Batch record
  //
  // ToDo: create File record
  //
  // ToDo: create data/files/{id} folder
  //
  // ToDo: move file to unique folder
  //

  return downloadResult;
};

module.exports = async (req, res) => {
  let result;

  try {
    const { files: toDownload } = req.body;

    const downloader = new Downloader(STORAGE_TMP_PATH);
    result = await downloader.downloadFromRemoteUrls(toDownload.map(f => f.url));

    result.entries.forEach((entry, i) => {
      entry.tags = toDownload[i].tags || [];
    });

    await saveFiles(result);

    res.status(200).send({ result: result.toObject() });
  } catch (error) {
    handleError(error, res, { reason: error.message });
  } finally {
    await result.cleanup();
  }
};
