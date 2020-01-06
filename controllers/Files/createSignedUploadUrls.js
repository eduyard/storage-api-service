const {handleError, NotImplementedError} = require('../../errors');

module.exports = async (req, res) => {
  try {
    res.status(200).send(req.body);
  }
  catch (error) {
    handleError(error, res);
  }
};