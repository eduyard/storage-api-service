const { sourceServers, allowedSources } = require('../constants');

module.exports = (req, res, next) => {
  const { host } = req.headers;
  if (!host) {
    next();
    return;
  }

  let hostname = host.split(':');
  hostname = hostname[0];
  const sourceServer = sourceServers.find(sourceServer => sourceServer.aliases.includes(hostname) && sourceServer.enabled === true);
  if (sourceServer) {
    const isAllowed = allowedSources.some(allowedSource => allowedSource.hostname === sourceServer.hostname && allowedSource.enabled === true);
    if (isAllowed) {
      req.sourceServer = sourceServer;
      next();
      return;
    }
  }

  res.status(204).end();
};
