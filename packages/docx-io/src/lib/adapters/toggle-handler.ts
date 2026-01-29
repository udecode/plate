/**
 * Toggle Handler - HTML toggle/collapsible elements to DOCX paragraphs
 *
 * This module provides handlers for converting HTML toggle/collapsible elements
 * to docXMLater Paragraphs. Since DOCX does not natively support collapsible
 * content, toggles are exported as always-expanded with visual styling to
 * indicate the toggle structure.
 *
 * Supports:
 * - <details>/<summary> elements
 * - Custom toggle elements with data attributes
 * - Toggle header styling
 * - Content indentation
 *
 * @module toggle-handler
 */

import { Paragraph, Run } from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Constants
// ============================================================================

/** Toggle expand indicator (shown in exports since DOCX doesn't support collapse) */
export const TOGGLE_EXPAND_INDICATOR = '▼';

/** Toggle collapse indicator (for reference, not used in export) */
export const TOGGLE_COLLAPSE_INDICATOR = '▶';

/** Default left indentation for toggle content in twips (720 = 0.5 inch) */
export const TOGGLE_CONTENT_INDENT = 720;

/** Default styling for toggle header */
export const TOGGLE_HEADER_COLOR = '333333';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for toggle conversion
 */
export interface ToggleConversionOptions {
  /** Indicator character to show before header (default: '▼') */
  expandIndicator?: string;
  /** Whether to show the expand indicator (default: true) */
  showIndicator?: boolean;
  /** Left indentation for content in twips (default: 720) */
  contentIndent?: number;
  /** Whether to make header bold (default: true) */
  boldHeader?: boolean;
  /** Header text color in hex without # (default: '333333') */
  headerColor?: string;
  /** Whether to add a blank paragraph after the toggle (default: false) */
  addTrailingSpace?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extracts toggle header text from element
 * Looks for <summary> element or data-header attribute
 *
 * @param element - The toggle element
 * @returns Header text or null
 */
export function extractToggleHeader(element: Element): string | null {
  // Check for <summary> element (standard HTML5 details/summary)
  const summary = element.querySelector('summary');
  if (summary) {
    return summary.textContent?.trim() || null;
  }

  // Check data attribute
  const dataHeader = element.getAttribute('data-header');
  if (dataHeader) {
    return dataHeader;
  }

  // Check data-title attribute
  const dataTitle = element.getAttribute('data-title');
  if (dataTitle) {
    return dataTitle;
  }

  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    return ariaLabel;
  }

  return null;
}

/**
 * Extracts toggle content from element
 * Gets all content except the summary/header
 *
 * @param element - The toggle element
 * @returns Content text
 */
export function extractToggleContent(element: Element): string {
  // Clone the element to work with
  const clone = element.cloneNode(true) as Element;

  // Remove summary element if present
  const summary = clone.querySelector('summary');
  if (summary) {
    summary.remove();
  }

  // Get remaining text content
  return clone.textContent?.trim() || '';
}

/**
 * Checks if an element is a toggle element
 *
 * @param element - Element to check
 * @returns True if element is a toggle
 */
export function isToggleElement(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();

  // HTML5 <details> element
  if (tagName === 'details') {
    return true;
  }

  // Custom toggle with data attributes
  if (
    element.hasAttribute('data-toggle') ||
    element.hasAttribute('data-collapsible') ||
    element.hasAttribute('data-expandable')
  ) {
    return true;
  }

  // Check class names
  const className = element.className || '';
  if (
    className.includes('toggle') ||
    className.includes('collapsible') ||
    className.includes('expandable') ||
    className.includes('accordion')
  ) {
    return true;
  }

  return false;
}

// ============================================================================
// Toggle Handlers
// ============================================================================

/**
 * Handles <details> elements (HTML5 collapsible content)
 *
 * Since DOCX doesn't support collapsible content, the toggle is exported
 * as always-expanded with visual indicators.
 *
 * @param element - The <details> element
 * @param context - Conversion context
 * @param options - Toggle conversion options
 * @returns Conversion result with Paragraph(s)
 *
 * @example
 * ```typescript
 * // <details>
 * //   <summary>Click to expand</summary>
 * //   <p>Hidden content here</p>
 * // </details>
 * const result = handleDetailsElement(detailsElement, context);
 * ```
 */
export function handleDetailsElement(
  element: Element,
  context: ConversionContext,
  options: ToggleConversionOptions = {}
): ConversionResult {
  const {
    expandIndicator = TOGGLE_EXPAND_INDICATOR,
    showIndicator = true,
    contentIndent = TOGGLE_CONTENT_INDENT,
    boldHeader = true,
    headerColor = TOGGLE_HEADER_COLOR,
  } = options;

  const paragraphs: Paragraph[] = [];

  // Create header paragraph
  const headerText = extractToggleHeader(element);
  if (headerText) {
    const headerParagraph = new Paragraph();

    // Add expand indicator
    if (showIndicator) {
      const indicatorRun = new Run(expandIndicator + ' ');
      indicatorRun.setColor(headerColor);
      headerParagraph.addRun(indicatorRun);
    }

    // Add header text
    const headerRun = new Run(headerText);
    headerRun.setColor(headerColor);
    if (boldHeader) {
      headerRun.setBold(true);
    }
    headerParagraph.addRun(headerRun);

    paragraphs.push(headerParagraph);
  }

  // Create content paragraph with indentation
  const contentText = extractToggleContent(element);
  if (contentText) {
    const contentParagraph = new Paragraph();
    contentParagraph.setLeftIndent(contentIndent);

    const contentRun = new Run(contentText);
    contentParagraph.addRun(contentRun);

    paragraphs.push(contentParagraph);
  }

  // Return result
  if (paragraphs.length === 0) {
    return {
      element: null,
      processChildren: true,
      childContext: {
        inheritedFormatting: {
          ...(context.inheritedFormatting || {}),
        },
      },
    };
  }

  if (paragraphs.length === 1) {
    return {
      element: paragraphs[0] as unknown as ConversionResult['element'],
      processChildren: false,
    };
  }

  return {
    element: paragraphs[0] as unknown as ConversionResult['element'],
    elements: paragraphs as unknown as ConversionResult['elements'],
    processChildren: false,
  };
}

