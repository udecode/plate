/**
 * Resizable Handler - Extract and convert resizable media dimensions for DOCX
 *
 * This module provides utilities for extracting dimension information from
 * resizable media elements and converting them to DOCX-compatible units (EMU).
 *
 * Supports:
 * - Data attributes (data-width, data-height)
 * - Inline styles (width, height)
 * - HTML attributes (width, height)
 * - Various CSS units (px, pt, em, rem, in, cm, mm, %)
 *
 * Conversion formula: EMU = pixels * 914400 / 96 (at 96 DPI)
 *
 * @module resizable-handler
 */

import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Constants
// ============================================================================

/** EMU (English Metric Units) per inch */
export const EMU_PER_INCH = 914_400;

/** Standard DPI for web */
export const STANDARD_DPI = 96;

/** EMU per pixel at 96 DPI */
export const EMU_PER_PIXEL = EMU_PER_INCH / STANDARD_DPI; // 9525

/** EMU per point (72 points per inch) */
export const EMU_PER_POINT = EMU_PER_INCH / 72; // 12700

/** EMU per centimeter (2.54 cm per inch) */
export const EMU_PER_CM = EMU_PER_INCH / 2.54; // ~360000

/** EMU per millimeter */
export const EMU_PER_MM = EMU_PER_CM / 10; // ~36000

/** Default width in pixels when not specified */
export const DEFAULT_WIDTH_PX = 400;

/** Default height in pixels when not specified */
export const DEFAULT_HEIGHT_PX = 300;

/** Maximum width in EMU (page width minus margins, approximately 6.5 inches) */
export const MAX_WIDTH_EMU = 5_943_600; // 6.5 inches

/** Maximum height in EMU (approximately 9 inches) */
export const MAX_HEIGHT_EMU = 8_229_600; // 9 inches

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for dimension extraction and conversion
 */
export interface ResizableConversionOptions {
  /** Default width in pixels if not specified (default: 400) */
  defaultWidth?: number;
  /** Default height in pixels if not specified (default: 300) */
  defaultHeight?: number;
  /** Maximum width in EMU (default: 5943600) */
  maxWidth?: number;
  /** Maximum height in EMU (default: 8229600) */
  maxHeight?: number;
  /** DPI for pixel conversion (default: 96) */
  dpi?: number;
  /** Whether to maintain aspect ratio when constraining (default: true) */
  maintainAspectRatio?: boolean;
  /** Base font size in pixels for em/rem conversion (default: 16) */
  baseFontSize?: number;
  /** Parent width in pixels for percentage conversion (default: 612 = 6.375 inches at 96 DPI) */
  parentWidth?: number;
}

/**
 * Extracted dimensions in various units
 */
export interface ExtractedDimensions {
  /** Width in pixels (null if not found) */
  widthPx: number | null;
  /** Height in pixels (null if not found) */
  heightPx: number | null;
  /** Original width value with unit */
  originalWidth?: string;
  /** Original height value with unit */
  originalHeight?: string;
  /** Source of the dimension (attribute, style, data-attr) */
  source: 'data-attr' | 'style' | 'attribute' | 'default';
}

/**
 * Dimensions converted to EMU for DOCX
 */
export interface EmuDimensions {
  /** Width in EMU */
  width: number;
  /** Height in EMU */
  height: number;
  /** Whether dimensions were constrained to fit within max bounds */
  wasConstrained: boolean;
  /** Original aspect ratio (width / height) */
  aspectRatio: number;
}

// ============================================================================
// Unit Conversion Functions
// ============================================================================

/**
 * Converts pixels to EMU
 *
 * @param pixels - Value in pixels
 * @param dpi - DPI to use (default: 96)
 * @returns Value in EMU
 */
export function pxToEmu(pixels: number, dpi: number = STANDARD_DPI): number {
  return Math.round((pixels * EMU_PER_INCH) / dpi);
}

/**
 * Converts EMU to pixels
 *
 * @param emu - Value in EMU
 * @param dpi - DPI to use (default: 96)
 * @returns Value in pixels
 */
export function emuToPx(emu: number, dpi: number = STANDARD_DPI): number {
  return Math.round((emu * dpi) / EMU_PER_INCH);
}

