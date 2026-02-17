/**
 * Browser-compatible image dimension parser
 * Parses image dimensions from a Buffer without using Node.js fs module
 */

export interface ImageDimensions {
  height: number;
  type: string;
  width: number;
}

/**
 * Get image dimensions from a buffer
 * Supports PNG, JPEG, GIF, BMP, WebP
 */
export function getImageDimensions(
  buffer: ArrayBuffer | Uint8Array
): ImageDimensions {
  const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    uint8[0] === 0x89 &&
    uint8[1] === 0x50 &&
    uint8[2] === 0x4e &&
    uint8[3] === 0x47
  ) {
    return {
      width:
        (uint8[16] << 24) | (uint8[17] << 16) | (uint8[18] << 8) | uint8[19],
      height:
        (uint8[20] << 24) | (uint8[21] << 16) | (uint8[22] << 8) | uint8[23],
      type: 'png',
    };
  }

  // JPEG: FF D8 FF
  if (uint8[0] === 0xff && uint8[1] === 0xd8 && uint8[2] === 0xff) {
    let offset = 2;
    while (offset < uint8.length) {
      if (uint8[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = uint8[offset + 1];
      // SOF0, SOF1, SOF2 markers contain dimensions
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        return {
          height: (uint8[offset + 5] << 8) | uint8[offset + 6],
          width: (uint8[offset + 7] << 8) | uint8[offset + 8],
          type: 'jpg',
        };
      }
      // Skip to next marker
      const length = (uint8[offset + 2] << 8) | uint8[offset + 3];
      offset += 2 + length;
    }
    // Fallback for malformed JPEG
    return { width: 100, height: 100, type: 'jpg' };
  }

  // GIF: 47 49 46 38
  if (
    uint8[0] === 0x47 &&
    uint8[1] === 0x49 &&
    uint8[2] === 0x46 &&
    uint8[3] === 0x38
  ) {
    return {
      width: uint8[6] | (uint8[7] << 8),
      height: uint8[8] | (uint8[9] << 8),
      type: 'gif',
    };
  }

  // BMP: 42 4D
  if (uint8[0] === 0x42 && uint8[1] === 0x4d) {
    return {
      width:
        uint8[18] | (uint8[19] << 8) | (uint8[20] << 16) | (uint8[21] << 24),
      height:
        uint8[22] | (uint8[23] << 8) | (uint8[24] << 16) | (uint8[25] << 24),
      type: 'bmp',
    };
  }

  // WebP: 52 49 46 46 ... 57 45 42 50
  if (
    uint8[0] === 0x52 &&
    uint8[1] === 0x49 &&
    uint8[2] === 0x46 &&
    uint8[3] === 0x46 &&
    uint8[8] === 0x57 &&
    uint8[9] === 0x45 &&
    uint8[10] === 0x42 &&
    uint8[11] === 0x50
  ) {
    // VP8 format
    if (uint8[12] === 0x56 && uint8[13] === 0x50 && uint8[14] === 0x38) {
      // VP8
      if (uint8[15] === 0x20) {
        return {
          width: (uint8[26] | (uint8[27] << 8)) & 0x3f_ff,
          height: (uint8[28] | (uint8[29] << 8)) & 0x3f_ff,
          type: 'webp',
        };
      }
      // VP8L (lossless)
      if (uint8[15] === 0x4c) {
        const bits =
          uint8[21] | (uint8[22] << 8) | (uint8[23] << 16) | (uint8[24] << 24);
        return {
          width: (bits & 0x3f_ff) + 1,
          height: ((bits >> 14) & 0x3f_ff) + 1,
          type: 'webp',
        };
      }
    }
    // Fallback for WebP
    return { width: 100, height: 100, type: 'webp' };
  }

  // Default fallback
  return { width: 100, height: 100, type: 'unknown' };
}

export default getImageDimensions;
