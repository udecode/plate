/**
 * Image Handler - HTML image to DOCX image conversion
 *
 * This module provides handlers for converting HTML image elements to
 * docXMLater Image objects, including base64 data extraction and
 * dimension conversion.
 *
 * Supports:
 * - Base64-encoded images (data URLs)
 * - Remote URL images (with fetching)
 * - Dimension conversion (px, em, %, pt to EMU)
 * - Aspect ratio preservation
 *
 * @module image-handler
 */

import { Image, type ImageManager } from '../docXMLater/src';
import type {
  ConversionContext,
  ConversionResult,
  ImageHandler,
} from './element-handlers';

// ============================================================================
// Constants
// ============================================================================

/** EMU (English Metric Units) per inch - standard OOXML unit */
export const EMU_PER_INCH = 914_400;

/** EMU per pixel at 96 DPI (standard screen resolution) */
export const EMU_PER_PIXEL_96DPI = EMU_PER_INCH / 96; // 9525

/** EMU per point (72 points per inch) */
export const EMU_PER_POINT = EMU_PER_INCH / 72; // 12700

/** EMU per centimeter */
export const EMU_PER_CM = 360_000;

/** EMU per millimeter */
export const EMU_PER_MM = 36_000;

/** Default DPI for dimension calculations */
export const DEFAULT_DPI = 96;

/** Maximum image dimension in EMU (approximately 22 inches) */
export const MAX_IMAGE_EMU = 20_000_000;

/** Default image width if not specified (6 inches in EMU) */
export const DEFAULT_IMAGE_WIDTH_EMU = 6 * EMU_PER_INCH;

/** Default maximum width for images (6 inches in EMU) */
export const DEFAULT_MAX_WIDTH_EMU = 6 * EMU_PER_INCH;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for image conversion
 */
export interface ImageConversionOptions {
  /** DPI for pixel calculations (default: 96) */
  dpi?: number;
  /** Maximum width in EMU (default: 6 inches) */
  maxWidth?: number;
  /** Maximum height in EMU (default: 9 inches) */
  maxHeight?: number;
  /** Whether to maintain aspect ratio when scaling (default: true) */
  maintainAspectRatio?: boolean;
  /** Default width if not specified (in EMU) */
  defaultWidth?: number;
  /** Default height if not specified (in EMU) */
  defaultHeight?: number;
  /** Fetch timeout for remote images in ms (default: 30000) */
  fetchTimeout?: number;
}

/**
 * Result of image dimension calculation
 */
export interface ImageDimensions {
  /** Width in EMU */
  widthEmu: number;
  /** Height in EMU */
  heightEmu: number;
  /** Whether dimensions were scaled */
  scaled: boolean;
}

/**
 * Parsed base64 image data
 */
export interface Base64ImageData {
  /** MIME type (e.g., 'image/png') */
  mimeType: string;
  /** File extension (e.g., 'png') */
  extension: string;
  /** Raw base64 data (without data URL prefix) */
  base64Data: string;
  /** Binary buffer */
  buffer: Buffer;
}

// ============================================================================
// Dimension Conversion Functions
// ============================================================================

/**
 * Converts pixels to EMU at specified DPI
 *
 * @param pixels - Pixel value
 * @param dpi - DPI for conversion (default: 96)
 * @returns Value in EMU
 *
 * @example
 * ```typescript
 * const emu = pixelsToEmu(100); // 100px at 96 DPI
 * // Returns 952500 EMU (approximately 1 inch)
 * ```
 */
export function pixelsToEmu(pixels: number, dpi: number = DEFAULT_DPI): number {
  return Math.round((pixels / dpi) * EMU_PER_INCH);
}

/**
 * Converts EMU to pixels at specified DPI
 *
 * @param emu - EMU value
 * @param dpi - DPI for conversion (default: 96)
 * @returns Value in pixels
 */
