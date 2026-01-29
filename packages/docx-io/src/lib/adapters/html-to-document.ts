/**
 * HTML to Document Adapter
 *
 * Converts HTML content to a docXMLater Document object.
 * This adapter bridges the gap between HTML input and the internal document representation.
 *
 * @module adapters/html-to-document
 */

import {
  Document,
  PAGE_SIZES,
  inchesToTwips,
  type DocumentProperties,
  type RunFormatting,
  type ParagraphFormatting,
  type Margins,
  type PageSize,
  type PageOrientation,
} from '../docXMLater/src';

import {
  parseHtml,
  parseHtmlSync,
  isElementNode,
  isTextNode,
  getTagName,
  type HTMLElement,
  type Node,
  type Text,
} from './html-parser';

import { getHandler, type ConversionContext } from './element-handlers';

/**
 * Options for HTML to Document conversion
 */
export interface HtmlToDocumentOptions {
  /**
   * The HTML string to convert to a Document
   */
  html: string;

  /**
   * Document properties (title, author, etc.)
   */
  properties?: DocumentProperties;

  /**
   * Page size preset or custom dimensions
   */
  pageSize?: 'letter' | 'a4' | 'legal' | PageSize;

  /**
   * Page orientation
   */
  orientation?: PageOrientation;

  /**
   * Page margins in twips
   */
  margins?: Partial<Margins>;

  /**
   * Default font family for the document
   */
  defaultFontFamily?: string;

  /**
   * Default font size in half-points (e.g., 24 = 12pt)
   */
  defaultFontSize?: number;

  /**
   * Whether to preserve whitespace from HTML
   */
  preserveWhitespace?: boolean;

  /**
   * Base URL for resolving relative image URLs
   */
  baseUrl?: string;

  /**
   * Custom style mapping from HTML elements/classes to formatting
   */
  styleMapping?: HtmlStyleMapping;
}

/**
 * Mapping of HTML elements and CSS classes to document formatting
 */
export interface HtmlStyleMapping {
  /**
   * Map HTML element names to paragraph formatting
   */
  elements?: Record<string, Partial<ParagraphFormatting>>;

  /**
   * Map CSS class names to run formatting
   */
  classes?: Record<string, Partial<RunFormatting>>;

  /**
   * Map inline styles to run formatting
   */
  inlineStyles?: Record<string, Partial<RunFormatting>>;
}

/**
 * Result of HTML to Document conversion
 */
export interface HtmlToDocumentResult {
  /**
   * The created Document object
   */
  document: Document;

  /**
   * Any warnings generated during conversion
   */
  warnings: ConversionWarning[];

  /**
   * Statistics about the conversion
   */
  stats: ConversionStats;
}

/**
 * Warning generated during HTML conversion
 */
export interface ConversionWarning {
  /**
   * Warning type
   */
  type:
    | 'unsupported-element'
    | 'invalid-style'
    | 'image-fetch-failed'
    | 'unknown';

  /**
   * Warning message
   */
  message: string;

  /**
   * The HTML element or attribute that caused the warning
   */
  source?: string;
}

/**
 * Statistics about the HTML to Document conversion
 */
export interface ConversionStats {
  /**
   * Number of paragraphs created
   */
  paragraphCount: number;

  /**
   * Number of images processed
   */
  imageCount: number;

  /**
   * Number of tables created
   */
  tableCount: number;

  /**
   * Number of lists created
   */
  listCount: number;

  /**
   * Number of hyperlinks created
   */
  hyperlinkCount: number;

  /**
   * Processing time in milliseconds
   */
  processingTimeMs: number;
}

// ============================================================================
// Page Size Resolution
// ============================================================================

/**
 * Resolve page size from preset or custom dimensions
 */
function resolvePageSize(
  pageSize: 'letter' | 'a4' | 'legal' | PageSize | undefined,
  orientation?: PageOrientation
): PageSize {
  let size: PageSize;

  if (!pageSize) {
    // Default to Letter size
    size = { ...PAGE_SIZES.LETTER };
  } else if (typeof pageSize === 'string') {
    // Preset page size
    switch (pageSize.toLowerCase()) {
      case 'letter':
        size = { ...PAGE_SIZES.LETTER };
        break;
      case 'a4':
        size = { ...PAGE_SIZES.A4 };
        break;
      case 'legal':
        size = { ...PAGE_SIZES.LEGAL };
        break;
      default:
        size = { ...PAGE_SIZES.LETTER };
    }
  } else {
    // Custom dimensions
    size = { ...pageSize };
  }

  // Apply orientation
  if (orientation === 'landscape' && size.width < size.height) {
    const temp = size.width;
    size.width = size.height;
    size.height = temp;
    size.orientation = 'landscape';
  } else if (orientation === 'portrait' && size.width > size.height) {
    const temp = size.width;
    size.width = size.height;
    size.height = temp;
    size.orientation = 'portrait';
  }

  return size;
}

