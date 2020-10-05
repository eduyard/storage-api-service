module.exports.start = (callable) => {
  if (process.env.NODE_ENV !== 'production') {
    return callable();
  }

  const logger = require('../logger');
  const cluster = require('cluster');
  let numCPUs = require('os').cpus().length;
  if (numCPUs > 1) numCPUs = parseInt(numCPUs / 3) + 1;
  const instances = numCPUs;

  process.on('uncaughtException', (err) => {
    console.error('uncaughtException:', err.message);
    console.error(err.stack);
  });

  const handleExit = (deadWorker, code) => {
    if (code !== 0) {
      logger.error('Worker', deadWorker.process.pid, 'dead');
      const worker = cluster.fork();
      logger.info('Re-spawning worker', worker.process.pid);
    }
  };
  cluster.on('exit', handleExit);

  let reloading = false;
  process.on('SIGUSR2', () => {
    logger.info('Received reload signal, reloading workers');

    if (!cluster.workers || reloading) {
      return;
    }

    reloading = true;

    let i = 0;
    const workers = Object.keys(cluster.workers);
    const reloadWorker = () => {
      if (i === workers.length) {
        logger.info('Reloading workers complete');
        reloading = false;
        return;
      }

      logger.info(`Killing worker ${workers[i]}`);
      if (cluster.workers[workers[i]]) {
        cluster.workers[workers[i]].on('disconnect', () => {
          logger.info(`Worker ${workers[i]} detached`);
        });
        cluster.workers[workers[i]].disconnect();
      }

      const newWorker = cluster.fork();
      newWorker.on('listening', () => {
        logger.info(`Replacement worker with pid: ${newWorker.process.pid} attached`);
        i++;
        reloadWorker();
      });
    };

    reloadWorker();
  });

  if (!cluster.isMaster) {
    return callable();
  }

  logger.info(`Starting ${instances} instance(s)`);

  for (let i = 0; i < instances; i++) {
    cluster.fork();
  }
};