export function emuToPixels(emu: number, dpi: number = DEFAULT_DPI): number {
  return Math.round((emu / EMU_PER_INCH) * dpi);
}

/**
 * Converts points to EMU
 *
 * @param points - Point value (1/72 inch)
 * @returns Value in EMU
 */
export function pointsToEmu(points: number): number {
  return Math.round(points * EMU_PER_POINT);
}

/**
 * Converts inches to EMU
 *
 * @param inches - Inch value
 * @returns Value in EMU
 */
export function inchesToEmu(inches: number): number {
  return Math.round(inches * EMU_PER_INCH);
}

/**
 * Converts centimeters to EMU
 *
 * @param cm - Centimeter value
 * @returns Value in EMU
 */
export function cmToEmu(cm: number): number {
  return Math.round(cm * EMU_PER_CM);
}

/**
 * Converts millimeters to EMU
 *
 * @param mm - Millimeter value
 * @returns Value in EMU
 */
export function mmToEmu(mm: number): number {
  return Math.round(mm * EMU_PER_MM);
}

/**
 * Parses a CSS dimension value to EMU
 *
 * Supports: px, pt, in, cm, mm, em (treated as 16px per em)
 *
 * @param value - CSS dimension string (e.g., '100px', '2in', '10em')
 * @param dpi - DPI for pixel calculations
 * @returns Value in EMU, or null if parsing failed
 */
export function parseCssDimensionToEmu(
  value: string | null | undefined,
  dpi: number = DEFAULT_DPI
): number | null {
  if (!value) return null;

  const numValue = Number.parseFloat(value);
  if (isNaN(numValue)) return null;

  const unit = value
    .replace(/[\d.-]/g, '')
    .toLowerCase()
    .trim();

  switch (unit) {
    case 'px':
    case '': // No unit defaults to pixels
      return pixelsToEmu(numValue, dpi);
    case 'pt':
      return pointsToEmu(numValue);
    case 'in':
      return inchesToEmu(numValue);
    case 'cm':
      return cmToEmu(numValue);
    case 'mm':
      return mmToEmu(numValue);
    case 'em':
      // Assume 1em = 16px
      return pixelsToEmu(numValue * 16, dpi);
    default:
      // Assume pixels for unknown units
      return pixelsToEmu(numValue, dpi);
  }
}

/**
 * Calculates image dimensions with aspect ratio preservation and maximum constraints
 *
 * @param options - Dimension options
 * @returns Calculated dimensions in EMU
 *
 * @example
 * ```typescript
 * const dims = calculateImageDimensions({
 *   originalWidth: 1920,
 *   originalHeight: 1080,
 *   maxWidth: 6 * EMU_PER_INCH,
 *   maintainAspectRatio: true,
 * });
 * ```
 */
