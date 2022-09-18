declare class RleEncoder {
  /**
   * Encodes an image to an RLE byte stream.
   */
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
  /**
   * Decodes an RLE encoded byte stream.
   */
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

/**
 * Version.
 */
declare const version: string;

export { RleEncoder, RleDecoder, version };
