const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const mimeTypes = require('mime-types');
const slugify = require('slugify');

const _ = require('lodash');
const { nanoid } = require('nanoid/async');

class DownloadResult {
  #entries;
  #isCleanedUp = false;

  constructor (entries) {
    this.#entries = entries || [];
  }

  async cleanup () {
    await Promise.all(
      this.entries.map(async (entry) => {
        try {
          await entry.delete();
        } catch (error) {
        }
      })
    );
    this.#isCleanedUp = true;

    return this;
  }

  async saveItemById (id, to) {
    if (!this.#isCleanedUp) {
      throw new Error('Downloaded files cleaned up (deleted)');
    }

    const entry = this.entries.find(entry => entry.id === id);
    if (!entry) {
      throw new Error(`File by id: "${id}" not found`);
    }
    return entry.save(to);
  }

  get entries () {
    return this.#entries;
  }

  push (entry) {
    this.#entries.push(entry);
    return this;
  }

  toObject () {
    return this.entries.map(entry => entry.toObject());
  }
}

class FileDownloadEntry {
  id = null;
  url = null;
  originalName = null;
  filename = null;
  tmpFile = null;
  tmpFilename = null;
  file = null;
  tags = [];
  closed = false;
  error = false;
  errorReason = null;
  stats = {};
  #deleted = false;
  #copies = [];

  toObject () {
    const obj = _.pick(this, [
      'id', 'url', 'originalName', 'filename', 'file', 'tags',
      'error', 'errorReason', 'stats',
    ]);
    obj.deleted = this.deleted;
    obj.copies = [...this.#copies];

    return obj;
  }

  assign (data) {
    const keys = Object.keys(this);

    Object
      .keys(data)
      .filter(key => {
        return keys.includes(key);
      })
      .forEach(key => {
        this[key] = data[key];
      });

    return this;
  }

  async save (to) {
    if (this.deleted) {
      throw new Error('File was previously deleted');
    }
    await fsp.copyFile(this.file, to);
    this.#copies.push(to);
  }

  set copies (v) {
    throw new Error('Readonly field');
  }

  get copies () {
    return this.#copies;
  }

  get deleted () {
    return this.#deleted;
  }

  set deleted (v) {
    throw new Error('Readonly field');
  }

  async delete () {
    if (this.deleted) {
      return true;
    }

    await fsp.unlink(this.tmpFile);
    this.#deleted = true;
  }
}

class Downloader {
  #storagePath;

  constructor (storagePath) {
    this.#storagePath = storagePath;
  }

  async downloadFromRemoteUrls (remoteUrls) {
    const entries = [];

    await Promise.all(
      remoteUrls.map(async (url) => {
        const entry = new FileDownloadEntry();
        entry.assign({
          url,
          closed: false,
          error: false,
          errorReason: null,
        });

        try {
          const { pathname } = new URL(url);

          entry.id = await nanoid(32);
          entry.originalName = path.basename(pathname);
          entry.extension = path.extname(entry.originalName).replace('.', '');
          entry.filename =
            slugify(decodeURI(
              path.basename(entry.originalName, path.extname(entry.originalName))
            )) + (entry.extension ? ('.' + entry.extension) : ''); // safe name
          entry.tmpFilename = `${entry.id}${path.extname(entry.originalName)}`;
          entry.tmpFile = path.join(this.#storagePath, entry.tmpFilename);
          entry.mimeType = mimeTypes.lookup(entry.extension) || 'application/octet-stream';
          entry.isImage = entry.mimeType.startsWith('image/');

          await this.downloadFromRemoteUrl(url, entry.tmpFile);

          entry.stats = await fsp.stat(entry.tmpFile);
          entry.stats = _.pick(entry.stats, ['ctime', 'size']);
          entry.stats = { size: entry.stats.size, createdAt: entry.stats.ctime };

          entry.closed = true;
        } catch (error) {
          entry.error = true;
          entry.errorReason = error.message;
        } finally {
          entries.push(entry);
        }
      })
    );

    return new DownloadResult(entries);
  }

  downloadFromRemoteUrl (url, to) {
    return new Promise((resolve, reject) => {
      const filename = path.basename(url);

      if (!(url.startsWith('http://') || url.startsWith('https://'))) {
        return reject(new Error(`Invalid URL: "${url}" does not have valid http(s) protocol prefix`));
      }

      if (!filename) {
        return reject(new Error(`Invalid URL: Cannot extract file name from "${url}"`));
      }

      const writeStream = fs.createWriteStream(to);

      const transport = url.startsWith('https://') ? https : http;
      const transportOptions = {
        rejectUnauthorized: false,
        requestCert: false,
        agent: false,
      };

      // console.log('downloading from:', url, 'to:', to, 'filename:', filename);

      transport.get(url, transportOptions, (response) => {
        const { statusCode } = response;
        if (parseInt(statusCode) !== 200) {
          rejected = true;
          return reject(new Error('Non 200 status code'));
        }
        response.pipe(writeStream);
      });

      let rejected = false;

      writeStream.on('close', () => {
        if (!rejected) {
          resolve(to);
        }
      });

      writeStream.on('error', (error) => {
        rejected = true;
        reject(error);
      });
    });
  }
}

module.exports = {
  Downloader,
  DownloadResult,
  FileDownloadEntry,
};