/**
 * Default margins (1 inch all around)
 */
const DEFAULT_MARGINS: Margins = {
  top: inchesToTwips(1),
  right: inchesToTwips(1),
  bottom: inchesToTwips(1),
  left: inchesToTwips(1),
  header: inchesToTwips(0.5),
  footer: inchesToTwips(0.5),
};

// ============================================================================
// HTML to Document Conversion
// ============================================================================

/**
 * Converts HTML content to a docXMLater Document object.
 *
 * This function parses the provided HTML and creates a corresponding
 * Document with paragraphs, runs, tables, images, and other elements.
 *
 * @param options - The conversion options including the HTML content
 * @returns A promise resolving to the conversion result with the Document
 *
 * @example
 * ```typescript
 * const result = await htmlToDocument({
 *   html: '<p>Hello <strong>World</strong>!</p>',
 *   pageSize: 'letter',
 *   properties: {
 *     title: 'My Document',
 *     creator: 'My App',
 *   },
 * });
 *
 * await result.document.save('output.docx');
 * ```
 *
 * @throws {Error} If the HTML is malformed or cannot be parsed
 */
export async function htmlToDocument(
  options: HtmlToDocumentOptions
): Promise<HtmlToDocumentResult> {
  const startTime = Date.now();
  const warnings: ConversionWarning[] = [];
  const stats: ConversionStats = {
    paragraphCount: 0,
    imageCount: 0,
    tableCount: 0,
    listCount: 0,
    hyperlinkCount: 0,
    processingTimeMs: 0,
  };

  // Create the Document with properties
  const document = Document.create({
    properties: options.properties,
  });

  // Configure section (page size, margins)
  const section = document.getSection();
  const pageSize = resolvePageSize(options.pageSize, options.orientation);
  section.setPageSize(pageSize.width, pageSize.height, pageSize.orientation);

  // Apply margins
  const margins: Margins = {
    ...DEFAULT_MARGINS,
    ...options.margins,
  };
  section.setMargins(margins);

  // Handle empty HTML
  if (!options.html || options.html.trim() === '') {
    // Create an empty paragraph to ensure valid document
    document.createParagraph();
    stats.paragraphCount = 1;
    stats.processingTimeMs = Date.now() - startTime;

    return { document, warnings, stats };
  }

  // Parse HTML
  const parseResult = await parseHtml(options.html, {
    baseUrl: options.baseUrl,
    sanitize: true,
  });

  // Add any parsing warnings
  for (const warning of parseResult.warnings) {
    warnings.push({
      type: 'unknown',
      message: warning,
    });
  }

  // Build conversion context
  const context: ConversionContext = {
    document,
    styleMap: {},
  };

  // Apply default formatting
  if (options.defaultFontFamily || options.defaultFontSize) {
    context.inheritedFormatting = {};
    if (options.defaultFontFamily) {
      context.inheritedFormatting.font = options.defaultFontFamily;
    }
    if (options.defaultFontSize) {
      context.inheritedFormatting.size = options.defaultFontSize;
    }
  }

  // Process the DOM tree
  const body = parseResult.document.body;
  if (body) {
    await processNode(body, context, options, warnings, stats);
  }

  // Ensure at least one paragraph exists
  if (stats.paragraphCount === 0) {
    document.createParagraph();
    stats.paragraphCount = 1;
  }

  stats.processingTimeMs = Date.now() - startTime;

  return { document, warnings, stats };
}

/**
 * Process a DOM node and its children
 */
