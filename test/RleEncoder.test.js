const RleEncoder = require('./../src/RleEncoder');

const chai = require('chai');
const expect = chai.expect;

describe('RleEncoder', () => {
  it('should throw for bad attributes', () => {
    expect(() => {
      const rleDecoder = new RleEncoder();
      rleEncoder.encode(Uint8Array.from([]), {
        width: 3,
        bitsAllocated: 8,
        samplesPerPixel: 1,
      });
    }).to.throw();
    expect(() => {
      const rleEncoder = new RleEncoder();
      rleEncoder.encode(Uint8Array.from([]), {
        width: 3,
        height: 3,
        bitsAllocated: 8,
      });
    }).to.throw();
  });

  it('should correctly encode basic RLE data', () => {
    // prettier-ignore
    const imageData = Uint8Array.from([    
        0x00, 0xff, 0x00,
        0xff, 0x00, 0xff,
        0x00, 0xff, 0x00,
    ]);
    // prettier-ignore
    const expectedEncodedData = Uint8Array.from([
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

    const rleEncoder = new RleEncoder();
    const encodedData = rleEncoder.encode(imageData, {
      width: 3,
      height: 3,
      bitsAllocated: 8,
      samplesPerPixel: 1,
    });

    const expectedEncodedDataLength = expectedEncodedData.length;
    for (let i = 0; i < expectedEncodedDataLength; i++) {
      expect(encodedData[i]).to.be.eq(expectedEncodedData[i]);
    }
  });
});
