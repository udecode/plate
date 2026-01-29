/**
 * Caption Handler - HTML figure/figcaption elements to DOCX caption conversion
 *
 * This module provides handlers for converting HTML figure and figcaption
 * elements to docXMLater Paragraphs with DOCX Caption style.
 *
 * Supports:
 * - <figure> with <figcaption> elements
 * - Standalone <figcaption> elements
 * - Elements with data-caption attribute
 * - Caption numbering (e.g., "Figure 1:", "Table 2:")
 *
 * @module caption-handler
 */

import { Paragraph, Run, type RunFormatting } from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Constants
// ============================================================================

/** Default caption style name in DOCX */
export const CAPTION_STYLE = 'Caption';

/** Default caption color (gray) */
export const CAPTION_COLOR = '6B7280';

/** Caption font size in half-points (9pt = 18 half-points) */
export const CAPTION_FONT_SIZE = 18;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Caption type for automatic numbering
 */
export type CaptionType =
  | 'figure'
  | 'table'
  | 'equation'
  | 'listing'
  | 'custom';

/**
 * Options for caption conversion
 */
export interface CaptionConversionOptions {
  /** Caption type for numbering */
  type?: CaptionType;
  /** Whether to include automatic numbering (default: false) */
  includeNumbering?: boolean;
  /** Custom prefix (e.g., "Figure", "Table") */
  prefix?: string;
  /** Caption number (if numbering is manual) */
  number?: number;
  /** Whether to apply italic formatting (default: true) */
  italic?: boolean;
  /** Custom caption color (hex without #) */
  color?: string;
  /** Whether to center the caption (default: true) */
  center?: boolean;
  /** Font size in half-points (default: 18 for 9pt) */
  fontSize?: number;
}

/**
 * Parsed caption data
 */