/**
 * Converts points to EMU
 *
 * @param points - Value in points
 * @returns Value in EMU
 */
export function ptToEmu(points: number): number {
  return Math.round(points * EMU_PER_POINT);
}

/**
 * Converts inches to EMU
 *
 * @param inches - Value in inches
 * @returns Value in EMU
 */
export function inchesToEmu(inches: number): number {
  return Math.round(inches * EMU_PER_INCH);
}

/**
 * Converts centimeters to EMU
 *
 * @param cm - Value in centimeters
 * @returns Value in EMU
 */
export function cmToEmu(cm: number): number {
  return Math.round(cm * EMU_PER_CM);
}

/**
 * Converts millimeters to EMU
 *
 * @param mm - Value in millimeters
 * @returns Value in EMU
 */
export function mmToEmu(mm: number): number {
  return Math.round(mm * EMU_PER_MM);
}

/**
 * Parses a CSS dimension value and converts to pixels
 *
 * @param value - CSS dimension value (e.g., '100px', '10em', '50%')
 * @param options - Conversion options for context-dependent units
 * @returns Value in pixels or null if parsing fails
 */
export function parseCssDimensionToPx(
  value: string | null | undefined,
  options: ResizableConversionOptions = {}
): number | null {
  if (!value) return null;

  const {
    baseFontSize = 16,
    parentWidth = 612, // 6.375 inches at 96 DPI
    dpi = STANDARD_DPI,
  } = options;

  // Clean the value
  const trimmed = value.trim().toLowerCase();

  // Try to parse numeric value
  const numMatch = trimmed.match(/^(-?[\d.]+)\s*([a-z%]*)$/);
  if (!numMatch) return null;

  const numValue = Number.parseFloat(numMatch[1]);
  if (isNaN(numValue)) return null;

  const unit = numMatch[2] || 'px';

  switch (unit) {
    case 'px':
    case '':
      return numValue;
    case 'pt':
      return (numValue * dpi) / 72;
    case 'em':
    case 'rem':
      return numValue * baseFontSize;
    case 'in':
      return numValue * dpi;
    case 'cm':
      return (numValue * dpi) / 2.54;
    case 'mm':
      return (numValue * dpi) / 25.4;
    case '%':
      return (numValue / 100) * parentWidth;
    case 'vw':
      return (numValue / 100) * parentWidth; // Approximate
    default:
      return null;
  }
}

// ============================================================================
// Dimension Extraction Functions
// ============================================================================

/**
 * Extracts dimensions from an element's data attributes
 *
 * @param element - The element to extract from
 * @param options - Conversion options
 * @returns Extracted dimensions or null
 */
function extractFromDataAttributes(
  element: Element,
  options: ResizableConversionOptions
): Partial<ExtractedDimensions> | null {
  const widthAttr =
    element.getAttribute('data-width') ||
    element.getAttribute('data-image-width') ||
    element.getAttribute('data-original-width');
  const heightAttr =
    element.getAttribute('data-height') ||
    element.getAttribute('data-image-height') ||
    element.getAttribute('data-original-height');

  if (!widthAttr && !heightAttr) return null;

  return {
    widthPx: parseCssDimensionToPx(widthAttr, options),
    heightPx: parseCssDimensionToPx(heightAttr, options),
    originalWidth: widthAttr || undefined,
    originalHeight: heightAttr || undefined,
    source: 'data-attr',
  };
}

/**
 * Extracts dimensions from an element's inline styles
 *
 * @param element - The element to extract from
 * @param options - Conversion options
 * @returns Extracted dimensions or null
 */
function extractFromStyles(
  element: Element,
  options: ResizableConversionOptions
): Partial<ExtractedDimensions> | null {
  const htmlElement = element as HTMLElement;
  const style = htmlElement.style;

  if (!style) return null;

  const widthStyle = style.width;
  const heightStyle = style.height;

  if (!widthStyle && !heightStyle) return null;

  return {
    widthPx: parseCssDimensionToPx(widthStyle, options),
    heightPx: parseCssDimensionToPx(heightStyle, options),
    originalWidth: widthStyle || undefined,
    originalHeight: heightStyle || undefined,
    source: 'style',
  };
}

