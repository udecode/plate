/**
 * Header/Footer Handler - Converts header/footer content specifications
 * into docXMLater Header/Footer objects.
 *
 * This module provides a declarative API for specifying header and footer
 * content, including text, page numbers, and formatting. It supports
 * different-first-page and different-odd-even configurations.
 *
 * @module header-footer-handler
 */

import type { Document } from '../docXMLater/src';
import { Header } from '../docXMLater/src/elements/Header';
import { Footer } from '../docXMLater/src/elements/Footer';
import { Paragraph } from '../docXMLater/src/elements/Paragraph';
import { Run } from '../docXMLater/src/elements/Run';
import type { RunFormatting } from '../docXMLater/src/elements/Run';
import type { ParagraphAlignment } from '../docXMLater/src/elements/Paragraph';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Content options shared between headers and footers.
 * Specifies text, formatting, and optional page number fields.
 */
interface BaseContentOptions {
  /** Text content for the header/footer */
  text?: string;
  /** HTML content for the header/footer (will be converted to paragraphs) */
  html?: string;
  /** Pre-built paragraphs to include directly */
  paragraphs?: Paragraph[];
  /** Alignment for text content */
  alignment?: 'left' | 'center' | 'right';
  /** Font size in points */
  fontSize?: number;
  /** Font family */
  fontFamily?: string;
  /** Whether to include a page number field */
  includePageNumber?: boolean;
  /** Alignment for the page number paragraph */
  pageNumberAlignment?: 'left' | 'center' | 'right';
}

/**
 * Options for specifying header content.
 *
 * At least one of `text`, `html`, `paragraphs`, or `includePageNumber`
 * should be provided; otherwise the header will contain only an empty paragraph.
 *
 * @example
 * ```typescript
 * const options: HeaderContentOptions = {
 *   text: 'My Document Title',
 *   alignment: 'center',
 *   fontSize: 10,
 *   fontFamily: 'Arial',
 * };
 * ```
 */
export interface HeaderContentOptions extends BaseContentOptions {}

/**
 * Options for specifying footer content.
 *
 * Extends the base content options with a page number format string
 * that supports `{page}` and `{total}` placeholders.
 *
 * @example
 * ```typescript
 * const options: FooterContentOptions = {
 *   includePageNumber: true,
 *   pageNumberFormat: 'Page {page} of {total}',
 *   pageNumberAlignment: 'center',
 *   fontSize: 9,
 * };
 * ```
 */
export interface FooterContentOptions extends BaseContentOptions {
  /**
   * Page number format string.
   *
   * Supports the following placeholders:
   * - `{page}` - replaced with a PAGE field (current page number)
   * - `{total}` - replaced with a NUMPAGES field (total page count)
   *
   * If not specified and `includePageNumber` is true, a simple PAGE field is added.
   *
   * @example 'Page {page} of {total}'
   * @example '{page}'
   */
  pageNumberFormat?: string;
}

/**
 * Options for different-first-page header/footer configuration.
 *
 * When applied, the document's `titlePage` property is automatically enabled,
 * which tells Word to use separate header/footer definitions for the first page.
 */
export interface DifferentFirstPageOptions {
  /** Default header (for all pages except the first) */
  defaultHeader?: HeaderContentOptions;
  /** Default footer (for all pages except the first) */
  defaultFooter?: FooterContentOptions;
  /** First page header */
  firstHeader?: HeaderContentOptions;
  /** First page footer */
  firstFooter?: FooterContentOptions;
}

/**
 * Options for different-odd-even header/footer configuration.
 *
 * When applied, Word alternates between odd-page and even-page
 * header/footer definitions.
 */
export interface DifferentOddEvenOptions {
  /** Odd (default) page header */
  oddHeader?: HeaderContentOptions;
  /** Odd (default) page footer */
  oddFooter?: FooterContentOptions;
  /** Even page header */
  evenHeader?: HeaderContentOptions;
  /** Even page footer */
  evenFooter?: FooterContentOptions;
}

/**
 * Top-level header/footer configuration for a document.
 *
 * Allows setting simple headers/footers, different-first-page layouts,
 * and different-odd-even layouts. These options can be combined;
 * `differentFirstPage` and `differentOddEven` take precedence for
 * their respective page types.
 *
 * @example
 * ```typescript
 * const config: HeaderFooterConfiguration = {
 *   header: { text: 'Document Title', alignment: 'center' },
 *   footer: {
 *     includePageNumber: true,
 *     pageNumberFormat: 'Page {page} of {total}',
 *     pageNumberAlignment: 'center',
 *   },
 * };
 * applyHeaderFooterConfiguration(doc, config);
 * ```
 */