/**
 * Handles <summary> elements (toggle headers)
 *
 * When encountered outside of details handling, treats as a styled heading.
 *
 * @param element - The <summary> element
 * @param context - Conversion context
 * @param options - Toggle conversion options
 * @returns Conversion result with styled Paragraph
 */
export function handleSummaryElement(
  element: Element,
  context: ConversionContext,
  options: ToggleConversionOptions = {}
): ConversionResult {
  const {
    expandIndicator = TOGGLE_EXPAND_INDICATOR,
    showIndicator = true,
    boldHeader = true,
    headerColor = TOGGLE_HEADER_COLOR,
  } = options;

  const paragraph = new Paragraph();

  // Add expand indicator
  if (showIndicator) {
    const indicatorRun = new Run(expandIndicator + ' ');
    indicatorRun.setColor(headerColor);
    paragraph.addRun(indicatorRun);
  }

  // Get text content
  const textContent = element.textContent?.trim() || '';
  if (textContent) {
    const textRun = new Run(textContent);
    textRun.setColor(headerColor);
    if (boldHeader) {
      textRun.setBold(true);
    }
    paragraph.addRun(textRun);
  }

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

/**
 * Handles generic toggle elements
 *
 * For custom toggle elements with data attributes or class names.
 *
 * @param element - The toggle element
 * @param context - Conversion context
 * @param options - Toggle conversion options
 * @returns Conversion result
 */
export function handleToggleElement(
  element: Element,
  context: ConversionContext,
  options: ToggleConversionOptions = {}
): ConversionResult {
  // Delegate to details handler for consistent behavior
  return handleDetailsElement(element, context, options);
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Creates a toggle section (header + content) programmatically
 *
 * @param header - Toggle header text
 * @param content - Toggle content (string or array of strings)
 * @param options - Toggle conversion options
 * @returns Array of paragraphs representing the toggle
 *
 * @example
 * ```typescript
 * const paragraphs = createToggle('Click to expand', 'This is the hidden content');
 * paragraphs.forEach(p => document.addParagraph(p));
 * ```
 */
export function createToggle(
  header: string,
  content: string | string[],
  options: ToggleConversionOptions = {}
): Paragraph[] {
  const {
    expandIndicator = TOGGLE_EXPAND_INDICATOR,
    showIndicator = true,
    contentIndent = TOGGLE_CONTENT_INDENT,
    boldHeader = true,
    headerColor = TOGGLE_HEADER_COLOR,
    addTrailingSpace = false,
  } = options;

  const paragraphs: Paragraph[] = [];

  // Create header paragraph
  const headerParagraph = new Paragraph();

  if (showIndicator) {
    const indicatorRun = new Run(expandIndicator + ' ');
    indicatorRun.setColor(headerColor);
    headerParagraph.addRun(indicatorRun);
  }

  const headerRun = new Run(header);
  headerRun.setColor(headerColor);
  if (boldHeader) {
    headerRun.setBold(true);
  }
  headerParagraph.addRun(headerRun);

  paragraphs.push(headerParagraph);

  // Create content paragraphs
  const contentLines = Array.isArray(content) ? content : [content];
  for (const line of contentLines) {
    const contentParagraph = new Paragraph();
    contentParagraph.setLeftIndent(contentIndent);
    contentParagraph.addRun(new Run(line));
    paragraphs.push(contentParagraph);
  }

  // Add trailing space if requested
  if (addTrailingSpace) {
    paragraphs.push(new Paragraph());
  }

  return paragraphs;
}

/**
 * Creates an accordion (multiple toggles) programmatically
 *
 * @param items - Array of toggle items with header and content
 * @param options - Toggle conversion options
 * @returns Array of paragraphs representing all toggles
 *
 * @example
 * ```typescript
 * const accordion = createAccordion([
 *   { header: 'Section 1', content: 'Content 1' },
 *   { header: 'Section 2', content: 'Content 2' },
 * ]);
 * accordion.forEach(p => document.addParagraph(p));
 * ```
 */
export function createAccordion(
  items: Array<{ header: string; content: string | string[] }>,
  options: ToggleConversionOptions = {}
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const item of items) {
    const toggleParagraphs = createToggle(item.header, item.content, {
      ...options,
      addTrailingSpace: true,
    });
    paragraphs.push(...toggleParagraphs);
  }

  // Remove trailing blank paragraph from last item
  if (
    paragraphs.length > 0 &&
    !paragraphs[paragraphs.length - 1]?.getContent().length
  ) {
    paragraphs.pop();
  }

  return paragraphs;
}