async function processNode(
  node: Node,
  context: ConversionContext,
  options: HtmlToDocumentOptions,
  warnings: ConversionWarning[],
  stats: ConversionStats
): Promise<void> {
  if (isTextNode(node)) {
    // Handle text node
    processTextNode(node as Text, context, options);
    return;
  }

  if (!isElementNode(node)) {
    // Skip non-element, non-text nodes
    return;
  }

  const element = node as unknown as Element;
  const tagName = getTagName(element as unknown as HTMLElement);

  // Get handler for this element type
  const handler = getHandler(element);

  if (handler) {
    const result = handler(element, context);

    // Track statistics
    switch (tagName) {
      case 'p':
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
      case 'blockquote':
        stats.paragraphCount++;
        break;
      case 'table':
        stats.tableCount++;
        break;
      case 'ul':
      case 'ol':
        stats.listCount++;
        break;
      case 'a':
        stats.hyperlinkCount++;
        break;
      case 'img':
        stats.imageCount++;
        break;
    }

    // Handle error
    if (result.error) {
      warnings.push({
        type: 'unknown',
        message: result.error,
        source: tagName,
      });
    }

    // Process children if handler indicates
    if (result.processChildren !== false) {
      const childContext: ConversionContext = {
        ...context,
        ...result.childContext,
      };

      const children = element.childNodes;
      if (children) {
        for (let i = 0; i < children.length; i++) {
          const child = children.item(i);
          if (child) {
            await processNode(
              child as unknown as Node,
              childContext,
              options,
              warnings,
              stats
            );
          }
        }
      }
    }
  } else {
    // No handler - process children with current context
    const children = element.childNodes;
    if (children) {
      for (let i = 0; i < children.length; i++) {
        const child = children.item(i);
        if (child) {
          await processNode(
            child as unknown as Node,
            context,
            options,
            warnings,
            stats
          );
        }
      }
    }
  }
}

/**
 * Process a text node
 */
function processTextNode(
  node: Text,
  context: ConversionContext,
  options: HtmlToDocumentOptions
): void {
  const text = node.textContent ?? node.nodeValue ?? '';

  // Skip empty text nodes (unless preserving whitespace)
  if (!options.preserveWhitespace && text.trim() === '') {
    return;
  }

  // Get or create current paragraph
  let paragraph = context.currentParagraph;
  if (!paragraph) {
    // Create a new paragraph
    paragraph = context.document.createParagraph();
  }

  // Apply text with formatting
  const formatting = context.inheritedFormatting || {};
  paragraph.addText(text, formatting);
}

/**
 * Synchronous version of htmlToDocument for simple HTML without images.
 *
 * This version does not support images (which require async fetching).
 * Use htmlToDocument for full support.
 *
 * @param options - The conversion options (without image support)
 * @returns The conversion result with the Document
 */
export function htmlToDocumentSync(
  options: Omit<HtmlToDocumentOptions, 'baseUrl'>
): HtmlToDocumentResult {
  const startTime = Date.now();
  const warnings: ConversionWarning[] = [];
  const stats: ConversionStats = {
    paragraphCount: 0,
    imageCount: 0,
    tableCount: 0,
    listCount: 0,
    hyperlinkCount: 0,
    processingTimeMs: 0,
  };

  // Create the Document with properties
  const document = Document.create({
    properties: options.properties,
  });

  // Configure section (page size, margins)
  const section = document.getSection();
  const pageSize = resolvePageSize(options.pageSize, options.orientation);
  section.setPageSize(pageSize.width, pageSize.height, pageSize.orientation);

  // Apply margins
  const margins: Margins = {
    ...DEFAULT_MARGINS,
    ...options.margins,
  };
  section.setMargins(margins);

  // Handle empty HTML
  if (!options.html || options.html.trim() === '') {
    document.createParagraph();
    stats.paragraphCount = 1;
    stats.processingTimeMs = Date.now() - startTime;

    return { document, warnings, stats };
  }

  // Parse HTML synchronously
  const parsedDocument = parseHtmlSync(options.html);

  // Check for images and warn
  const hasImages = options.html.includes('<img');
  if (hasImages) {
    warnings.push({
      type: 'image-fetch-failed',
      message:
        'Images are not supported in synchronous conversion. Use htmlToDocument for image support.',
    });
  }

  // Build conversion context
  const context: ConversionContext = {
    document,
    styleMap: {},
  };

  // Apply default formatting
  if (options.defaultFontFamily || options.defaultFontSize) {
    context.inheritedFormatting = {};
    if (options.defaultFontFamily) {
      context.inheritedFormatting.font = options.defaultFontFamily;
    }
    if (options.defaultFontSize) {
      context.inheritedFormatting.size = options.defaultFontSize;
    }
  }

  // Process the DOM tree synchronously
  const body = parsedDocument.body;
  if (body) {
    processNodeSync(body as unknown as Node, context, options, warnings, stats);
  }

  // Ensure at least one paragraph exists
  if (stats.paragraphCount === 0) {
    document.createParagraph();
    stats.paragraphCount = 1;
  }

  stats.processingTimeMs = Date.now() - startTime;

  return { document, warnings, stats };
}

