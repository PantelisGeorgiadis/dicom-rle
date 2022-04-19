const RleEncoder = require('./../src/RleEncoder');
const RleDecoder = require('./../src/RleDecoder');

const chai = require('chai');
const expect = chai.expect;

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

describe('DicomRle', () => {
  it('should correctly encode and decode random grayscale RLE data', () => {
    const width = getRandomInteger(1, 256);
    const height = getRandomInteger(1, 256);
    const bytesAllocated = getRandomInteger(1, 2);
    const imageData = new Uint8Array(
      new Array(bytesAllocated * width * height).fill(0).map(() => getRandomInteger(0, 255))
    );
    const rleEncoder = new RleEncoder();
    const encodedData = rleEncoder.encode(imageData, {
      width,
      height,
      bitsAllocated: bytesAllocated * 8,
      samplesPerPixel: 1,
    });

    const rleDecoder = new RleDecoder();
    const decodedData = rleDecoder.decode(encodedData, {
      width,
      height,
      bitsAllocated: bytesAllocated * 8,
      samplesPerPixel: 1,
    });

    for (let i = 0; i < bytesAllocated * width * height; i++) {
      expect(imageData[i]).to.be.eq(decodedData[i]);
    }
  });

  it('should correctly encode and decode random color RLE data', () => {
    const width = getRandomInteger(1, 256);
    const height = getRandomInteger(1, 256);
    const planarConfiguration = getRandomInteger(0, 1);
    const imageData = new Uint8Array(
      new Array(3 * width * height).fill(0).map(() => getRandomInteger(0, 255))
    );
    const rleEncoder = new RleEncoder();
    const encodedData = rleEncoder.encode(imageData, {
      width,
      height,
      bitsAllocated: 8,
      samplesPerPixel: 3,
      planarConfiguration,
    });

    const rleDecoder = new RleDecoder();
    const decodedData = rleDecoder.decode(encodedData, {
      width,
      height,
      bitsAllocated: 8,
      samplesPerPixel: 3,
      planarConfiguration,
    });

    for (let i = 0; i < 3 * width * height; i++) {
      expect(imageData[i]).to.be.eq(decodedData[i]);
    }
  });
});
