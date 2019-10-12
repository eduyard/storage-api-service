const randomBytes = require('crypto').randomBytes;

const byteHexMap = [];
for (let i = 0; i < 256; ++i) {
  byteHexMap[i] = (i + 0x100).toString(16).substr(1);
}

/**
 * 16 byte array to UUID as:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const bufferToUuid = (buffer) => {
  let i = 0;
  return [
    byteHexMap[buffer[i++]] + byteHexMap[buffer[i++]] + byteHexMap[buffer[i++]] + byteHexMap[buffer[i++]],
    byteHexMap[buffer[i++]] + byteHexMap[buffer[i++]],
    byteHexMap[buffer[i++]] + byteHexMap[buffer[i++]],
    byteHexMap[buffer[i++]] + byteHexMap[buffer[i++]],
    byteHexMap[buffer[i++]] + byteHexMap[buffer[i++]] + byteHexMap[buffer[i++]] + byteHexMap[buffer[i++]] + byteHexMap[buffer[i++]] + byteHexMap[buffer[i++]]
  ].join('-');
};

module.exports.v4 = () => {
  const rbs = randomBytes(16);

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rbs[6] = (rbs[6] & 0x0f) | 0x40;
  rbs[8] = (rbs[8] & 0x3f) | 0x80;

  return bufferToUuid(rbs);
};