/**
 * Process a DOM node synchronously
 */
function processNodeSync(
  node: Node,
  context: ConversionContext,
  options: Omit<HtmlToDocumentOptions, 'baseUrl'>,
  warnings: ConversionWarning[],
  stats: ConversionStats
): void {
  if (isTextNode(node)) {
    processTextNode(node as Text, context, options);
    return;
  }

  if (!isElementNode(node)) {
    return;
  }

  const element = node as unknown as Element;
  const tagName = getTagName(element as unknown as HTMLElement);

  // Skip images in sync mode
  if (tagName === 'img') {
    return;
  }

  const handler = getHandler(element);

  if (handler) {
    const result = handler(element, context);

    // Track statistics
    switch (tagName) {
      case 'p':
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
      case 'blockquote':
        stats.paragraphCount++;
        break;
      case 'table':
        stats.tableCount++;
        break;
      case 'ul':
      case 'ol':
        stats.listCount++;
        break;
      case 'a':
        stats.hyperlinkCount++;
        break;
    }

    if (result.error) {
      warnings.push({
        type: 'unknown',
        message: result.error,
        source: tagName,
      });
    }

    if (result.processChildren !== false) {
      const childContext: ConversionContext = {
        ...context,
        ...result.childContext,
      };

      const children = element.childNodes;
      if (children) {
        for (let i = 0; i < children.length; i++) {
          const child = children.item(i);
          if (child) {
            processNodeSync(
              child as unknown as Node,
              childContext,
              options,
              warnings,
              stats
            );
          }
        }
      }
    }
  } else {
    const children = element.childNodes;
    if (children) {
      for (let i = 0; i < children.length; i++) {
        const child = children.item(i);
        if (child) {
          processNodeSync(
            child as unknown as Node,
            context,
            options,
            warnings,
            stats
          );
        }
      }
    }
  }
}

/**
 * Validates HTML before conversion and returns potential issues.
 *
 * @param html - The HTML string to validate
 * @returns An array of validation warnings
 */
export function validateHtmlForConversion(html: string): ConversionWarning[] {
  const warnings: ConversionWarning[] = [];

  if (!html || html.trim() === '') {
    return warnings;
  }

  // Check for script tags (not supported)
  if (/<script\b/i.test(html)) {
    warnings.push({
      type: 'unsupported-element',
      message: 'Script elements are not supported and will be removed',
      source: 'script',
    });
  }

  // Check for form elements
  if (/<(input|select|textarea|form)\b/i.test(html)) {
    warnings.push({
      type: 'unsupported-element',
      message: 'Form elements are not supported in DOCX export',
      source: 'form',
    });
  }

  // Check for iframes
  if (/<iframe\b/i.test(html)) {
    warnings.push({
      type: 'unsupported-element',
      message: 'Iframe elements are not supported in DOCX export',
      source: 'iframe',
    });
  }

  // Check for canvas
  if (/<canvas\b/i.test(html)) {
    warnings.push({
      type: 'unsupported-element',
      message: 'Canvas elements are not supported in DOCX export',
      source: 'canvas',
    });
  }

  // Check for video/audio
  if (/<(video|audio)\b/i.test(html)) {
    warnings.push({
      type: 'unsupported-element',
      message: 'Video and audio elements are not supported in DOCX export',
      source: 'media',
    });
  }

  // Check for SVG (limited support)
  if (/<svg\b/i.test(html)) {
    warnings.push({
      type: 'unsupported-element',
      message:
        'SVG elements have limited support - consider converting to images',
      source: 'svg',
    });
  }

  // Check for data URIs in images (may need special handling)
  if (/src\s*=\s*["']data:/i.test(html)) {
    warnings.push({
      type: 'unknown',
      message:
        'Data URIs in images are supported but may increase document size',
      source: 'img[data-uri]',
    });
  }

  return warnings;
}
