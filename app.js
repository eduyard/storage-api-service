require('dotenv').config();

process.env.serviceName = require('./package.json').name;
process.env.serviceVersion = require('./package.json').version;

const logger = require('./logger');
const {handleError, SystemError, BadRequestError} = require('./errors');

// LOADING NECESSARY PACKAGES & COMPONENTS
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
  try {
    const {message} = error;
    if(message.indexOf('JSON')) {
      throw new BadRequestError(message);
    }
    logger.error(error);
    throw new SystemError();
  }
  catch (error) {
    handleError(error, res);
  }
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
