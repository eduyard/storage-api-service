const fs = require('fs');

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
    const sourceServer = req.sourceServer;
    let { url } = req;
    url = `${sourceServer.protocol}://${sourceServer.hostname}${url}`;

    const downloader = new Downloader(STORAGE_TMP_PATH);
    result = await downloader.downloadFromRemoteUrls([url]);

    await saveFiles(result);

    const [{ file }] = result.entries;

    fs.createReadStream(file).pipe(res);
  } catch (error) {
    handleError(error, res, { reason: error.message });
  } finally {
    await result.cleanup();
  }
};
