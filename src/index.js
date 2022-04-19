const RleEncoder = require('./RleEncoder');
const RleDecoder = require('./RleDecoder');
const version = require('./version');

const DicomRle = {
  RleEncoder,
  RleDecoder,
  version,
};

//#region Exports
module.exports = DicomRle;
//#endregion