/**
 * Extracts dimensions from an element's HTML attributes
 *
 * @param element - The element to extract from
 * @param options - Conversion options
 * @returns Extracted dimensions or null
 */
function extractFromAttributes(
  element: Element,
  options: ResizableConversionOptions
): Partial<ExtractedDimensions> | null {
  const widthAttr = element.getAttribute('width');
  const heightAttr = element.getAttribute('height');

  if (!widthAttr && !heightAttr) return null;

  return {
    widthPx: parseCssDimensionToPx(widthAttr, options),
    heightPx: parseCssDimensionToPx(heightAttr, options),
    originalWidth: widthAttr || undefined,
    originalHeight: heightAttr || undefined,
    source: 'attribute',
  };
}

/**
 * Extracts dimensions from a resizable element
 *
 * Checks in order:
 * 1. Data attributes (data-width, data-height)
 * 2. Inline styles (width, height)
 * 3. HTML attributes (width, height)
 * 4. Falls back to defaults if nothing found
 *
 * @param element - The element to extract dimensions from
 * @param options - Conversion options
 * @returns Extracted dimensions
 *
 * @example
 * ```typescript
 * const dims = extractDimensions(imgElement);
 * console.log(`Width: ${dims.widthPx}px, Height: ${dims.heightPx}px`);
 * ```
 */
export function extractDimensions(
  element: Element,
  options: ResizableConversionOptions = {}
): ExtractedDimensions {
  const { defaultWidth = DEFAULT_WIDTH_PX, defaultHeight = DEFAULT_HEIGHT_PX } =
    options;

  // Try data attributes first (most specific)
  const dataAttrDims = extractFromDataAttributes(element, options);
  if (dataAttrDims?.widthPx !== null && dataAttrDims?.heightPx !== null) {
    return dataAttrDims as ExtractedDimensions;
  }

  // Try inline styles
  const styleDims = extractFromStyles(element, options);
  if (styleDims?.widthPx !== null || styleDims?.heightPx !== null) {
    // Merge with data attrs if partial
    return {
      widthPx: styleDims?.widthPx ?? dataAttrDims?.widthPx ?? null,
      heightPx: styleDims?.heightPx ?? dataAttrDims?.heightPx ?? null,
      originalWidth: styleDims?.originalWidth || dataAttrDims?.originalWidth,
      originalHeight: styleDims?.originalHeight || dataAttrDims?.originalHeight,
      source: 'style',
    };
  }

  // Try HTML attributes
  const attrDims = extractFromAttributes(element, options);
  if (attrDims?.widthPx !== null || attrDims?.heightPx !== null) {
    return {
      widthPx: attrDims?.widthPx ?? dataAttrDims?.widthPx ?? null,
      heightPx: attrDims?.heightPx ?? dataAttrDims?.heightPx ?? null,
      originalWidth: attrDims?.originalWidth || dataAttrDims?.originalWidth,
      originalHeight: attrDims?.originalHeight || dataAttrDims?.originalHeight,
      source: 'attribute',
    };
  }

  // Fall back to defaults
  return {
    widthPx: defaultWidth,
    heightPx: defaultHeight,
    source: 'default',
  };
}

// ============================================================================
// EMU Conversion Functions
// ============================================================================

/**
 * Converts extracted dimensions to EMU with optional constraints
 *
 * @param dimensions - Extracted dimensions in pixels
 * @param options - Conversion options
 * @returns Dimensions in EMU
 *
 * @example
 * ```typescript
 * const dims = extractDimensions(imgElement);
 * const emu = convertToEmu(dims);
 * console.log(`Width: ${emu.width} EMU, Height: ${emu.height} EMU`);
 * ```
 */