export interface HeaderFooterConfiguration {
  /** Simple header applied to all pages (default type) */
  header?: HeaderContentOptions;
  /** Simple footer applied to all pages (default type) */
  footer?: FooterContentOptions;
  /** Different first page header/footer configuration */
  differentFirstPage?: DifferentFirstPageOptions;
  /** Different odd/even page header/footer configuration */
  differentOddEven?: DifferentOddEvenOptions;
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Builds run formatting from content options.
 *
 * @param options - Content options containing fontSize and fontFamily
 * @returns RunFormatting object, or undefined if no formatting is needed
 */
function buildRunFormatting(
  options: BaseContentOptions
): RunFormatting | undefined {
  if (!options.fontSize && !options.fontFamily) {
    return;
  }

  const formatting: RunFormatting = {};

  if (options.fontSize) {
    formatting.size = options.fontSize;
  }
  if (options.fontFamily) {
    formatting.font = options.fontFamily;
  }

  return formatting;
}

/**
 * Creates a styled paragraph with text content.
 *
 * @param text - The text to add to the paragraph
 * @param alignment - Paragraph alignment
 * @param formatting - Optional run formatting for font size and family
 * @returns A new Paragraph with the specified content and formatting
 */
function createStyledTextParagraph(
  text: string,
  alignment?: 'left' | 'center' | 'right',
  formatting?: RunFormatting
): Paragraph {
  const paragraph = new Paragraph();

  if (formatting) {
    const run = new Run(text);

    if (formatting.size) {
      run.setSize(formatting.size);
    }
    if (formatting.font) {
      run.setFont(formatting.font);
    }

    paragraph.addRun(run);
  } else {
    paragraph.addText(text);
  }

  if (alignment) {
    paragraph.setAlignment(alignment as ParagraphAlignment);
  }

  return paragraph;
}

/**
 * Creates a paragraph containing a page number field.
 *
 * @param alignment - Alignment for the page number paragraph
 * @param formatting - Optional run formatting
 * @returns A Paragraph with a PAGE field
 */
function createPageNumberParagraph(
  alignment?: 'left' | 'center' | 'right',
  formatting?: RunFormatting
): Paragraph {
  const paragraph = new Paragraph();

  paragraph.addPageNumber(formatting);

  if (alignment) {
    paragraph.setAlignment(alignment as ParagraphAlignment);
  }

  return paragraph;
}

/**
 * Creates a paragraph with a formatted page number string.
 *
 * Parses the format string for `{page}` and `{total}` placeholders and
 * inserts the corresponding PAGE / NUMPAGES fields between literal text
 * segments.
 *
 * @param format - The format string (e.g., "Page {page} of {total}")
 * @param alignment - Paragraph alignment
 * @param formatting - Optional run formatting
 * @returns A Paragraph containing runs and fields matching the format
 */
function createFormattedPageNumberParagraph(
  format: string,
  alignment?: 'left' | 'center' | 'right',
  formatting?: RunFormatting
): Paragraph {
  const paragraph = new Paragraph();

  // Split on {page} and {total} placeholders while preserving them
  const parts = format.split(/(\{page\}|\{total\})/g);

  for (const part of parts) {
    if (part === '{page}') {
      paragraph.addPageNumber(formatting);
    } else if (part === '{total}') {
      paragraph.addTotalPages(formatting);
    } else if (part.length > 0) {
      if (formatting) {
        const run = new Run(part);

        if (formatting.size) {
          run.setSize(formatting.size);
        }
        if (formatting.font) {
          run.setFont(formatting.font);
        }

        paragraph.addRun(run);
      } else {
        paragraph.addText(part);
      }
    }
  }

  if (alignment) {
    paragraph.setAlignment(alignment as ParagraphAlignment);
  }

  return paragraph;
}

/**
 * Populates a header or footer with content from the given options.
 *
 * @param headerOrFooter - The Header or Footer instance to populate
 * @param options - Content options describing what to add
 * @param isFooter - Whether this is a footer (enables pageNumberFormat support)
 */
function populateContent(
  headerOrFooter: Header | Footer,
  options: BaseContentOptions & { pageNumberFormat?: string },
  isFooter = false
): void {
  const formatting = buildRunFormatting(options);

  // 1. Add pre-built paragraphs first
  if (options.paragraphs && options.paragraphs.length > 0) {
    for (const para of options.paragraphs) {
      headerOrFooter.addParagraph(para);
    }
  }

  // 2. Add text content
  if (options.text) {
    const textParagraph = createStyledTextParagraph(
      options.text,
      options.alignment,
      formatting
    );
    headerOrFooter.addParagraph(textParagraph);
  }

  // 3. Add HTML content as plain text (HTML parsing is outside scope;
  //    strip tags and use the text content)
  if (options.html) {
    // Simple HTML-to-text: strip tags for header/footer context.
    // Full HTML parsing is handled by the html-to-document adapter.
    const plainText = options.html.replace(/<[^>]*>/g, '');

    if (plainText.trim().length > 0) {
      const htmlParagraph = createStyledTextParagraph(
        plainText.trim(),
        options.alignment,
        formatting
      );
      headerOrFooter.addParagraph(htmlParagraph);
    }
  }

  // 4. Add page number field
  if (options.includePageNumber) {
    const pageNumberFormatStr = isFooter
      ? (options as FooterContentOptions).pageNumberFormat
      : undefined;

    if (pageNumberFormatStr) {
      const pageNumParagraph = createFormattedPageNumberParagraph(
        pageNumberFormatStr,
        options.pageNumberAlignment || options.alignment,
        formatting
      );
      headerOrFooter.addParagraph(pageNumParagraph);
    } else {
      const pageNumParagraph = createPageNumberParagraph(
        options.pageNumberAlignment || options.alignment,
        formatting
      );
      headerOrFooter.addParagraph(pageNumParagraph);
    }
  }
}

// ============================================================================
// Public API - Header Creation
// ============================================================================

/**
 * Creates a Header from declarative content options.
 *
 * The header is created with the specified type (default, first, or even)
 * and populated with the content described by the options.
 *
 * @param options - Header content options
 * @param type - Header type: 'default', 'first', or 'even'
 * @returns A populated Header instance
 *
 * @example
 * ```typescript
 * const header = createHeaderFromOptions(
 *   { text: 'Chapter 1', alignment: 'center', fontSize: 10 },
 *   'default'
 * );
 * doc.setHeader(header);
 * ```
 */
export function createHeaderFromOptions(
  options: HeaderContentOptions,
  type: 'default' | 'first' | 'even' = 'default'
): Header {
  let header: Header;

  switch (type) {
    case 'first': {
      header = Header.createFirst();
      break;
    }
    case 'even': {
      header = Header.createEven();
      break;
    }
    default: {
      header = Header.createDefault();
      break;
    }
  }

  populateContent(header, options, false);

  return header;
}

// ============================================================================
// Public API - Footer Creation
// ============================================================================

/**
 * Creates a Footer from declarative content options.
 *
 * The footer is created with the specified type (default, first, or even)
 * and populated with the content described by the options. Footer-specific
 * options like `pageNumberFormat` are supported.
 *
 * @param options - Footer content options
 * @param type - Footer type: 'default', 'first', or 'even'
 * @returns A populated Footer instance
 *
 * @example
 * ```typescript
 * const footer = createFooterFromOptions(
 *   {
 *     includePageNumber: true,
 *     pageNumberFormat: 'Page {page} of {total}',
 *     pageNumberAlignment: 'center',
 *     fontSize: 9,
 *   },
 *   'default'
 * );
 * doc.setFooter(footer);
 * ```
 */
export function createFooterFromOptions(
  options: FooterContentOptions,
  type: 'default' | 'first' | 'even' = 'default'
): Footer {
  let footer: Footer;

  switch (type) {
    case 'first': {
      footer = Footer.createFirst();
      break;
    }
    case 'even': {
      footer = Footer.createEven();
      break;
    }
    default: {
      footer = Footer.createDefault();
      break;
    }
  }

  populateContent(footer, options, true);

  return footer;
}

// ============================================================================
// Public API - Different First Page
// ============================================================================

/**
 * Applies different-first-page header/footer configuration to a document.
 *
 * Sets both the default headers/footers (for all pages after the first)
 * and the first-page headers/footers. Automatically enables the document's
 * `titlePage` property through the Document's `setFirstPageHeader` /
 * `setFirstPageFooter` methods.
 *
 * @param doc - The document to apply the configuration to
 * @param options - Different-first-page options
 *
 * @example
 * ```typescript
 * applyDifferentFirstPage(doc, {
 *   defaultHeader: { text: 'My Document', alignment: 'right' },
 *   defaultFooter: { includePageNumber: true, pageNumberAlignment: 'center' },
 *   firstHeader: { text: 'Title Page', alignment: 'center', fontSize: 14 },
 *   firstFooter: { text: '' },
 * });
 * ```
 */
export function applyDifferentFirstPage(
  doc: Document,
  options: DifferentFirstPageOptions
): void {
  // Apply default headers/footers
  if (options.defaultHeader) {
    const header = createHeaderFromOptions(options.defaultHeader, 'default');
    doc.setHeader(header);
  }

  if (options.defaultFooter) {
    const footer = createFooterFromOptions(options.defaultFooter, 'default');
    doc.setFooter(footer);
  }

  // Apply first-page headers/footers (these auto-enable titlePage)
  if (options.firstHeader) {
    const header = createHeaderFromOptions(options.firstHeader, 'first');
    doc.setFirstPageHeader(header);
  }

  if (options.firstFooter) {
    const footer = createFooterFromOptions(options.firstFooter, 'first');
    doc.setFirstPageFooter(footer);
  }
}

// ============================================================================
// Public API - Different Odd/Even
// ============================================================================

/**
 * Applies different-odd-even header/footer configuration to a document.
 *
 * Sets separate headers/footers for odd pages (using the 'default' type)
 * and even pages. This is useful for printed documents where left and
 * right pages have different layouts.
 *
 * @param doc - The document to apply the configuration to
 * @param options - Different-odd-even options
 *
 * @example
 * ```typescript
 * applyDifferentOddEven(doc, {
 *   oddHeader: { text: 'Chapter Title', alignment: 'right' },
 *   oddFooter: { includePageNumber: true, pageNumberAlignment: 'right' },
 *   evenHeader: { text: 'Book Title', alignment: 'left' },
 *   evenFooter: { includePageNumber: true, pageNumberAlignment: 'left' },
 * });
 * ```
 */
export function applyDifferentOddEven(
  doc: Document,
  options: DifferentOddEvenOptions
): void {
  // Odd pages use the 'default' header/footer type
  if (options.oddHeader) {
    const header = createHeaderFromOptions(options.oddHeader, 'default');
    doc.setHeader(header);
  }

  if (options.oddFooter) {
    const footer = createFooterFromOptions(options.oddFooter, 'default');
    doc.setFooter(footer);
  }

  // Even pages use the 'even' header/footer type
  if (options.evenHeader) {
    const header = createHeaderFromOptions(options.evenHeader, 'even');
    doc.setEvenPageHeader(header);
  }

  if (options.evenFooter) {
    const footer = createFooterFromOptions(options.evenFooter, 'even');
    doc.setEvenPageFooter(footer);
  }
}

// ============================================================================
// Public API - Main Integration Function
// ============================================================================

/**
 * Applies a complete header/footer configuration to a document.
 *
 * This is the primary entry point for setting up headers and footers.
 * It processes the configuration in the following order:
 *
 * 1. Simple `header`/`footer` are set as the default (all pages).
 * 2. `differentFirstPage` overrides or supplements with first-page variants.
 * 3. `differentOddEven` overrides or supplements with even-page variants.
 *
 * @param doc - The document to configure
 * @param config - The header/footer configuration
 *
 * @example
 * ```typescript
 * applyHeaderFooterConfiguration(doc, {
 *   header: { text: 'My Report', alignment: 'center', fontFamily: 'Arial' },
 *   footer: {
 *     includePageNumber: true,
 *     pageNumberFormat: 'Page {page} of {total}',
 *     pageNumberAlignment: 'center',
 *     fontSize: 9,
 *   },
 *   differentFirstPage: {
 *     firstHeader: { text: '' },
 *     firstFooter: { text: 'Draft - Confidential', alignment: 'center' },
 *   },
 * });
 * ```
 */
export function applyHeaderFooterConfiguration(
  doc: Document,
  config: HeaderFooterConfiguration
): void {
  // 1. Apply simple default header/footer
  if (config.header) {
    const header = createHeaderFromOptions(config.header, 'default');
    doc.setHeader(header);
  }

  if (config.footer) {
    const footer = createFooterFromOptions(config.footer, 'default');
    doc.setFooter(footer);
  }

  // 2. Apply different-first-page configuration
  if (config.differentFirstPage) {
    applyDifferentFirstPage(doc, config.differentFirstPage);
  }

  // 3. Apply different-odd-even configuration
  if (config.differentOddEven) {
    applyDifferentOddEven(doc, config.differentOddEven);
  }
}
