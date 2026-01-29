/**
 * Picture Extractor
 *
 * Extracts images (BLIPs) from MS-DOC files.
 * Images are stored in the Data stream as BLIP structures.
 *
 * References:
 * - [MS-ODRAW] 2.2.23 OfficeArtBStoreContainerFileBlock
 * - [MS-ODRAW] 2.2.24 OfficeArtFBSE
 * - [MS-ODRAW] 2.2.25 OfficeArtBlip
 */

import type { ExtractedImage } from '../types/DocTypes';

/**
 * Error thrown when image extraction fails
 */
export class PictureExtractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PictureExtractError';
  }
}

/**
 * BLIP record types
 */
const BLIP_TYPES = {
  /** Error - no BLIP */
  ERROR: 0x00,
  /** Unknown BLIP type */
  UNKNOWN: 0x01,
  /** EMF (Enhanced Metafile) */
  EMF: 0x02,
  /** WMF (Windows Metafile) */
  WMF: 0x03,
  /** PICT (Macintosh PICT) */
  PICT: 0x04,
  /** JPEG */
  JPEG: 0x05,
  /** PNG */
  PNG: 0x06,
  /** DIB (Device Independent Bitmap) */
  DIB: 0x07,
  /** TIFF */
  TIFF: 0x11,
  /** CMYK JPEG */
  CMYK_JPEG: 0x12,
} as const;

/**
 * BLIP type to file extension mapping
 */
const BLIP_EXTENSIONS: { [key: number]: string } = {
  [BLIP_TYPES.EMF]: 'emf',
  [BLIP_TYPES.WMF]: 'wmf',
  [BLIP_TYPES.PICT]: 'pict',
  [BLIP_TYPES.JPEG]: 'jpg',
  [BLIP_TYPES.PNG]: 'png',
  [BLIP_TYPES.DIB]: 'bmp',
  [BLIP_TYPES.TIFF]: 'tiff',
  [BLIP_TYPES.CMYK_JPEG]: 'jpg',
};

/**
 * Image signatures for format detection
 */
const IMAGE_SIGNATURES = {
  /** PNG magic number */
  PNG: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  /** JPEG magic number */
  JPEG: [0xff, 0xd8, 0xff],
  /** GIF magic numbers */
  GIF87a: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
  GIF89a: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  /** BMP magic number */
  BMP: [0x42, 0x4d],
  /** TIFF magic numbers (little/big endian) */
  TIFF_LE: [0x49, 0x49, 0x2a, 0x00],
  TIFF_BE: [0x4d, 0x4d, 0x00, 0x2a],
  /** EMF magic number */
  EMF: [0x01, 0x00, 0x00, 0x00],
  /** WMF placeable header */
  WMF: [0xd7, 0xcd, 0xc6, 0x9a],
};

/**
 * OfficeArt record header
 */
interface RecordHeader {
  recVer: number;
  recInstance: number;
  recType: number;
  recLen: number;
}

/**
 * FBSE (File BLIP Store Entry) structure
 */
interface FBSE {
  btWin32: number;
  btMacOS: number;
  rgbUid: Uint8Array;
  tag: number;
  size: number;
  cRef: number;
  foDelay: number;
  unused: number;
  cbName: number;
  name?: string;
}

/**
 * Extract images from Data stream
 */
export class PictureExtractor {
  private data: Uint8Array;
  private view: DataView;

  constructor(dataStream: Uint8Array) {
    this.data = dataStream;
    this.view = new DataView(
      this.data.buffer,
      this.data.byteOffset,
      this.data.byteLength
    );
  }

  /**
   * Extract all images from the Data stream
   */
  extractAll(): ExtractedImage[] {
    const images: ExtractedImage[] = [];

    if (this.data.length < 8) {
      return images;
    }

    let offset = 0;
    let imageIndex = 0;

    while (offset + 8 <= this.data.length) {
      try {
        // Read record header
        const header = this.readRecordHeader(offset);

        // Check if this is a BLIP store container
        if (header.recType === 0xf0_01) {
          // Container - recurse into it
          offset += 8;
          continue;
        }

        // Check if this is an FBSE record
        if (header.recType === 0xf0_07) {
          const fbse = this.readFBSE(offset + 8);
          const blipOffset =
            offset + 8 + 36 + (fbse.cbName > 0 ? fbse.cbName : 0);

          if (blipOffset + 8 < this.data.length) {
            const blipHeader = this.readRecordHeader(blipOffset);
            const blipData = this.extractBlipData(
              blipOffset + 8,
              blipHeader,
              fbse.btWin32
            );

            if (blipData) {
              const format = this.detectFormat(blipData);
              images.push({
                id: `image${imageIndex++}`,
                format,
                data: blipData,
                inline: true,
              });
            }
          }

          offset += 8 + header.recLen;
          continue;
        }

        // Check if this is a direct BLIP record (0xF018 - 0xF117)
        if (header.recType >= 0xf0_18 && header.recType <= 0xf1_17) {
          const blipType = header.recType - 0xf0_18;
          const blipData = this.extractBlipData(offset + 8, header, blipType);

          if (blipData) {
            const format = this.detectFormat(blipData);
            images.push({
              id: `image${imageIndex++}`,
              format,
              data: blipData,
              inline: true,
            });
          }
        }

        offset += 8 + header.recLen;
      } catch {
        // Skip malformed records
        offset += 8;
      }
    }

    return images;
  }

