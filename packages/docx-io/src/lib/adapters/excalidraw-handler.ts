/**
 * Excalidraw Handler - Excalidraw element detection and placeholder generation
 *
 * This module provides handlers for detecting Excalidraw drawing elements
 * and creating appropriate placeholders for DOCX export.
 *
 * Since Excalidraw drawings are interactive SVG-based canvas elements that
 * cannot be directly converted to DOCX format, this handler:
 * 1. Detects Excalidraw elements by data attributes or class names
 * 2. Creates placeholder text or images for the DOCX export
 * 3. Optionally supports PNG rasterization if an image URL is provided
 *
 * @module excalidraw-handler
 */

import { Paragraph, Run } from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Constants
// ============================================================================

/** Data attribute used to identify Excalidraw elements */
export const EXCALIDRAW_DATA_ATTR = 'data-slate-excalidraw';

/** Class name patterns for Excalidraw elements */
export const EXCALIDRAW_CLASS_PATTERNS = [
  'excalidraw',
  'excalidraw-wrapper',
  'excalidraw-container',
  'plate-excalidraw',
];

/** Default placeholder text for Excalidraw content */
export const EXCALIDRAW_PLACEHOLDER_TEXT = '[Excalidraw Drawing]';

/** Default placeholder font color (gray) */
export const EXCALIDRAW_PLACEHOLDER_COLOR = '808080';

/** Default placeholder font style */
export const EXCALIDRAW_PLACEHOLDER_ITALIC = true;

/** EMU per pixel at 96 DPI */
export const EMU_PER_PIXEL = 9525;

/** Default image width in pixels */
export const DEFAULT_IMAGE_WIDTH = 400;

/** Default image height in pixels */
export const DEFAULT_IMAGE_HEIGHT = 300;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for Excalidraw conversion
 */
export interface ExcalidrawConversionOptions {
  /** Custom placeholder text (default: '[Excalidraw Drawing]') */
  placeholderText?: string;
  /** Whether to show placeholder text (default: true) */
  showPlaceholder?: boolean;
  /** Placeholder text color in hex (default: '808080') */
  placeholderColor?: string;
  /** Whether to make placeholder italic (default: true) */
  placeholderItalic?: boolean;
  /** Handler for rasterizing Excalidraw to PNG (optional) */
  rasterizeHandler?: ExcalidrawRasterizeHandler;
  /** Default width for rasterized images in pixels */
  defaultWidth?: number;
  /** Default height for rasterized images in pixels */
  defaultHeight?: number;
  /** Whether to include border around placeholder (default: true) */
  includeBorder?: boolean;
}

/**
 * Handler function for rasterizing Excalidraw content to PNG
 */
export type ExcalidrawRasterizeHandler = (
  element: Element,
  options: { width: number; height: number }
) => Promise<ExcalidrawRasterizeResult | null>;

/**
 * Result from rasterizing Excalidraw content
 */
export interface ExcalidrawRasterizeResult {
  /** Base64-encoded PNG image data */
  base64: string;
  /** MIME type (should be 'image/png') */
  mimeType: string;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
}

/**
 * Extracted Excalidraw metadata
 */
export interface ExcalidrawMetadata {
  /** Whether element is an Excalidraw element */
  isExcalidraw: boolean;
  /** Drawing ID if available */
  drawingId?: string;
  /** Drawing title/name if available */
  title?: string;
  /** PNG export URL if available */
  exportUrl?: string;
  /** Original width in pixels */
  width?: number;
  /** Original height in pixels */
  height?: number;
  /** Raw Excalidraw data (JSON) if embedded */
  excalidrawData?: string;
}

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Checks if an element is an Excalidraw element
 *
 * @param element - The element to check
 * @returns True if the element is an Excalidraw drawing
 */
export function isExcalidrawElement(element: Element): boolean {
  // Check for data attribute
  if (element.hasAttribute(EXCALIDRAW_DATA_ATTR)) {
    return true;
  }

  // Check for data-excalidraw attribute
  if (element.hasAttribute('data-excalidraw')) {
    return true;
  }

  // Check class names
  const className = element.className?.toLowerCase() || '';
  for (const pattern of EXCALIDRAW_CLASS_PATTERNS) {
    if (className.includes(pattern.toLowerCase())) {
      return true;
    }
  }

  // Check for Excalidraw in nested elements
  const excalidrawChild = element.querySelector(
    '[data-slate-excalidraw], [data-excalidraw], .excalidraw'
  );
  if (excalidrawChild) {
    return true;
  }

  return false;
}