export function calculateImageDimensions(options: {
  /** Original width in pixels or EMU */
  originalWidth?: number;
  /** Original height in pixels or EMU */
  originalHeight?: number;
  /** Requested width (from HTML attribute/style) */
  requestedWidth?: number | null;
  /** Requested height (from HTML attribute/style) */
  requestedHeight?: number | null;
  /** Maximum width in EMU */
  maxWidth?: number;
  /** Maximum height in EMU */
  maxHeight?: number;
  /** Whether to maintain aspect ratio */
  maintainAspectRatio?: boolean;
  /** DPI for pixel conversions */
  dpi?: number;
  /** Whether original dimensions are in pixels (vs EMU) */
  originalInPixels?: boolean;
}): ImageDimensions {
  const {
    originalWidth = 0,
    originalHeight = 0,
    requestedWidth,
    requestedHeight,
    maxWidth = DEFAULT_MAX_WIDTH_EMU,
    maxHeight = 9 * EMU_PER_INCH,
    maintainAspectRatio = true,
    dpi = DEFAULT_DPI,
    originalInPixels = true,
  } = options;

  // Convert original dimensions to EMU if needed
  let widthEmu = originalInPixels
    ? pixelsToEmu(originalWidth, dpi)
    : originalWidth;
  let heightEmu = originalInPixels
    ? pixelsToEmu(originalHeight, dpi)
    : originalHeight;

  // Apply requested dimensions if provided
  if (requestedWidth !== null && requestedWidth !== undefined) {
    widthEmu = requestedWidth;
  }
  if (requestedHeight !== null && requestedHeight !== undefined) {
    heightEmu = requestedHeight;
  }

  // Use defaults if still zero
  if (widthEmu <= 0) widthEmu = DEFAULT_IMAGE_WIDTH_EMU;
  if (heightEmu <= 0) heightEmu = widthEmu; // Square default

  const originalRatio = widthEmu / heightEmu;
  let scaled = false;

  // Apply maximum constraints with aspect ratio preservation
  if (maintainAspectRatio) {
    if (widthEmu > maxWidth) {
      widthEmu = maxWidth;
      heightEmu = Math.round(widthEmu / originalRatio);
      scaled = true;
    }
    if (heightEmu > maxHeight) {
      heightEmu = maxHeight;
      widthEmu = Math.round(heightEmu * originalRatio);
      scaled = true;
    }
  } else {
    if (widthEmu > maxWidth) {
      widthEmu = maxWidth;
      scaled = true;
    }
    if (heightEmu > maxHeight) {
      heightEmu = maxHeight;
      scaled = true;
    }
  }

  // Ensure dimensions don't exceed absolute maximum
  widthEmu = Math.min(widthEmu, MAX_IMAGE_EMU);
  heightEmu = Math.min(heightEmu, MAX_IMAGE_EMU);

  return { widthEmu, heightEmu, scaled };
}

// ============================================================================
// Base64 Image Processing
// ============================================================================

/**
 * Extracts and parses base64 image data from a data URL
 *
 * @param dataUrl - Data URL (e.g., 'data:image/png;base64,...')
 * @returns Parsed image data or null if invalid
 *
 * @example
 * ```typescript
 * const data = extractBase64ImageData('data:image/png;base64,iVBORw0KGgo...');
 * if (data) {
 *   console.log(data.mimeType); // 'image/png'
 *   console.log(data.extension); // 'png'
 * }
 * ```
 */
export function extractBase64ImageData(
  dataUrl: string
): Base64ImageData | null {
  // Match data URL format: data:[<mediatype>][;base64],<data>
  const match = dataUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/);

  if (!match) {
    return null;
  }

  const mimeType = match[1] || 'image/png';
  const isBase64 = match[2] === ';base64';
  const data = match[3] || '';

  // If not base64, we can't process it
  if (!isBase64) {
    return null;
  }

  // Map MIME type to extension
  const extensionMap: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpeg',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/webp': 'webp',
    'image/tiff': 'tiff',
    'image/svg+xml': 'svg',
  };

  const extension = extensionMap[mimeType.toLowerCase()] || 'png';

  // Convert base64 to buffer
  const buffer = Buffer.from(data, 'base64');

  return {
    mimeType,
    extension,
    base64Data: data,
    buffer,
  };
}

/**
 * Detects image dimensions from buffer data
 *
 * Supports PNG, JPEG, GIF, BMP formats.
 *
 * @param buffer - Image buffer
 * @param mimeType - MIME type hint
 * @returns Dimensions or null if detection failed
 */
export function detectImageDimensions(
  buffer: Buffer,
  mimeType?: string
): { width: number; height: number } | null {
  if (buffer.length < 24) {
    return null;
  }

  // PNG: Check for PNG signature and read IHDR chunk
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }

  // JPEG: Look for SOF0/SOF2 markers
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length - 10) {
      if (buffer[offset] !== 0xff) {
        offset++;
        continue;
      }

      const marker = buffer[offset + 1];
      // SOF0 (0xC0) or SOF2 (0xC2) markers contain dimensions
      if (marker === 0xc0 || marker === 0xc2) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }

      // Skip to next marker
      if (marker >= 0xd0 && marker <= 0xd9) {
        offset += 2;
      } else {
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }
  }

  // GIF: Read dimensions from header
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    const width = buffer.readUInt16LE(6);
    const height = buffer.readUInt16LE(8);
    return { width, height };
  }

  // BMP: Read dimensions from DIB header
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
    const width = buffer.readInt32LE(18);
    const height = Math.abs(buffer.readInt32LE(22));
    return { width, height };
  }

  return null;
}

