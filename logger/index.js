const winston = require('winston');
const ConsoleTransport = winston.transports.Console;

const transports = [];
const exceptionHandlers = [];

// Transport for logging to console
const consoleTransport = new ConsoleTransport({
  level: 'debug',
  colorize: true,
  humanReadableUnhandledException: true,
  timestamp: true
});
transports.push(consoleTransport);
exceptionHandlers.push(consoleTransport);

// Creating logger instance
const
  logger = new winston.Logger({
    transports,
    exitOnError: true
  });

// Handling Unhandled Exceptions
logger.handleExceptions(exceptionHandlers);

// express middleware for request logging
const morgan = require('morgan');
logger.request = morgan(
  'tiny',
  {
    stream: {
      write: logger.info
    }
  }
);

module.exports = logger;