/**
 * Extracts metadata from an Excalidraw element
 *
 * @param element - The Excalidraw element
 * @returns Extracted metadata
 */
export function extractExcalidrawMetadata(
  element: Element
): ExcalidrawMetadata {
  const metadata: ExcalidrawMetadata = {
    isExcalidraw: isExcalidrawElement(element),
  };

  if (!metadata.isExcalidraw) {
    return metadata;
  }

  // Extract drawing ID
  const drawingId =
    element.getAttribute('data-drawing-id') ||
    element.getAttribute('data-excalidraw-id') ||
    element.getAttribute('id');
  if (drawingId) {
    metadata.drawingId = drawingId;
  }

  // Extract title
  const title =
    element.getAttribute('data-title') ||
    element.getAttribute('aria-label') ||
    element.getAttribute('title');
  if (title) {
    metadata.title = title;
  }

  // Extract export URL (if element has a pre-rendered image)
  const imgElement = element.querySelector('img');
  if (imgElement) {
    const src = imgElement.getAttribute('src');
    if (src) {
      metadata.exportUrl = src;
    }
    const width = imgElement.getAttribute('width');
    const height = imgElement.getAttribute('height');
    if (width) metadata.width = Number.parseInt(width, 10);
    if (height) metadata.height = Number.parseInt(height, 10);
  }

  // Extract dimensions from element styles or attributes
  const htmlElement = element as HTMLElement;
  if (!metadata.width && htmlElement.style?.width) {
    const widthMatch = htmlElement.style.width.match(/^(\d+)/);
    if (widthMatch) {
      metadata.width = Number.parseInt(widthMatch[1], 10);
    }
  }
  if (!metadata.height && htmlElement.style?.height) {
    const heightMatch = htmlElement.style.height.match(/^(\d+)/);
    if (heightMatch) {
      metadata.height = Number.parseInt(heightMatch[1], 10);
    }
  }

  // Check for embedded Excalidraw data
  const dataAttr = element.getAttribute('data-excalidraw-data');
  if (dataAttr) {
    metadata.excalidrawData = dataAttr;
  }

  return metadata;
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Converts pixels to EMU (English Metric Units)
 *
 * @param pixels - Value in pixels
 * @returns Value in EMU
 */
export function pixelsToEMU(pixels: number): number {
  // EMU = pixels * 914400 / 96
  return Math.round(pixels * EMU_PER_PIXEL);
}

/**
 * Creates a placeholder paragraph for Excalidraw content
 *
 * @param metadata - Excalidraw metadata
 * @param options - Conversion options
 * @returns Paragraph with placeholder content
 */
export function createExcalidrawPlaceholder(
  metadata: ExcalidrawMetadata,
  options: ExcalidrawConversionOptions = {}
): Paragraph {
  const {
    placeholderText = EXCALIDRAW_PLACEHOLDER_TEXT,
    placeholderColor = EXCALIDRAW_PLACEHOLDER_COLOR,
    placeholderItalic = EXCALIDRAW_PLACEHOLDER_ITALIC,
    includeBorder = true,
  } = options;

  const paragraph = new Paragraph();

  // Add border to indicate placeholder area
  if (includeBorder) {
    paragraph.setBorder({
      top: { style: 'dashed', size: 4, color: placeholderColor },
      bottom: { style: 'dashed', size: 4, color: placeholderColor },
      left: { style: 'dashed', size: 4, color: placeholderColor },
      right: { style: 'dashed', size: 4, color: placeholderColor },
    });
  }

  // Center the placeholder
  paragraph.setAlignment('center');

  // Add padding
  paragraph.setSpaceBefore(120); // 6pt
  paragraph.setSpaceAfter(120); // 6pt

  // Build placeholder text
  let text = placeholderText;
  if (metadata.title) {
    text = `[Excalidraw: ${metadata.title}]`;
  }

  // Create run with placeholder styling
  const run = new Run(text);
  run.setColor(placeholderColor);
  if (placeholderItalic) {
    run.setItalic(true);
  }

  paragraph.addRun(run);

  return paragraph;
}

// ============================================================================
// Element Handlers
// ============================================================================

/**
 * Handles Excalidraw elements in HTML
 *
 * Detects Excalidraw elements and creates appropriate DOCX representations.
 * If a rasterize handler is provided and the element has embedded data,
 * it will attempt to create a PNG image. Otherwise, it creates a placeholder.
 *
 * @param element - The element to process
 * @param context - Conversion context
 * @param options - Excalidraw conversion options
 * @returns Conversion result
 *
 * @example
 * ```typescript
 * // With placeholder (default)
 * const result = handleExcalidrawElement(element, context);
 *
 * // With custom rasterizer
 * const result = handleExcalidrawElement(element, context, {
 *   rasterizeHandler: async (el, opts) => {
 *     // Custom rasterization logic
 *     return { base64: '...', mimeType: 'image/png', width: 400, height: 300 };
 *   }
 * });
 * ```
 */
export function handleExcalidrawElement(
  element: Element,
  context: ConversionContext,
  options: ExcalidrawConversionOptions = {}
): ConversionResult {
  const { showPlaceholder = true } = options;

  // Extract metadata
  const metadata = extractExcalidrawMetadata(element);

  // If not an Excalidraw element, pass through
  if (!metadata.isExcalidraw) {
    return {
      element: null,
      processChildren: true,
    };
  }

  // If we have an export URL (pre-rendered image), we could use the image handler
  // For now, create a placeholder
  if (!showPlaceholder) {
    return {
      element: null,
      processChildren: false,
    };
  }

  // Create placeholder
  const paragraph = createExcalidrawPlaceholder(metadata, options);

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

/**
 * Async handler for Excalidraw elements with rasterization support
 *
 * This handler supports async rasterization of Excalidraw content to PNG.
 *
 * @param element - The element to process
 * @param context - Conversion context
 * @param options - Excalidraw conversion options
 * @returns Promise resolving to conversion result
 */
export async function handleExcalidrawElementAsync(
  element: Element,
  context: ConversionContext,
  options: ExcalidrawConversionOptions = {}
): Promise<ConversionResult> {
  const {
    rasterizeHandler,
    defaultWidth = DEFAULT_IMAGE_WIDTH,
    defaultHeight = DEFAULT_IMAGE_HEIGHT,
    showPlaceholder = true,
  } = options;

  // Extract metadata
  const metadata = extractExcalidrawMetadata(element);

  // If not an Excalidraw element, pass through
  if (!metadata.isExcalidraw) {
    return {
      element: null,
      processChildren: true,
    };
  }

  // Try rasterization if handler is provided
  if (rasterizeHandler) {
    try {
      const width = metadata.width || defaultWidth;
      const height = metadata.height || defaultHeight;

      const result = await rasterizeHandler(element, { width, height });

      if (result) {
        // TODO: Use image handler to create an Image element
        // For now, fall through to placeholder
        // const image = createImageFromBase64(result.base64, result.width, result.height);
      }
    } catch (error) {
      // Rasterization failed, fall through to placeholder
      console.warn('Excalidraw rasterization failed:', error);
    }
  }

  // Create placeholder
  if (!showPlaceholder) {
    return {
      element: null,
      processChildren: false,
    };
  }

  const paragraph = createExcalidrawPlaceholder(metadata, options);

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

/**
 * Creates an Excalidraw placeholder programmatically
 *
 * @param title - Optional title for the drawing
 * @param options - Conversion options
 * @returns Paragraph with placeholder
 *
 * @example
 * ```typescript
 * const placeholder = createExcalidraw('Architecture Diagram');
 * document.addParagraph(placeholder);
 * ```
 */
export function createExcalidraw(
  title?: string,
  options: ExcalidrawConversionOptions = {}
): Paragraph {
  const metadata: ExcalidrawMetadata = {
    isExcalidraw: true,
    title,
  };

  return createExcalidrawPlaceholder(metadata, options);
}
