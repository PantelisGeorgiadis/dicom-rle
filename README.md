[![NPM version][npm-version-image]][npm-url] [![NPM downloads][npm-downloads-image]][npm-url] [![build][build-image]][build-url] [![MIT License][license-image]][license-url] 

# dicom-rle
Javascript DICOM Run Length Encoding Encoder/Decoder for Node.js and Browser.

### Install
#### Node.js

	npm install dicom-rle

#### Browser

	<script type="text/javascript" src="https://unpkg.com/dicom-rle"></script>

### Build

	npm install
	npm run build

### Usage
```js
// Import objects in Node.js
const dicomRle = require('dicom-rle');
const RleEncoder = dicomRle.RleEncoder;
const RleDecoder = dicomRle.RleDecoder;

// Import objects in Browser
const RleEncoder = window.dicomRle.RleEncoder;
const RleDecoder = window.dicomRle.RleDecoder;

// Create image encoding/decoding attributes.
const attrs = {
  // Number of columns in the image.
  width: 128,
  // Number of rows in the image.
  height: 128,
  // Number of bits allocated for each pixel sample.
  bitsAllocated: 8,
  // Number of samples in this image.
  samplesPerPixel: 1,
  // For color images only.
  // Indicates whether the pixel data are sent color-by-plane or color-by-pixel.
  planarConfiguration: 0
};

// Encode uncompressed imageData to encodedData RLE byte stream.
const rleEncoder = new RleEncoder();
const encodedData = rleEncoder.encode(imageData, attrs);

// Decode encodedData RLE byte stream to uncompressed decodedData.
const rleDecoder = new RleDecoder();
const decodedData = rleDecoder.decode(encodedData, attrs);
```

### License
dicom-rle is released under the MIT License.

[npm-url]: https://npmjs.org/package/dicom-rle
[npm-version-image]: https://img.shields.io/npm/v/dicom-rle.svg?style=flat
[npm-downloads-image]: http://img.shields.io/npm/dm/dicom-rle.svg?style=flat

[build-url]: https://github.com/PantelisGeorgiadis/dicom-rle/actions/workflows/build.yml
[build-image]: https://github.com/PantelisGeorgiadis/dicom-rle/actions/workflows/build.yml/badge.svg?branch=master

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE.txt
