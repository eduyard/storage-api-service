const env = require('dotenv');
const framework = require('express');

const db = require('./database');
const logger = require('./logger');
const middlewares = require('./middlewares');

function createApp () {
  const app = framework();

  app.set('trust proxy', 1);
  app.use(middlewares.cleanUnwantedHeaders);
  app.use(middlewares.cors());
  app.get('/', (req, res) => {
    res.status(200).send({
      type: 'service',
      name: process.env.serviceName,
      version: process.env.serviceVersion
    });
  });
  app.use(middlewares.bodyParser.json({limit: '1mb'}));
  app.use(middlewares.bodyParser.urlencoded({limit: '1mb', extended: false}));
  app.use(middlewares.catchRealIP);
  app.use(logger.request);
  app.use(require('./routes'));

  app.use((error, req, res, next) => {
    const {message} = error;
    if (message.indexOf('JSON')) {
      return res.status(400).send({message});
    }

    logger.error(error);
    res.status(500).send({message});
  });

  return app;
}

async function boot () {
  env.config();
  
  process.env.originator = require('./package.json').name;
  process.env.version = require('./package.json').version;
  
  await db.connect();
  
  return createApp();
}

module.exports = {
  createApp,
  boot,
};
