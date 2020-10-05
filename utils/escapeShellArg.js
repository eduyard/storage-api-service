module.exports = arg => {
  return ['\'',

    String(arg).replace(/[^\\]'/g, (m, i, s) => m.slice(0, 1) + '\\\''),

    '\''].join('');
};
