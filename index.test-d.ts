import { expectType, expectError } from 'tsd';
import { RleEncoder, RleDecoder, version } from '.';

// version
expectType<string>(version);

// RleEncoder
const rleEncoder = new RleEncoder();
expectError(rleEncoder.encode('data'));
expectError(rleEncoder.encode('data', 'opts'));
expectType<Uint8Array>(
  rleEncoder.encode(Uint8Array.from([0x00, 0x7f, 0x00, 0xff, 0x00, 0xff, 0x00, 0x7f, 0x00]), {
    width: 3,
    height: 3,
    bitsAllocated: 8,
    samplesPerPixel: 1,
    planarConfiguration: 0,
  })
);

// RleEncoder
const rleDecoder = new RleDecoder();
expectError(rleDecoder.decode('data'));
expectError(rleDecoder.decode('data', 'opts'));
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
expectType<Uint8Array>(
  rleDecoder.decode(rleData, {
    width: 3,
    height: 3,
    bitsAllocated: 8,
    samplesPerPixel: 1,
    planarConfiguration: 0,
  })
);