const logger = console;

// express middleware for request logging
const morgan = require('morgan');
logger.request = morgan(
  ':method :url :status :res[content-length] - :response-time ms | :remote-addr ":remote-user"',
  {
    stream: {
      write: console.info
    },
    ...(process.env.NODE_ENV === 'production' ? {skip: (req, res) => res.statusCode < 300} : {}),
  }
);

module.exports = logger;
