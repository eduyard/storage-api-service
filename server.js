require('dotenv').config();

const {cluster} = require('./utils');

cluster.start(() => {
  const http = require('http');
  const app = require('./app');
  const logger = require('./logger');

  const listenHost = process.env.HOST || '127.0.0.1';
  const listenPort = process.env.PORT || 8000;
  const httpServer = http.createServer(app);

  httpServer.listen(listenPort, listenHost,
    () => logger.info('App listening at http://%s:%s', listenHost, listenPort));
});
