//#region RleEncoder
class RleEncoder {
  /**
   * Creates an instance of RleEncoder.
   * @constructor
   */
  constructor() {
    this.count = 0;
    this.offsets = new Array(15).fill(0);
    this.buffer = new Array(132).fill(0);
    this.encodedData = [];
    this.previousByte = -1;
    this.repeatCount = 0;
    this.bufferPosition = 0;
  }

  /**
   * Encodes an image to an RLE byte stream.
   * @method
   * @param {Uint8Array} imageData - Image data.
   * @param {object} attrs - Encoded byte stream image attributes.
   * @param {number} attrs.width - Number of columns in the image (0028,0011).
   * @param {number} attrs.height - Number of rows in the image (0028,0010).
   * @param {number} attrs.bitsAllocated - Number of bits allocated for each pixel sample (0028,0100).
   * @param {number} attrs.samplesPerPixel - Number of samples in this image (0028,0002).
   * @param {number} [attrs.planarConfiguration] - For color images only -
   * Indicates whether the pixel data are sent color-by-plane or color-by-pixel (0028,0006).
   * @returns {Uint8Array} RLE encoded data.
   */
  encode(imageData, attrs) {
    attrs = attrs || {};
    const planarConfiguration = attrs.planarConfiguration || 0;
    if (!attrs.width || !attrs.height) {
      throw new Error(`Width/height has an invalid value [w: ${attrs.width}, h: ${attrs.height}]`);
    }
    if (!attrs.bitsAllocated || !attrs.samplesPerPixel) {
      throw new Error(
        `Bits allocated/samples per pixel has an invalid value [allocated: ${attrs.bitsAllocated}, samples: ${attrs.samplesPerPixel}]`
      );
    }

    let bytesAllocated = attrs.bitsAllocated / 8 + (attrs.bitsAllocated % 8 === 0 ? 0 : 1);
    const pixelCount = attrs.width * attrs.height;
    let imageSize = pixelCount * bytesAllocated * attrs.samplesPerPixel;
    if ((imageSize & 1) === 1) {
      imageSize++;
    }

    const numberOfSegments = bytesAllocated * attrs.samplesPerPixel;

    for (let s = 0; s < numberOfSegments; s++) {
      this._nextSegment();

      const sample = Math.trunc(s / bytesAllocated);
      const sabyte = Math.trunc(s % bytesAllocated);

      let pos, offset;
      if (planarConfiguration === 0) {
        pos = sample * bytesAllocated;
        offset = numberOfSegments;
      } else {
        pos = sample * bytesAllocated * pixelCount;
        offset = bytesAllocated;
      }

      pos += bytesAllocated - sabyte - 1;

      for (let p = 0; p < pixelCount; p++) {
        if (pos >= imageData.length) {
          throw new Error('Read position is past end of frame buffer');
        }
        this._encode(imageData[pos]);
        pos += offset;
      }
      this._flush();
    }

    this._makeEvenLength();
    this._flush();
    this._writeHeader();

    return new Uint8Array(this.encodedData);
  }

  /**
   * Encodes a byte into the RLE byte stream.
   * @method
   * @private
   * @param {number} b - Byte to encode.
   */
  _encode(b) {
    if (b === this.previousByte) {
      this.repeatCount++;

      if (this.repeatCount > 2 && this.bufferPosition > 0) {
        while (this.bufferPosition > 0) {
          const count = Math.min(128, this.bufferPosition);
          this.encodedData.push(count - 1);
          this._moveBuffer(count);
        }
      } else if (this.repeatCount > 128) {
        const count = Math.min(this.repeatCount, 128);
        this.encodedData.push(257 - count);
        this.encodedData.push(this.previousByte);
        this.repeatCount -= count;
      }
    } else {
      switch (this.repeatCount) {
        case 0:
          break;
        case 1: {
          this.buffer[this.bufferPosition++] = this.previousByte;
          break;
        }
        case 2: {
          this.buffer[this.bufferPosition++] = this.previousByte;
          this.buffer[this.bufferPosition++] = this.previousByte;
          break;
        }
        default: {
          while (this.repeatCount > 0) {
            const count = Math.min(this.repeatCount, 128);
            this.encodedData.push(257 - count);
            this.encodedData.push(this.previousByte);
            this.repeatCount -= count;
          }

          break;
        }
      }

      while (this.bufferPosition > 128) {
        const count = Math.min(128, this.bufferPosition);
        this.encodedData.push(count - 1);
        this._moveBuffer(count);
      }

      this.previousByte = b;
      this.repeatCount = 1;
    }
  }

  /**
   * Creates a new segment in the RLE byte stream.
   * @method
   * @private
   */
  _nextSegment() {
    this._flush();
    if ((this.encodedData.length & 1) === 1) {
      this.encodedData.push(0x00);
    }
    this.offsets[this.count++] = this.encodedData.length;
  }

  /**
   * Ensures that the RLE byte stream has an even length.
   * @method
   * @private
   */
  _makeEvenLength() {
    if (this.encodedData.length % 2 === 1) {
      this.encodedData.push(0x00);
    }
  }

  /**
   * Flushes the working buffer to the RLE byte stream.
   * @method
   * @private
   */
  _flush() {
    if (this.repeatCount < 2) {
      while (this.repeatCount > 0) {
        this.buffer[this.bufferPosition++] = this.previousByte;
        this.repeatCount--;
      }
    }

    while (this.bufferPosition > 0) {
      const count = Math.min(128, this.bufferPosition);
      this.encodedData.push(count - 1);
      this._moveBuffer(count);
    }

    if (this.repeatCount >= 2) {
      while (this.repeatCount > 0) {
        const count = Math.min(this.repeatCount, 128);
        this.encodedData.push(257 - count);
        this.encodedData.push(this.previousByte);
        this.repeatCount -= count;
      }
    }

    this.previousByte = -1;
    this.repeatCount = 0;
    this.bufferPosition = 0;
  }

  /**
   * Writes the working buffer to the RLE byte stream.
   * @method
   * @private
   * @param {number} count - Number of items to write.
   */
  _moveBuffer(count) {
    for (let i = 0; i < count; i++) {
      this.encodedData.push(this.buffer[i]);
    }
    for (let i = count, n = 0; i < this.bufferPosition; i++, n++) {
      this.buffer[n] = this.buffer[i];
    }

    this.bufferPosition = this.bufferPosition - count;
  }

  /**
   * Writes the RLE byte stream header.
   * @method
   * @private
   */
  _writeHeader() {
    const headerArrayBuffer = new ArrayBuffer(
      Uint32Array.BYTES_PER_ELEMENT + 15 * Int32Array.BYTES_PER_ELEMENT
    );
    const headerDataView = new DataView(headerArrayBuffer);
    headerDataView.setUint32(0, this.count, true);
    for (let i = 0; i < this.count; i++) {
      this.offsets[i] += Uint32Array.BYTES_PER_ELEMENT + 15 * Int32Array.BYTES_PER_ELEMENT;
    }
    for (let i = 0; i < 15; i++) {
      headerDataView.setInt32(
        Uint32Array.BYTES_PER_ELEMENT + i * Int32Array.BYTES_PER_ELEMENT,
        this.offsets[i],
        true
      );
    }
    this.encodedData = [...new Uint8Array(headerArrayBuffer)].concat(this.encodedData);
  }
}

//#region Exports
module.exports = RleEncoder;
//#endregion
