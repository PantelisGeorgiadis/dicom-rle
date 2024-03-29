const RleDecoder = require('./../src/RleDecoder');

const chai = require('chai');
const expect = chai.expect;

describe('RleDecoder', () => {
  it('should throw for bad attributes', () => {
    expect(() => {
      const rleDecoder = new RleDecoder();
      rleDecoder.decode(Uint8Array.from([]), {
        width: 3,
        bitsAllocated: 8,
        samplesPerPixel: 1,
      });
    }).to.throw();
    expect(() => {
      const rleDecoder = new RleDecoder();
      rleDecoder.decode(Uint8Array.from([]), {
        width: 3,
        height: 3,
        bitsAllocated: 8,
      });
    }).to.throw();
  });

  it('should correctly decode basic RLE data', () => {
    // prettier-ignore
    const rleData = Uint8Array.from([
        // Number of segments
        0x01, 0x00, 0x00, 0x00,
        // First segment offset
        0x40, 0x00, 0x00, 0x00,
        // Other segment offsets
        0x00, 0x00, 0x00, 0x00, // 2
        0x00, 0x00, 0x00, 0x00, // 3
        0x00, 0x00, 0x00, 0x00, // 4
        0x00, 0x00, 0x00, 0x00, // 5
        0x00, 0x00, 0x00, 0x00, // 6
        0x00, 0x00, 0x00, 0x00, // 7
        0x00, 0x00, 0x00, 0x00, // 8
        0x00, 0x00, 0x00, 0x00, // 9
        0x00, 0x00, 0x00, 0x00, // 10
        0x00, 0x00, 0x00, 0x00, // 11
        0x00, 0x00, 0x00, 0x00, // 12
        0x00, 0x00, 0x00, 0x00, // 13
        0x00, 0x00, 0x00, 0x00, // 14
        0x00, 0x00, 0x00, 0x00, // 15
        // RLE data
        0x08, 0x00, 0xff, 0x00, 0xff, 0x00, 0xff, 0x00, 0xff, 0x00
    ]);
    // prettier-ignore
    const expectedDecodedData = Uint8Array.from([    
        0x00, 0xff, 0x00,
        0xff, 0x00, 0xff,
        0x00, 0xff, 0x00,
    ]);

    const rleDecoder = new RleDecoder();
    const decodedData = rleDecoder.decode(rleData, {
      width: 3,
      height: 3,
      bitsAllocated: 8,
      samplesPerPixel: 1,
    });

    const expectedDecodedDataLength = expectedDecodedData.length;
    for (let i = 0; i < expectedDecodedDataLength; i++) {
      expect(decodedData[i]).to.be.eq(expectedDecodedData[i]);
    }
  });

  it('should throw in case of not existing segment decode', () => {
    // prettier-ignore
    const rleData = Uint8Array.from([
        // Number of segments
        0x02, 0x00, 0x00, 0x00,
        // First segment offset
        0x40, 0x00, 0x00, 0x00,
        // Other segment offsets
        0x00, 0x00, 0x00, 0x00, // 2
        0x00, 0x00, 0x00, 0x00, // 3
        0x00, 0x00, 0x00, 0x00, // 4
        0x00, 0x00, 0x00, 0x00, // 5
        0x00, 0x00, 0x00, 0x00, // 6
        0x00, 0x00, 0x00, 0x00, // 7
        0x00, 0x00, 0x00, 0x00, // 8
        0x00, 0x00, 0x00, 0x00, // 9
        0x00, 0x00, 0x00, 0x00, // 10
        0x00, 0x00, 0x00, 0x00, // 11
        0x00, 0x00, 0x00, 0x00, // 12
        0x00, 0x00, 0x00, 0x00, // 13
        0x00, 0x00, 0x00, 0x00, // 14
        0x00, 0x00, 0x00, 0x00, // 15
    ]);
    const rleDecoder = new RleDecoder();
    expect(() => {
      rleDecoder.decode(rleData, {
        width: 3,
        height: 3,
        bitsAllocated: 8,
        samplesPerPixel: 1,
      });
    }).to.throw();
  });
});