// ============================================================================
// Image Handlers
// ============================================================================

/**
 * Handles image elements (<img>)
 *
 * Converts HTML image to docXMLater Image with proper dimensions.
 *
 * @param element - The <img> element
 * @param context - Conversion context
 * @param options - Conversion options
 * @returns Conversion result with Image
 */
export async function handleImageElement(
  element: Element,
  context: ConversionContext,
  options: ImageConversionOptions = {}
): Promise<ConversionResult> {
  const src = element.getAttribute('src') || '';
  const alt = element.getAttribute('alt') || '';
  const widthAttr = element.getAttribute('width');
  const heightAttr = element.getAttribute('height');
  const styleWidth = (element as HTMLElement).style?.width;
  const styleHeight = (element as HTMLElement).style?.height;

  const {
    dpi = DEFAULT_DPI,
    maxWidth = DEFAULT_MAX_WIDTH_EMU,
    maxHeight = 9 * EMU_PER_INCH,
    maintainAspectRatio = true,
    fetchTimeout = 30_000,
  } = options;

  try {
    let image: Image | null = null;
    let originalWidth: number | undefined;
    let originalHeight: number | undefined;

    // Handle base64 data URL
    if (src.startsWith('data:')) {
      const imageData = extractBase64ImageData(src);
      if (!imageData) {
        return {
          error: 'Failed to parse base64 image data',
          processChildren: false,
        };
      }

      // Detect dimensions from buffer
      const detectedDims = detectImageDimensions(
        imageData.buffer,
        imageData.mimeType
      );
      if (detectedDims) {
        originalWidth = detectedDims.width;
        originalHeight = detectedDims.height;
      }

      // Create image from buffer
      // Note: The Image.fromBuffer method handles the actual image creation
      // Dimensions in pixels, converted to EMU internally by docXMLater
      const requestedWidthEmu = parseCssDimensionToEmu(
        styleWidth || widthAttr,
        dpi
      );
      const requestedHeightEmu = parseCssDimensionToEmu(
        styleHeight || heightAttr,
        dpi
      );

      const dims = calculateImageDimensions({
        originalWidth,
        originalHeight,
        requestedWidth: requestedWidthEmu,
        requestedHeight: requestedHeightEmu,
        maxWidth,
        maxHeight,
        maintainAspectRatio,
        dpi,
        originalInPixels: true,
      });

      // Convert EMU to pixels for Image.fromBuffer
      const widthPx = emuToPixels(dims.widthEmu, dpi);
      const heightPx = emuToPixels(dims.heightEmu, dpi);

      image = await Image.fromBuffer(
        imageData.buffer,
        imageData.mimeType,
        widthPx,
        heightPx
      );

      if (alt) {
        image.setAltText(alt);
      }
    }
    // Handle remote URL
    else if (src.startsWith('http://') || src.startsWith('https://')) {
      // Use imageHandler from context if available
      if (context.imageHandler) {
        const widthPx = widthAttr ? Number.parseInt(widthAttr, 10) : undefined;
        const heightPx = heightAttr
          ? Number.parseInt(heightAttr, 10)
          : undefined;
        image = await context.imageHandler(src, alt, widthPx, heightPx);
      } else {
        return {
          error: 'No image handler provided for remote URL',
          processChildren: false,
        };
      }
    }
    // Handle file path (not typically used in HTML to DOCX conversion)
    else {
      return {
        error: `Unsupported image source: ${src.substring(0, 50)}...`,
        processChildren: false,
      };
    }

    return {
      element: image,
      processChildren: false,
    };
  } catch (error) {
    return {
      error: `Failed to process image: ${error instanceof Error ? error.message : String(error)}`,
      processChildren: false,
    };
  }
}

