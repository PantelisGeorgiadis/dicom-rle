//#region RleDecoder
class RleDecoder {
  /**
   * Decodes an RLE encoded byte stream.
   * @method
   * @param {Uint8Array} encodedData - RLE encoded data.
   * @param {object} attrs - Encoded byte stream image attributes.
   * @param {number} attrs.width - Number of columns in the image (0028,0011).
   * @param {number} attrs.height - Number of rows in the image (0028,0010).
   * @param {number} attrs.bitsAllocated - Number of bits allocated for each pixel sample (0028,0100).
   * @param {number} attrs.samplesPerPixel - Number of samples in this image (0028,0002).
   * @param {number} [attrs.planarConfiguration] - For color images only -
   * Indicates whether the pixel data are sent color-by-plane or color-by-pixel (0028,0006).
   * @returns {Uint8Array} Decoded data.
   * @throws Error if width/height/bits allocated/samples per pixel has an invalid value or
   * the number of RLE segments is unexpected.
   */
  decode(encodedData, attrs) {
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

    const bytesAllocated = attrs.bitsAllocated / 8 + (attrs.bitsAllocated % 8 === 0 ? 0 : 1);
    const pixelCount = attrs.width * attrs.height;
    let imageSize = pixelCount * bytesAllocated * attrs.samplesPerPixel;
    if ((imageSize & 1) === 1) {
      imageSize++;
    }

    const decodedData = new Uint8Array(imageSize);
    const numberOfSegments = bytesAllocated * attrs.samplesPerPixel;

    const view = new DataView(encodedData.buffer);
    this.numberOfSegments = view.getInt32(0, true);
    if (this.numberOfSegments !== numberOfSegments) {
      throw new Error(
        `Unexpected number of RLE segments [expected: ${numberOfSegments}, got: ${this.numberOfSegments}]`
      );
    }

    this.offsets = [];
    for (let i = 0; i < 15; i++) {
      this.offsets[i] = view.getInt32(Int32Array.BYTES_PER_ELEMENT * (i + 1), true);
    }

    this.data = encodedData;

    for (let s = 0; s < numberOfSegments; s++) {
      let pos, offset;
      const sample = Math.trunc(s / bytesAllocated);
      const sabyte = Math.trunc(s % bytesAllocated);
      if (planarConfiguration === 0) {
        pos = sample * bytesAllocated;
        offset = attrs.samplesPerPixel * bytesAllocated;
      } else {
        pos = sample * bytesAllocated * pixelCount;
        offset = bytesAllocated;
      }
      pos += bytesAllocated - sabyte - 1;
      this._decodeSegment(s, decodedData, pos, offset);
    }

    return decodedData;
  }

  //#region Private Methods
  /**
   * Gets number of segments.
   * @method
   * @private
   * @returns {number} Number of segments.
   */
  _getNumberOfSegments() {
    return this.numberOfSegments;
  }

  /**
   * Gets segment offset.
   * @method
   * @private
   * @param {number} segment - Segment index.
   * @returns {number} Segment offset.
   */
  _getSegmentOffset(segment) {
    return this.offsets[segment];
  }

  /**
   * Gets segment length.
   * @method
   * @private
   * @param {number} segment - Segment index.
   * @returns {number} Segment length.
   */
  _getSegmentLength(segment) {
    const offset = this._getSegmentOffset(segment);
    if (segment < this._getNumberOfSegments() - 1) {
      const next = this._getSegmentOffset(segment + 1);
      return next - offset;
    }

    return this.data.length - offset;
  }

  /**
   * Decodes a segment.
   * @method
   * @private
   * @param {number} segment - Segment index.
   * @param {Uint8Array} decodedData - Decoded data.
   * @param {number} start - Decoded data start index.
   * @param {number} sampleOffset - Decoded data sample offset.
   * @throws Error if segment number is out of range.
   */
  _decodeSegment(segment, decodedData, start, sampleOffset) {
    if (segment < 0 || segment >= this._getNumberOfSegments()) {
      throw new Error('Segment number out of range');
    }
    const offset = this._getSegmentOffset(segment);
    const length = this._getSegmentLength(segment);
    this._decode(decodedData, start, sampleOffset, this.data, offset, length);
  }

  /**
   * Converts value to signed integer.
   * @method
   * @private
   * @param {number} val - Value.
   * @param {number} bitWidth - Bit width.
   */
  _uncomplement(val, bitWidth) {
    const isNegative = val & (1 << (bitWidth - 1));
    const boundary = 1 << bitWidth;
    const minVal = -boundary;
    const mask = boundary - 1;

    return isNegative ? minVal + (val & mask) : val;
  }

  /**
   * Performs the actual segment decoding.
   * @method
   * @private
   * @param {Uint8Array} decodedData - Decoded data.
   * @param {number} start - Decoded data start index.
   * @param {number} sampleOffset - Decoded data sample offset.
   * @param {Uint8Array} data - RLE encoded data.
   * @param {number} offset - RLE encoded data offset.
   * @param {number} count - RLE encoded data count.
   * @throws Error if the RLE literal run exceeds the input/output buffer length or
   * the RLE repeat run exceeds the output buffer length.
   */
  _decode(buffer, start, sampleOffset, rleData, offset, count) {
    let pos = start;
    const end = offset + count;
    const bufferLength = buffer.length;

    for (let i = offset; i < end && pos < bufferLength; ) {
      const control = this._uncomplement(rleData[i++], 8);
      if (control >= 0) {
        let length = control + 1;
        if (end - i < length) {
          throw new Error('RLE literal run exceeds input buffer length');
        }
        if (pos + (length - 1) * sampleOffset >= bufferLength) {
          throw new Error('RLE literal run exceeds output buffer length');
        }
        if (sampleOffset === 1) {
          for (let j = 0; j < length; ++j, ++i, ++pos) {
            buffer[pos] = rleData[i];
          }
        } else {
          while (length-- > 0) {
            buffer[pos] = rleData[i++];
            pos += sampleOffset;
          }
        }
      } else if (control >= -127) {
        let length = -control;
        if (pos + (length - 1) * sampleOffset >= bufferLength) {
          throw new Error('RLE repeat run exceeds output buffer length');
        }
        const b = rleData[i++];
        if (sampleOffset === 1) {
          while (length-- >= 0) {
            buffer[pos++] = b;
          }
        } else {
          while (length-- >= 0) {
            buffer[pos] = b;
            pos += sampleOffset;
          }
        }
      }
      if (i + 1 >= end) {
        break;
      }
    }
  }
  //#endregion
}
//#endregion

//#region Exports
module.exports = RleDecoder;
//#endregion
