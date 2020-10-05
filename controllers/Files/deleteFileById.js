const { handleError, NotImplementedError } = require('../../errors');

module.exports = async (req, res) => {
  try {
    throw new NotImplementedError();
  } catch (error) {
    handleError(error, res);
  }
};
