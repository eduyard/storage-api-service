const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const { URL } = require('url');

const { nanoid } = require('nanoid/async');

const { handleError } = require('../../errors');

const { STORAGE_TMP_PATH, STORAGE_FILES_PATH } = process.env;

const db = require('../../database');
const File = db.model('File');

const { Downloader } = require('./utils/downloader');

const saveFiles = async (downloadResult) => {
  if (downloadResult.entries.length === 0) return [];
  const entries = downloadResult.entries.filter(f => f.closed === true && f.error === false);

  downloadResult.entries = await Promise.all(
    entries.map(async (entry) => {
      const id = entry.id && entry.id.length === 32 ? entry.id : await nanoid(32);
      const { originalName, filename, tmpFile, mimeType, extension, isImage, stats, tags } = entry;
      const filePath = path.join(STORAGE_FILES_PATH, ...id.match(/.{1,8}/g));
      const url = new URL(entry.url);

      entry.id = id;
      entry.file = path.join(filePath, entry.filename);

      const file = new File({
        _id: id,
        name: filename,
        originalName,
        extension,
        mimeType,
        isImage,
        size: stats.size,
        tags,
        sourceServerUrl: entry.url,
        sourceServerAliasUrlPath: url.pathname,
      });

      try {
        await file.save();
        await fsp.mkdir(filePath, { recursive: true });
        await fsp.rename(tmpFile, entry.file);

        file.set({ completed: true });
        await file.save();
      } catch (error) {
        entry.error = true;
        entry.errorReason = error.message;

        try {
          await fsp.rmdir(filePath, { recursive: true });
        } catch {}
      }

      return entry;
    })
  );

  return downloadResult;
};

const deliverFileAsResponse = async (file, res, pipe = false, filePath = null) => {
  if (!filePath) {
    filePath = path.join(STORAGE_FILES_PATH, ...file._id.match(/.{1,8}/g), file.name);
  }

  await fsp.access(filePath, fs.constants.F_OK);

  if (!pipe) {
    return res.status(200).send(file);
  }
  res.setHeader('Cache-control', 'public, max-age=604800');
  res.setHeader('Last-Modified', (new Date(file.createdAt)).toUTCString());
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Length', file.size);
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
  stream.on('end', () => {
    try { stream.unpipe(res); } catch (error) { console.log('UNPIPE:', error.message); }
    try { stream.close(); } catch (error) { console.log('CLOSE:', error.message); }
    try { stream.destroy(); } catch (error) { console.log('DESTROY:', error.message); }
  });
  res.on('close', () => {
    try { stream.unpipe(res); } catch (error) { console.log('UNPIPE:', error.message); }
    try { stream.close(); } catch (error) { console.log('CLOSE:', error.message); }
    try { stream.destroy(); } catch (error) { console.log('DESTROY:', error.message); }
  });
};

module.exports = async (req, res, pipe = false) => {
  let result, file;
  const sourceServer = req.sourceServer;
  let url = req.body && req.body.url ? req.body.url : req.url;

  try {
    const decodedUrl = `${sourceServer.protocol}://${sourceServer.hostname}${decodeURI(url)}`;
    const encodedUrl = `${sourceServer.protocol}://${sourceServer.hostname}${encodeURI(url)}`;
    url = `${sourceServer.protocol}://${sourceServer.hostname}${url}`;

    file = await File.findOne({ $or: [{ sourceServerUrl: url }, { sourceServerUrl: decodedUrl }] });
    if (file && file.completed) {
      await deliverFileAsResponse(file, res, pipe);
      return;
    }

    if (file) {
      await file.delete();
    }

    const downloader = new Downloader(STORAGE_TMP_PATH);
    result = await downloader.downloadFromRemoteUrls([url]);

    await saveFiles(result, []);

    const [{ file: filePath }] = result.entries;

    file = await File.findOne({ sourceServerUrl: url }).lean();
    if (!file || file.completed === false) {
      return res.status(204).end();
    }

    await deliverFileAsResponse(file, res, pipe, filePath);
  } catch (error) {
    console.log(url);
    console.log(error);
    handleError(error, res, { reason: error.message });
  } finally {
    if (result) {
      await result.cleanup();
    }
  }
};
