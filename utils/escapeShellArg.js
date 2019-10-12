module.exports = arg =>
  "'" +
    String(arg)
      .replace(
        /[^\\]'/g,
        (m, i, s) => m.slice(0, 1) + '\\\''
      ) +
    "'";