  /**
   * Read OfficeArt record header
   */
  private readRecordHeader(offset: number): RecordHeader {
    const first = this.view.getUint16(offset, true);
    const recType = this.view.getUint16(offset + 2, true);
    const recLen = this.view.getUint32(offset + 4, true);

    return {
      recVer: first & 0x0f,
      recInstance: (first >> 4) & 0x0f_ff,
      recType,
      recLen,
    };
  }

  /**
   * Read FBSE structure
   */
  private readFBSE(offset: number): FBSE {
    return {
      btWin32: this.data[offset] ?? 0,
      btMacOS: this.data[offset + 1] ?? 0,
      rgbUid: this.data.slice(offset + 2, offset + 18),
      tag: this.view.getUint16(offset + 18, true),
      size: this.view.getUint32(offset + 20, true),
      cRef: this.view.getUint32(offset + 24, true),
      foDelay: this.view.getUint32(offset + 28, true),
      unused: this.data[offset + 32] ?? 0,
      cbName: this.data[offset + 33] ?? 0,
    };
  }

  /**
   * Extract BLIP data based on type
   */
  private extractBlipData(
    offset: number,
    header: RecordHeader,
    blipType: number
  ): Uint8Array | null {
    // Skip the BLIP header (UID and optional secondary UID)
    // The header size varies by BLIP type
    let dataOffset = offset;
    let dataLength = header.recLen;

    switch (blipType) {
      case BLIP_TYPES.PNG:
      case BLIP_TYPES.JPEG:
      case BLIP_TYPES.CMYK_JPEG:
        // PNG/JPEG: 16-byte UID + 1-byte tag + data
        dataOffset += 17;
        dataLength -= 17;
        break;

      case BLIP_TYPES.EMF:
      case BLIP_TYPES.WMF:
        // Metafiles: 16-byte UID + 34-byte compressed header + data
        dataOffset += 50;
        dataLength -= 50;
        break;

      case BLIP_TYPES.DIB:
        // DIB: 16-byte UID + 1-byte tag + data
        dataOffset += 17;
        dataLength -= 17;
        break;

      default:
        // Try to find the image signature in the data
        dataOffset += 17; // Minimum header
        dataLength -= 17;
        break;
    }

    if (dataLength <= 0 || dataOffset + dataLength > this.data.length) {
      return null;
    }

    return this.data.slice(dataOffset, dataOffset + dataLength);
  }

  /**
   * Detect image format from data
   */
  private detectFormat(data: Uint8Array): string {
    if (this.matchSignature(data, IMAGE_SIGNATURES.PNG)) {
      return 'png';
    }
    if (this.matchSignature(data, IMAGE_SIGNATURES.JPEG)) {
      return 'jpeg';
    }
    if (
      this.matchSignature(data, IMAGE_SIGNATURES.GIF87a) ||
      this.matchSignature(data, IMAGE_SIGNATURES.GIF89a)
    ) {
      return 'gif';
    }
    if (this.matchSignature(data, IMAGE_SIGNATURES.BMP)) {
      return 'bmp';
    }
    if (
      this.matchSignature(data, IMAGE_SIGNATURES.TIFF_LE) ||
      this.matchSignature(data, IMAGE_SIGNATURES.TIFF_BE)
    ) {
      return 'tiff';
    }
    if (this.matchSignature(data, IMAGE_SIGNATURES.EMF)) {
      return 'emf';
    }
    if (this.matchSignature(data, IMAGE_SIGNATURES.WMF)) {
      return 'wmf';
    }

    return 'unknown';
  }

  /**
   * Check if data starts with signature
   */
  private matchSignature(data: Uint8Array, signature: number[]): boolean {
    if (data.length < signature.length) {
      return false;
    }

    for (let i = 0; i < signature.length; i++) {
      if (data[i] !== signature[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Find image by scanning for signatures
   */
  findImageBySignature(
    offset: number,
    maxLength: number
  ): { format: string; start: number } | null {
    const signatures = [
      { sig: IMAGE_SIGNATURES.PNG, format: 'png' },
      { sig: IMAGE_SIGNATURES.JPEG, format: 'jpeg' },
      { sig: IMAGE_SIGNATURES.GIF87a, format: 'gif' },
      { sig: IMAGE_SIGNATURES.GIF89a, format: 'gif' },
      { sig: IMAGE_SIGNATURES.BMP, format: 'bmp' },
    ];

    const endOffset = Math.min(offset + maxLength, this.data.length);

    for (let i = offset; i < endOffset; i++) {
      for (const { sig, format } of signatures) {
        if (i + sig.length <= this.data.length) {
          let match = true;
          for (let j = 0; j < sig.length; j++) {
            if (this.data[i + j] !== sig[j]) {
              match = false;
              break;
            }
          }
          if (match) {
            return { format, start: i };
          }
        }
      }
    }

    return null;
  }

  /**
   * Static method to extract all images
   */
  static extractAll(dataStream: Uint8Array): ExtractedImage[] {
    const extractor = new PictureExtractor(dataStream);
    return extractor.extractAll();
  }

  /**
   * Check if Data stream contains images
   */
  static hasImages(dataStream: Uint8Array): boolean {
    const extractor = new PictureExtractor(dataStream);
    const images = extractor.extractAll();
    return images.length > 0;
  }
}
