module.exports = (req, res, next) => {
  req.realIP = (
    req.headers['X-Real-IP'] ||
    req.headers['x-real-ip'] ||
    req.headers['X-Forwarded-For'] ||
    req.headers['x-forwarded-for'] ||
    ''
  ).split(',')[0] || req.client.remoteAddress;
  next();
};