export function convertToEmu(
  dimensions: ExtractedDimensions,
  options: ResizableConversionOptions = {}
): EmuDimensions {
  const {
    defaultWidth = DEFAULT_WIDTH_PX,
    defaultHeight = DEFAULT_HEIGHT_PX,
    maxWidth = MAX_WIDTH_EMU,
    maxHeight = MAX_HEIGHT_EMU,
    dpi = STANDARD_DPI,
    maintainAspectRatio = true,
  } = options;

  // Use defaults if dimensions are null
  const widthPx = dimensions.widthPx ?? defaultWidth;
  const heightPx = dimensions.heightPx ?? defaultHeight;

  // Convert to EMU
  let widthEmu = pxToEmu(widthPx, dpi);
  let heightEmu = pxToEmu(heightPx, dpi);

  // Calculate aspect ratio
  const aspectRatio = widthPx / heightPx;

  // Check if constraining is needed
  let wasConstrained = false;

  if (widthEmu > maxWidth || heightEmu > maxHeight) {
    wasConstrained = true;

    if (maintainAspectRatio) {
      // Calculate scale factors
      const widthScale = maxWidth / widthEmu;
      const heightScale = maxHeight / heightEmu;
      const scale = Math.min(widthScale, heightScale);

      widthEmu = Math.round(widthEmu * scale);
      heightEmu = Math.round(heightEmu * scale);
    } else {
      // Constrain independently
      if (widthEmu > maxWidth) widthEmu = maxWidth;
      if (heightEmu > maxHeight) heightEmu = maxHeight;
    }
  }

  return {
    width: widthEmu,
    height: heightEmu,
    wasConstrained,
    aspectRatio,
  };
}

/**
 * Extracts dimensions and converts to EMU in one step
 *
 * @param element - The element to extract dimensions from
 * @param options - Conversion options
 * @returns Dimensions in EMU
 *
 * @example
 * ```typescript
 * const emu = extractAndConvertToEmu(imgElement);
 * // Use emu.width and emu.height for DOCX image sizing
 * ```
 */
export function extractAndConvertToEmu(
  element: Element,
  options: ResizableConversionOptions = {}
): EmuDimensions {
  const dimensions = extractDimensions(element, options);
  return convertToEmu(dimensions, options);
}

// ============================================================================
// Element Handler
// ============================================================================

/**
 * Handles resizable media elements
 *
 * This handler extracts dimensions from resizable elements (images, videos, etc.)
 * and provides EMU dimensions in the conversion context for downstream handlers.
 *
 * @param element - The resizable element
 * @param context - Conversion context
 * @param options - Conversion options
 * @returns Conversion result with dimensions in context
 */
export function handleResizableElement(
  element: Element,
  context: ConversionContext,
  options: ResizableConversionOptions = {}
): ConversionResult {
  // Extract and convert dimensions
  const emuDimensions = extractAndConvertToEmu(element, options);

  // Pass dimensions through child context for image/video handlers
  return {
    element: null,
    processChildren: true,
    childContext: {
      ...context,
      // Store dimensions for child handlers
      // @ts-expect-error - extending context with custom properties
      emuDimensions,
    },
  };
}

/**
 * Checks if an element is a resizable media element
 *
 * @param element - The element to check
 * @returns True if the element is resizable media
 */
export function isResizableElement(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();

  // Common resizable elements
  if (
    ['img', 'video', 'iframe', 'embed', 'object', 'canvas', 'svg'].includes(
      tagName
    )
  ) {
    return true;
  }

  // Check for resizable wrapper divs
  if (
    element.hasAttribute('data-resizable') ||
    element.hasAttribute('data-width') ||
    element.hasAttribute('data-height')
  ) {
    return true;
  }

  // Check class names
  const className = element.className?.toLowerCase() || '';
  if (
    className.includes('resizable') ||
    className.includes('media-embed') ||
    className.includes('plate-resizable')
  ) {
    return true;
  }

  return false;
}

/**
 * Creates dimension metadata for an image from width and height values
 *
 * @param width - Width in pixels
 * @param height - Height in pixels
 * @param options - Conversion options
 * @returns EMU dimensions
 */
export function createImageDimensions(
  width: number,
  height: number,
  options: ResizableConversionOptions = {}
): EmuDimensions {
  const dimensions: ExtractedDimensions = {
    widthPx: width,
    heightPx: height,
    source: 'default',
  };

  return convertToEmu(dimensions, options);
}
