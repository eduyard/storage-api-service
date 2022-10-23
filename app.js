const pkg = require('./package.json');
process.env.serviceName = pkg.name;
process.env.serviceVersion = pkg.version;

const env = require('dotenv');
env.config();

const fs = require('fs').promises;
const path = require('path');
const { nanoid } = require('nanoid');

const framework = require('express');

const db = require('./database');
const logger = require('./logger');
const middlewares = require('./middlewares');

async function preCheckup () {
  try {
    if (process.env.NODE_ENV === 'local') {
      process.env.STORAGE_TMP_PATH = path.join(__dirname, 'data', 'uploads');
      process.env.STORAGE_FILES_PATH = path.join(__dirname, 'data', 'files');

      await fs.mkdir(process.env.STORAGE_TMP_PATH, { recursive: true });
      await fs.mkdir(process.env.STORAGE_FILES_PATH, { recursive: true });
    }
  } catch (error) {
    logger.error(error.message);
    process.exitCode = -2;
    process.exit();
  }
}

async function doCheckup () {
  try {
    logger.info(`Checking TMP folder (${process.env.STORAGE_TMP_PATH}) for accessibility`);
    const tmpPathStat = await fs.stat(process.env.STORAGE_TMP_PATH);
    if (!tmpPathStat.isDirectory()) {
      throw new Error(`${process.env.STORAGE_TMP_PATH} is not directory`);
    }

    logger.info(`Checking TMP folder (${process.env.STORAGE_TMP_PATH}) for writability`);
    const testFile1 = path.join(process.env.STORAGE_TMP_PATH, `.${nanoid(64)}.testfile`);
    await fs.writeFile(testFile1, nanoid(1024));
    await fs.unlink(testFile1);

    logger.info(`Checking FILES folder (${process.env.STORAGE_FILES_PATH}) for accessibility`);
    const filesPathStat = await fs.stat(process.env.STORAGE_FILES_PATH);
    if (!filesPathStat.isDirectory()) {
      throw new Error(`${process.env.STORAGE_FILES_PATH} is not directory`);
    }

    logger.info(`Checking FILES folder (${process.env.STORAGE_FILES_PATH}) for writability`);
    const testFile2 = path.join(process.env.STORAGE_FILES_PATH, `.${nanoid(64)}.testfile`);
    await fs.writeFile(testFile2, nanoid(1024));
    await fs.unlink(testFile2);
  } catch (error) {
    logger.error(error.message);
    process.exitCode = -1;
    process.exit();
  }
}

async function createApp () {
  await preCheckup();
  await doCheckup();

  logger.info('\nCheckups finished successfully\n');

  const app = framework();

  app.set('trust proxy', 1);
  app.use(middlewares.cleanUnwantedHeaders);
  app.use(middlewares.cors());
  app.get('/', (req, res) => {
    res.status(200).send({
      type: 'service',
      name: process.env.serviceName,
      version: process.env.serviceVersion,
    });
  });
  app.use(middlewares.bodyParser.json({ limit: '1mb' }));
  app.use(middlewares.bodyParser.urlencoded({ limit: '1mb', extended: false }));
  app.use(middlewares.catchRealIP);
  app.use(logger.request);
  app.use(require('./routes'));

  app.use((error, req, res, next) => {
    const { message } = error;
    if (message.indexOf('JSON')) {
      return res.status(400).send({ message });
    }

    logger.error(error);
    res.status(500).send({ message });
  });

  return app;
}

async function boot () {
  process.env.originator = require('./package.json').name;
  process.env.version = require('./package.json').version;

  await db.connect();
  
  const app = await createApp();
  
  return app;
}

module.exports = {
  createApp,
  boot,
};