/**
 * Creates an image handler function for use in conversion context
 *
 * @param imageManager - ImageManager instance for tracking images
 * @param options - Conversion options
 * @returns Image handler function
 *
 * @example
 * ```typescript
 * const imageHandler = createImageHandler(imageManager, { maxWidth: 5 * EMU_PER_INCH });
 * const context: ConversionContext = {
 *   document,
 *   imageHandler,
 * };
 * ```
 */
export function createImageHandler(
  imageManager: ImageManager,
  options: ImageConversionOptions = {}
): ImageHandler {
  const {
    dpi = DEFAULT_DPI,
    maxWidth = DEFAULT_MAX_WIDTH_EMU,
    maxHeight = 9 * EMU_PER_INCH,
    maintainAspectRatio = true,
    fetchTimeout = 30_000,
  } = options;

  return async (
    src: string,
    alt?: string,
    width?: number,
    height?: number
  ): Promise<Image | null> => {
    try {
      let image: Image | null = null;

      if (src.startsWith('data:')) {
        const imageData = extractBase64ImageData(src);
        if (!imageData) {
          return null;
        }

        // Detect dimensions from buffer
        const detectedDims = detectImageDimensions(
          imageData.buffer,
          imageData.mimeType
        );
        const originalWidth = detectedDims?.width;
        const originalHeight = detectedDims?.height;

        const requestedWidthEmu = width ? pixelsToEmu(width, dpi) : null;
        const requestedHeightEmu = height ? pixelsToEmu(height, dpi) : null;

        const dims = calculateImageDimensions({
          originalWidth,
          originalHeight,
          requestedWidth: requestedWidthEmu,
          requestedHeight: requestedHeightEmu,
          maxWidth,
          maxHeight,
          maintainAspectRatio,
          dpi,
          originalInPixels: true,
        });

        const widthPx = emuToPixels(dims.widthEmu, dpi);
        const heightPx = emuToPixels(dims.heightEmu, dpi);

        image = await Image.fromBuffer(
          imageData.buffer,
          imageData.mimeType,
          widthPx,
          heightPx
        );

        if (alt) {
          image.setAltText(alt);
        }
      }
      // Handle remote URLs
      else if (src.startsWith('http://') || src.startsWith('https://')) {
        // Fetch the image
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), fetchTimeout);

        try {
          const response = await fetch(src, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Determine MIME type from response or URL
          const contentType =
            response.headers.get('content-type') || 'image/png';

          // Detect dimensions
          const detectedDims = detectImageDimensions(buffer, contentType);
          const originalWidth = detectedDims?.width || width;
          const originalHeight = detectedDims?.height || height;

          const requestedWidthEmu = width ? pixelsToEmu(width, dpi) : null;
          const requestedHeightEmu = height ? pixelsToEmu(height, dpi) : null;

          const dims = calculateImageDimensions({
            originalWidth,
            originalHeight,
            requestedWidth: requestedWidthEmu,
            requestedHeight: requestedHeightEmu,
            maxWidth,
            maxHeight,
            maintainAspectRatio,
            dpi,
            originalInPixels: true,
          });

          const widthPx = emuToPixels(dims.widthEmu, dpi);
          const heightPx = emuToPixels(dims.heightEmu, dpi);

          image = await Image.fromBuffer(
            buffer,
            contentType,
            widthPx,
            heightPx
          );

          if (alt) {
            image.setAltText(alt);
          }
        } finally {
          clearTimeout(timeoutId);
        }
      }

      return image;
    } catch (error) {
      console.error('Failed to process image:', error);
      return null;
    }
  };
}
