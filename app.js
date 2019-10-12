require('dotenv').config();

process.env.originator = require('./package.json').name;
process.env.version = require('./package.json').version;

const logger = require('./logger');

// LOADING NECESSARY PACKAGES & COMPONENTS
require('./database').connect();
const middlewares = require('./middlewares');
const framework = require('express');
const app = framework();

// APPLICATION BOOTSTRAP
app.set('trust proxy', 1);
app.use(middlewares.cleanUnwantedHeaders);
app.use(middlewares.cors());
app.get('/', (req, res) => {
  res.status(200).send({
    type: 'service',
    name: process.env.originator,
    version: process.env.version
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

process.on('uncaughtException', (error) => {
  logger.error(error);
});

process.on('unhandledRejection', (error) => {
  logger.error(error);
});

process.on('warning', (warning) => {
  logger.warn(warning);
});

module.exports = app;
