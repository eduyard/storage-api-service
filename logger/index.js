const logger = console;

// express middleware for request logging
const morgan = require('morgan');
logger.request = morgan(
  ':method :url :status :res[content-length] - :response-time ms | :remote-addr ":remote-user"',
  {
    stream: {
      write: console.info
    }
  }
);

module.exports = logger;
