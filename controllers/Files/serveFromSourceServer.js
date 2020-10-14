const copyFromSourceServer = require('./copyFromSourceServer');

module.exports = async (req, res) => {
  await copyFromSourceServer(req, res, true);
};
