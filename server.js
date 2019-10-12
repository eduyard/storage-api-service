require('dotenv').config();

const clusterRoutine = async () => {
  const http = require('http');
  const app = require('./app');
  const logger = require('./logger');
  
  await require('./database').connect();
  
  const listenHost = process.env.HOST || '127.0.0.1';
  const listenPort = process.env.PORT || 8000;
  const httpServer = http.createServer(app);
  
  httpServer.listen(listenPort, listenHost,
    () => logger.info('App listening at http://%s:%s', listenHost, listenPort));
};

const cluster = require('./utils').cluster;
cluster.start(clusterRoutine);
