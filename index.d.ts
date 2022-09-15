declare class RleEncoder {
  encode(
    imageData: Uint8Array,
    attrs: {
      width: number;
      height: number;
      bitsAllocated: number;
      samplesPerPixel: number;
      planarConfiguration?: number;
    }
  ): Uint8Array;
}

declare class RleDecoder {
  decode(
    encodedData: Uint8Array,
    attrs: {
      width: number;
      height: number;
      bitsAllocated: number;
      samplesPerPixel: number;
      planarConfiguration?: number;
    }
  ): Uint8Array;
}

declare const version: string;

export { RleEncoder, RleDecoder, version };