export interface ParsedCaption {
  /** Caption text content */
  text: string;
  /** Caption type (figure, table, etc.) */
  type?: CaptionType;
  /** Caption number if specified */
  number?: number;
  /** Whether the caption has a prefix */
  hasPrefix: boolean;
  /** The prefix text if present */
  prefix?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Detects if an element is a figure element
 *
 * @param element - Element to check
 * @returns True if element is a figure
 */
export function isFigureElement(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();
  return tagName === 'figure';
}

/**
 * Detects if an element is a figcaption element
 *
 * @param element - Element to check
 * @returns True if element is a figcaption
 */
export function isFigcaptionElement(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();

  if (tagName === 'figcaption') {
    return true;
  }

  // Check for data-slate-type
  if (
    element.hasAttribute('data-slate-type') &&
    element.getAttribute('data-slate-type') === 'caption'
  ) {
    return true;
  }

  // Check for caption-related classes
  const className = element.className || '';
  if (typeof className === 'string' && className.includes('caption')) {
    return true;
  }

  return false;
}

/**
 * Detects if an element has caption data
 *
 * @param element - Element to check
 * @returns True if element has caption
 */
export function hasCaptionData(element: Element): boolean {
  return (
    element.hasAttribute('data-caption') ||
    element.querySelector('figcaption') !== null
  );
}

/**
 * Extracts caption data from an element
 *
 * @param element - The caption element
 * @returns Parsed caption data
 */
export function extractCaptionData(element: Element): ParsedCaption {
  // Get text content
  let text = element.textContent?.trim() || '';

  // If this is a figure, look for figcaption
  if (element.tagName.toLowerCase() === 'figure') {
    const figcaption = element.querySelector('figcaption');
    if (figcaption) {
      text = figcaption.textContent?.trim() || '';
    } else {
      // Check for data-caption attribute
      text = element.getAttribute('data-caption') || text;
    }
  }

  // Detect caption type from attributes
  let type: CaptionType | undefined;
  const typeAttr =
    element.getAttribute('data-caption-type') ||
    element.getAttribute('data-type');
  if (typeAttr) {
    type = typeAttr as CaptionType;
  }

  // Detect caption number
  let number: number | undefined;
  const numberAttr =
    element.getAttribute('data-caption-number') ||
    element.getAttribute('data-number');
  if (numberAttr) {
    number = Number.parseInt(numberAttr, 10);
    if (isNaN(number)) number = undefined;
  }

  // Check for prefix in text
  const prefixMatch = text.match(
    /^(Figure|Table|Equation|Listing|Image)\s*(\d+)?[:.]?\s*/i
  );
  let hasPrefix = false;
  let prefix: string | undefined;

  if (prefixMatch) {
    hasPrefix = true;
    prefix = prefixMatch[1];

    // Detect type from prefix if not specified
    if (!type) {
      const prefixLower = prefix.toLowerCase();
      if (prefixLower === 'figure' || prefixLower === 'image') {
        type = 'figure';
      } else if (prefixLower === 'table') {
        type = 'table';
      } else if (prefixLower === 'equation') {
        type = 'equation';
      } else if (prefixLower === 'listing') {
        type = 'listing';
      }
    }

    // Extract number from prefix if not specified
    if (!number && prefixMatch[2]) {
      number = Number.parseInt(prefixMatch[2], 10);
    }
  }

  return {
    text,
    type,
    number,
    hasPrefix,
    prefix,
  };
}

/**
 * Builds caption text with optional numbering
 *
 * @param text - Base caption text
 * @param options - Caption options
 * @returns Formatted caption text
 */
export function buildCaptionText(
  text: string,
  options: CaptionConversionOptions = {}
): string {
  const { type, includeNumbering = false, prefix, number } = options;

  // If numbering is not requested, return text as-is
  if (!includeNumbering) {
    return text;
  }

  // Determine prefix
  let captionPrefix = prefix;
  if (!captionPrefix && type) {
    const prefixMap: Record<CaptionType, string> = {
      figure: 'Figure',
      table: 'Table',
      equation: 'Equation',
      listing: 'Listing',
      custom: '',
    };
    captionPrefix = prefixMap[type];
  }

  // Build numbered caption
  if (captionPrefix && number !== undefined) {
    return `${captionPrefix} ${number}: ${text}`;
  }
  if (captionPrefix) {
    return `${captionPrefix}: ${text}`;
  }

  return text;
}

// ============================================================================
// Caption Handlers
// ============================================================================

/**
 * Handles figure elements
 *
 * Processes figure content and extracts caption for styling.
 *
 * @param element - The figure element
 * @param context - Conversion context
 * @param options - Conversion options
 * @returns Conversion result
 *
 * @example
 * ```typescript
 * // HTML: <figure><img src="..."/><figcaption>Figure 1: My Image</figcaption></figure>
 * const result = handleFigureElement(element, context);
 * ```
 */
export function handleFigureElement(
  element: Element,
  context: ConversionContext,
  options: CaptionConversionOptions = {}
): ConversionResult {
  // For figure elements, we process children normally
  // The figcaption will be handled separately
  return {
    element: null,
    processChildren: true,
  };
}

/**
 * Handles figcaption elements
 *
 * Creates a styled Paragraph with DOCX Caption style.
 *
 * @param element - The figcaption element
 * @param context - Conversion context
 * @param options - Conversion options
 * @returns Conversion result with styled Paragraph
 *
 * @example
 * ```typescript
 * // HTML: <figcaption>Figure 1: Description of the image</figcaption>
 * const result = handleFigcaptionElement(element, context);
 * // Creates a centered, italic paragraph with Caption style
 * ```
 */
export function handleFigcaptionElement(
  element: Element,
  context: ConversionContext,
  options: CaptionConversionOptions = {}
): ConversionResult {
  const {
    italic = true,
    color = CAPTION_COLOR,
    center = true,
    fontSize = CAPTION_FONT_SIZE,
  } = options;

  // Extract caption data
  const captionData = extractCaptionData(element);

  // Build caption text
  const text = buildCaptionText(captionData.text, {
    ...options,
    type: options.type || captionData.type,
    number: options.number || captionData.number,
  });

  // Create paragraph with Caption style
  const paragraph = new Paragraph();
  paragraph.setStyle(CAPTION_STYLE);

  // Apply alignment
  if (center) {
    paragraph.setAlignment('center');
  }

  // Build run formatting
  const formatting: RunFormatting = {
    color,
    italic,
    size: fontSize,
    ...(context.inheritedFormatting || {}),
  };

  // Create and add run
  const run = new Run(text, formatting);
  paragraph.addRun(run);

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

/**
 * Handles caption elements (generic)
 *
 * Detects caption type and creates appropriate styled paragraph.
 *
 * @param element - The caption element
 * @param context - Conversion context
 * @param options - Conversion options
 * @returns Conversion result
 */
export function handleCaptionElement(
  element: Element,
  context: ConversionContext,
  options: CaptionConversionOptions = {}
): ConversionResult {
  // Check if this is a figure - process children normally
  if (isFigureElement(element)) {
    return handleFigureElement(element, context, options);
  }

  // Check if this is a figcaption or has caption data
  if (isFigcaptionElement(element) || hasCaptionData(element)) {
    return handleFigcaptionElement(element, context, options);
  }

  // Not a caption element
  return {
    element: null,
    processChildren: true,
  };
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Creates a caption Paragraph directly
 *
 * @param text - Caption text
 * @param options - Conversion options
 * @returns Styled Paragraph
 *
 * @example
 * ```typescript
 * const caption = createCaption('My beautiful image', { type: 'figure', number: 1 });
 * document.addParagraph(caption);
 * ```
 */
export function createCaption(
  text: string,
  options: CaptionConversionOptions = {}
): Paragraph {
  const {
    italic = true,
    color = CAPTION_COLOR,
    center = true,
    fontSize = CAPTION_FONT_SIZE,
    includeNumbering = false,
  } = options;

  // Build caption text
  const captionText = buildCaptionText(text, { ...options, includeNumbering });

  // Create paragraph with Caption style
  const paragraph = new Paragraph();
  paragraph.setStyle(CAPTION_STYLE);

  // Apply alignment
  if (center) {
    paragraph.setAlignment('center');
  }

  // Build run formatting
  const formatting: RunFormatting = {
    color,
    italic,
    size: fontSize,
  };

  // Create and add run
  const run = new Run(captionText, formatting);
  paragraph.addRun(run);

  return paragraph;
}

/**
 * Creates a figure caption
 *
 * @param text - Caption text
 * @param number - Figure number
 * @param options - Additional options
 * @returns Styled Paragraph
 */
export function createFigureCaption(
  text: string,
  number?: number,
  options?: Omit<CaptionConversionOptions, 'type' | 'number'>
): Paragraph {
  return createCaption(text, {
    ...options,
    type: 'figure',
    number,
    includeNumbering: number !== undefined,
  });
}

/**
 * Creates a table caption
 *
 * @param text - Caption text
 * @param number - Table number
 * @param options - Additional options
 * @returns Styled Paragraph
 */
export function createTableCaption(
  text: string,
  number?: number,
  options?: Omit<CaptionConversionOptions, 'type' | 'number'>
): Paragraph {
  return createCaption(text, {
    ...options,
    type: 'table',
    number,
    includeNumbering: number !== undefined,
  });
}

/**
 * Creates an equation caption
 *
 * @param text - Caption text
 * @param number - Equation number
 * @param options - Additional options
 * @returns Styled Paragraph
 */
export function createEquationCaption(
  text: string,
  number?: number,
  options?: Omit<CaptionConversionOptions, 'type' | 'number'>
): Paragraph {
  return createCaption(text, {
    ...options,
    type: 'equation',
    number,
    includeNumbering: number !== undefined,
  });
}

/**
 * Creates a listing/code caption
 *
 * @param text - Caption text
 * @param number - Listing number
 * @param options - Additional options
 * @returns Styled Paragraph
 */
export function createListingCaption(
  text: string,
  number?: number,
  options?: Omit<CaptionConversionOptions, 'type' | 'number'>
): Paragraph {
  return createCaption(text, {
    ...options,
    type: 'listing',
    number,
    includeNumbering: number !== undefined,
  });
}
