/**
 * Element Handlers - HTML element to DOCX conversion handlers
 *
 * This module provides handlers for converting HTML elements (from Plate's
 * serialization) to docXMLater DOCX elements (Paragraph, Run, etc.).
 *
 * NOTE: Autoformat transforms (e.g., smart quotes, em dashes, auto-lists) are
 * applied at the Plate editor level before HTML serialization. No special
 * handler is needed here - the autoformat plugin processes content inline
 * during editing, and the resulting HTML already contains the transformed text.
 * For example, "--" becomes an em dash before this export stage runs.
 *
 * @module element-handlers
 */

import type {
  Document,
  ParagraphAlignment,
  RunFormatting,
  Table,
  TableRow,
  TableCell,
  Hyperlink,
  Image,
  NumberingManager,
} from '../docXMLater/src';

// Import Paragraph and Run classes for actual instantiation
import { Paragraph } from '../docXMLater/src/elements/Paragraph';
import { Run } from '../docXMLater/src/elements/Run';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Handler function signature for element conversion
 */
export type ElementHandler = (
  element: Element,
  context: ConversionContext
) => ConversionResult;

/**
 * Context passed to element handlers during conversion
 */
export interface ConversionContext {
  /** The docXMLater Document being built */
  document: Document;
  /** Current paragraph being built (if any) */
  currentParagraph?: Paragraph;
  /** Current run being built (if any) */
  currentRun?: Run;
  /** List context for ordered/unordered lists */
  listContext?: ListContext;
  /** Table context for nested tables */
  tableContext?: TableContext;
  /** Style mappings from HTML classes to DOCX styles */
  styleMap?: Record<string, string>;
  /** Image handler for processing embedded images */
  imageHandler?: ImageHandler;
  /** Numbering manager for list handling */
  numberingManager?: NumberingManager;
  /** Current formatting state (inherited from parent elements) */
  inheritedFormatting?: RunFormatting;
}

/**
 * Result returned from element handlers
 */
export interface ConversionResult {
  /** The created DOCX element(s) */
  element?:
    | Paragraph
    | Run
    | Table
    | TableRow
    | TableCell
    | Hyperlink
    | Image
    | null;
  /** Multiple elements if handler creates more than one */
  elements?: Array<Paragraph | Run | Table | TableRow | TableCell>;
  /** Whether processing should continue to children */
  processChildren?: boolean;
  /** Updated context for children processing */
  childContext?: Partial<ConversionContext>;
  /** Error message if conversion failed */
  error?: string;
}

/**
 * List context for tracking list state during conversion
 */
export interface ListContext {
  /** Type of current list */
  type: 'ordered' | 'unordered';
  /** Current nesting level (0-based) */
  level: number;
  /** Numbering instance ID for DOCX */
  numId?: number;
  /** Abstract numbering ID */
  abstractNumId?: number;
  /** Item counters per level (for ordered lists) */
  counters: number[];
}

/**
 * Table context for tracking table state
 */
export interface TableContext {
  /** Current table being built */
  table: Table;
  /** Current row being built */
  currentRow?: TableRow;
  /** Current cell being built */
  currentCell?: TableCell;
  /** Column widths in twips */
  columnWidths?: number[];
}

/**
 * Handler for processing images
 */
export type ImageHandler = (
  src: string,
  alt?: string,
  width?: number,
  height?: number
) => Promise<Image | null>;

// ============================================================================
// Block Element Handlers
// ============================================================================

/**
 * Handles paragraph elements (<p>)
 *
 * Creates a new Paragraph with appropriate formatting based on
 * element attributes and CSS classes.
 *
 * @param element - The <p> element
 * @param context - Conversion context
 * @returns Conversion result with Paragraph
 */
export function handleParagraph(
  element: Element,
  context: ConversionContext
): ConversionResult {
  // Create Paragraph using docXMLater
  const paragraph = new Paragraph();

  // Apply formatting from element attributes
  // Check for alignment from style or data attributes
  const style = (element as HTMLElement).style;
  if (style?.textAlign) {
    const alignMap: Record<string, ParagraphAlignment> = {
      left: 'left',
      center: 'center',
      right: 'right',
      justify: 'both',
    };
    const alignment = alignMap[style.textAlign];
    if (alignment) {
      paragraph.setAlignment(alignment);
    }
  }

  // Check for style class mappings
  const className = element.className;
  if (context.styleMap && className && context.styleMap[className]) {
    paragraph.setStyle(context.styleMap[className]);
  }

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: true,
    childContext: {
      currentParagraph:
        paragraph as unknown as ConversionContext['currentParagraph'],
    },
  };
}

/**
 * Handles heading elements (<h1> - <h6>)
 *
 * Creates a Paragraph with the appropriate Heading style.
 * Maps h1-h6 to Heading1-Heading6 styles.
 *
 * @param element - The heading element
 * @param context - Conversion context
 * @returns Conversion result with styled Paragraph
 */
export function handleHeading(
  element: Element,
  context: ConversionContext
): ConversionResult {
  // Extract heading level from tag name
  const tagName = element.tagName.toLowerCase();
  const level = Number.parseInt(tagName.charAt(1), 10);

  // Create Paragraph with Heading style
  const paragraph = new Paragraph();
  paragraph.setStyle(`Heading${level}`);

  // Apply any additional formatting from element attributes
  const style = (element as HTMLElement).style;
  if (style?.textAlign) {
    const alignMap: Record<string, ParagraphAlignment> = {
      left: 'left',
      center: 'center',
      right: 'right',
      justify: 'both',
    };
    const alignment = alignMap[style.textAlign];
    if (alignment) {
      paragraph.setAlignment(alignment);
    }
  }

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: true,
    childContext: {
      currentParagraph:
        paragraph as unknown as ConversionContext['currentParagraph'],
    },
  };
}

/**
 * Handles blockquote elements (<blockquote>)
 *
 * Creates an indented paragraph with quote styling.
 *
 * @param element - The <blockquote> element
 * @param context - Conversion context
 * @returns Conversion result with indented Paragraph
 */
export function handleBlockquote(
  element: Element,
  context: ConversionContext
): ConversionResult {
  // Create Paragraph with indentation
  const paragraph = new Paragraph();

  // Set left indentation (720 twips = 0.5 inch)
  paragraph.setLeftIndent(720);

  // Apply a Quote style if available
  paragraph.setStyle('Quote');

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: true,
    childContext: {
      currentParagraph:
        paragraph as unknown as ConversionContext['currentParagraph'],
    },
  };
}

/**
 * Handles horizontal rule elements (<hr>)
 *
 * Creates a paragraph with a bottom border to simulate a horizontal line.
 *
 * @param element - The <hr> element
 * @param context - Conversion context
 * @returns Conversion result with bordered Paragraph
 */
export function handleHorizontalRule(
  element: Element,
  context: ConversionContext
): ConversionResult {
  // Create Paragraph with bottom border
  const paragraph = new Paragraph();

  // Add bottom border to simulate HR
  paragraph.setBorder({
    bottom: {
      style: 'single',
      size: 6, // 6 eighths of a point = 0.75pt
      color: '000000',
    },
  });

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: false, // HR has no children
  };
}

/**
 * Handles preformatted text elements (<pre>)
 *
 * Creates a paragraph with monospace font and preserved whitespace.
 *
 * @param element - The <pre> element
 * @param context - Conversion context
 * @returns Conversion result
 */
export function handlePreformatted(
  element: Element,
  context: ConversionContext
): ConversionResult {
  // TODO: Create Paragraph with monospace font
  // const paragraph = new Paragraph();
  //
  // Apply monospace font formatting
  // Child runs should use Courier New or similar

  return {
    element: null,
    processChildren: true,
    childContext: {
      inheritedFormatting: {
        font: 'Courier New',
        // Preserve whitespace handling will be done during text processing
      },
    },
  };
}

/**
 * Handles code block elements (<code> inside <pre>)
 *
 * @param element - The <code> element
 * @param context - Conversion context
 * @returns Conversion result
 */
export function handleCodeBlock(
  element: Element,
  context: ConversionContext
): ConversionResult {
  // TODO: Apply code formatting (monospace, possibly with background shading)
  // const formatting: RunFormatting = {
  //   fontFamily: 'Courier New',
  //   shading: { fill: 'F5F5F5' }
  // };

  return {
    element: null,
    processChildren: true,
    childContext: {
      inheritedFormatting: {
        ...(context.inheritedFormatting || {}),
        font: 'Courier New',
      } as RunFormatting,
    },
  };
}

// ============================================================================
// List Element Handlers
// ============================================================================

/**
 * Handles unordered list elements (<ul>)
 *
 * Sets up list context for bullet list processing.
 *
 * @param element - The <ul> element
 * @param context - Conversion context
 * @returns Conversion result with list context
 */
export function handleUnorderedList(
  element: Element,
  context: ConversionContext
): ConversionResult {
  // Determine nesting level
  const currentLevel = context.listContext?.level ?? -1;
  const newLevel = currentLevel + 1;

  // TODO: Get or create numbering instance for bullet list
  // const numId = context.numberingManager?.getOrCreateBulletList();

  const newListContext: ListContext = {
    type: 'unordered',
    level: newLevel,
    // numId,
    counters: context.listContext?.counters ?? [],
  };

  return {
    element: null,
    processChildren: true,
    childContext: {
      listContext: newListContext,
    },
  };
}

/**
 * Handles ordered list elements (<ol>)
 *
 * Sets up list context for numbered list processing.
 *
 * @param element - The <ol> element
 * @param context - Conversion context
 * @returns Conversion result with list context
 */
export function handleOrderedList(
  element: Element,
  context: ConversionContext
): ConversionResult {
  // Determine nesting level
  const currentLevel = context.listContext?.level ?? -1;
  const newLevel = currentLevel + 1;

  // Initialize counter for this level
  const counters = [...(context.listContext?.counters ?? [])];
  counters[newLevel] = 0;

  // Check for start attribute
  const startAttr = element.getAttribute('start');
  if (startAttr) {
    counters[newLevel] = Number.parseInt(startAttr, 10) - 1;
  }

  // TODO: Get or create numbering instance for numbered list
  // const numId = context.numberingManager?.getOrCreateNumberedList();

  const newListContext: ListContext = {
    type: 'ordered',
    level: newLevel,
    // numId,
    counters,
  };

  return {
    element: null,
    processChildren: true,
    childContext: {
      listContext: newListContext,
    },
  };
}

/**
 * Handles list item elements (<li>)
 *
 * Creates a paragraph with list numbering properties.
 *
 * @param element - The <li> element
 * @param context - Conversion context
 * @returns Conversion result with list item Paragraph
 */
export function handleListItem(
  element: Element,
  context: ConversionContext
): ConversionResult {
  if (!context.listContext) {
    // Not inside a list, treat as regular paragraph
    return handleParagraph(element, context);
  }

  const { type, level, numId, counters } = context.listContext;

  // Increment counter for ordered lists
  if (type === 'ordered' && counters) {
    counters[level] = (counters[level] ?? 0) + 1;
  }

  // Create Paragraph with numbering properties
  const paragraph = new Paragraph();
  if (numId !== undefined) {
    paragraph.setNumbering(numId, level);
  }

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: true,
    childContext: {
      currentParagraph:
        paragraph as unknown as ConversionContext['currentParagraph'],
    },
  };
}

// ============================================================================
// Table Element Handlers
// ============================================================================

/**
 * Handles table elements (<table>)
 *
 * Creates a new Table and sets up table context.
 *
 * @param element - The <table> element
 * @param context - Conversion context
 * @returns Conversion result with Table
 */
export function handleTable(
  element: Element,
  context: ConversionContext
): ConversionResult {
  // TODO: Create Table using docXMLater
  // const table = new Table();
  //
  // Apply table formatting from attributes/styles
  // - width from style or width attribute
  // - borders from style
  // - alignment

  return {
    element: null, // TODO: Return created table
    processChildren: true,
    childContext: {
      tableContext: {
        table: null as any, // TODO: Set actual table
        columnWidths: [],
      },
    },
  };
}

/**
 * Handles table row elements (<tr>)
 *
 * Creates a new TableRow within current table context.
 *
 * @param element - The <tr> element
 * @param context - Conversion context
 * @returns Conversion result with TableRow
 */
export function handleTableRow(
  element: Element,
  context: ConversionContext
): ConversionResult {
  if (!context.tableContext?.table) {
    return {
      error: 'TableRow outside of Table context',
      processChildren: false,
    };
  }

  // TODO: Create TableRow
  // const row = new TableRow();
  // context.tableContext.table.addRow(row);

  return {
    element: null, // TODO: Return created row
    processChildren: true,
    childContext: {
      tableContext: {
        ...context.tableContext,
        // currentRow: row,
      },
    },
  };
}

/**
 * Handles table cell elements (<td> and <th>)
 *
 * Creates a new TableCell within current row context.
 *
 * @param element - The <td> or <th> element
 * @param context - Conversion context
 * @returns Conversion result with TableCell
 */
export function handleTableCell(
  element: Element,
  context: ConversionContext
): ConversionResult {
  if (!context.tableContext?.currentRow) {
    return {
      error: 'TableCell outside of TableRow context',
      processChildren: false,
    };
  }

  const isHeader = element.tagName.toLowerCase() === 'th';

  // TODO: Create TableCell
  // const cell = new TableCell();
  //
  // Handle colspan/rowspan
  // const colspan = element.getAttribute('colspan');
  // const rowspan = element.getAttribute('rowspan');
  // if (colspan) cell.setGridSpan(parseInt(colspan, 10));
  // if (rowspan) cell.setRowSpan(parseInt(rowspan, 10));
  //
  // Apply header styling if <th>
  // if (isHeader) cell.setShading({ fill: 'F0F0F0' });

  return {
    element: null, // TODO: Return created cell
    processChildren: true,
    childContext: {
      tableContext: {
        ...context.tableContext,
        // currentCell: cell,
      },
    },
  };
}

// ============================================================================
// Inline Element Handlers
// ============================================================================

/**
 * Handles anchor/link elements (<a>)
 *
 * Creates a Hyperlink element.
 *
 * @param element - The <a> element
 * @param context - Conversion context
 * @returns Conversion result with Hyperlink
 */
export function handleAnchor(
  element: Element,
  context: ConversionContext
): ConversionResult {
  const href = element.getAttribute('href') || '';
  const isBookmark = href.startsWith('#');

  // TODO: Create Hyperlink
  // const hyperlink = new Hyperlink();
  //
  // if (isBookmark) {
  //   hyperlink.setAnchor(href.substring(1));
  // } else {
  //   hyperlink.setUrl(href);
  // }

  return {
    element: null, // TODO: Return created hyperlink
    processChildren: true,
  };
}

/**
 * Handles image elements (<img>)
 *
 * Creates an Image element using the image handler.
 *
 * @param element - The <img> element
 * @param context - Conversion context
 * @returns Conversion result with Image
 */
export async function handleImage(
  element: Element,
  context: ConversionContext
): Promise<ConversionResult> {
  const src = element.getAttribute('src') || '';
  const alt = element.getAttribute('alt') || '';
  const width = element.getAttribute('width');
  const height = element.getAttribute('height');

  if (!context.imageHandler) {
    return {
      error: 'No image handler provided',
      processChildren: false,
    };
  }

  // TODO: Use image handler to create Image
  // const image = await context.imageHandler(
  //   src,
  //   alt,
  //   width ? parseInt(width, 10) : undefined,
  //   height ? parseInt(height, 10) : undefined
  // );

  return {
    element: null, // TODO: Return created image
    processChildren: false,
  };
}

/**
 * Handles line break elements (<br>)
 *
 * Creates a Run with a line break.
 *
 * @param element - The <br> element
 * @param context - Conversion context
 * @returns Conversion result
 */
export function handleLineBreak(
  element: Element,
  context: ConversionContext
): ConversionResult {
  // Create Run with break (Run requires text parameter, use empty string for break-only runs)
  const run = new Run('');
  run.addBreak('textWrapping');

  return {
    element: run as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

// ============================================================================
// Text Formatting Handlers
// ============================================================================

/**
 * Handles bold elements (<b>, <strong>)
 */
export function handleBold(
  element: Element,
  context: ConversionContext
): ConversionResult {
  return {
    element: null,
    processChildren: true,
    childContext: {
      inheritedFormatting: {
        ...(context.inheritedFormatting || {}),
        bold: true,
      } as RunFormatting,
    },
  };
}

/**
 * Handles italic elements (<i>, <em>)
 */
export function handleItalic(
  element: Element,
  context: ConversionContext
): ConversionResult {
  return {
    element: null,
    processChildren: true,
    childContext: {
      inheritedFormatting: {
        ...(context.inheritedFormatting || {}),
        italic: true,
      } as RunFormatting,
    },
  };
}

/**
 * Handles underline elements (<u>)
 */
export function handleUnderline(
  element: Element,
  context: ConversionContext
): ConversionResult {
  return {
    element: null,
    processChildren: true,
    childContext: {
      inheritedFormatting: {
        ...(context.inheritedFormatting || {}),
        underline: 'single',
      } as RunFormatting,
    },
  };
}

/**
 * Handles strikethrough elements (<s>, <strike>, <del>)
 */
export function handleStrikethrough(
  element: Element,
  context: ConversionContext
): ConversionResult {
  return {
    element: null,
    processChildren: true,
    childContext: {
      inheritedFormatting: {
        ...(context.inheritedFormatting || {}),
        strike: true,
      } as RunFormatting,
    },
  };
}

/**
 * Handles subscript elements (<sub>)
 */
export function handleSubscript(
  element: Element,
  context: ConversionContext
): ConversionResult {
  return {
    element: null,
    processChildren: true,
    childContext: {
      inheritedFormatting: {
        ...(context.inheritedFormatting || {}),
        subscript: true,
      } as RunFormatting,
    },
  };
}

/**
 * Handles superscript elements (<sup>)
 */
export function handleSuperscript(
  element: Element,
  context: ConversionContext
): ConversionResult {
  return {
    element: null,
    processChildren: true,
    childContext: {
      inheritedFormatting: {
        ...(context.inheritedFormatting || {}),
        superscript: true,
      } as RunFormatting,
    },
  };
}

/**
 * Handles inline code elements (<code> not inside <pre>)
 */
export function handleInlineCode(
  element: Element,
  context: ConversionContext
): ConversionResult {
  return {
    element: null,
    processChildren: true,
    childContext: {
      inheritedFormatting: {
        ...(context.inheritedFormatting || {}),
        font: 'Courier New',
        // Optionally add background shading
        // shading: { fill: 'F5F5F5' }
      } as RunFormatting,
    },
  };
}

/**
 * Handles mark/highlight elements (<mark>)
 *
 * Creates a highlight formatting similar to browser's yellow highlight
 */
export function handleMark(
  element: Element,
  context: ConversionContext
): ConversionResult {
  return {
    element: null,
    processChildren: true,
    childContext: {
      inheritedFormatting: {
        ...(context.inheritedFormatting || {}),
        highlight: 'yellow',
      } as RunFormatting,
    },
  };
}

/**
 * Handles span elements (<span>)
 *
 * Processes inline styles and applies them to formatting context.
 */
export function handleSpan(
  element: Element,
  context: ConversionContext
): ConversionResult {
  // TODO: Parse inline styles from element.style
  // const formatting: RunFormatting = {};
  //
  // if (element.style.color) formatting.color = parseColor(element.style.color);
  // if (element.style.backgroundColor) formatting.shading = { fill: parseColor(element.style.backgroundColor) };
  // if (element.style.fontSize) formatting.size = parseFontSize(element.style.fontSize);
  // if (element.style.fontFamily) formatting.fontFamily = element.style.fontFamily;

  return {
    element: null,
    processChildren: true,
    childContext: {
      inheritedFormatting: {
        ...(context.inheritedFormatting || {}),
        // ...formatting
      } as RunFormatting,
    },
  };
}

// ============================================================================
// Indentation Handlers
// ============================================================================

/** Twips per pixel at standard 96 DPI */
const TWIPS_PER_PIXEL = 15;

/** Twips per point */
const TWIPS_PER_POINT = 20;

/** Twips per em (assuming 12pt base font) */
const TWIPS_PER_EM = 240;

/**
 * Parses a CSS margin/padding value to twips
 *
 * @param value - CSS value (e.g., '20px', '1.5em', '24pt')
 * @returns Value in twips or 0 if invalid
 */
export function parseCssIndentToTwips(value: string | null): number {
  if (!value) return 0;

  const numValue = Number.parseFloat(value);
  if (isNaN(numValue)) return 0;

  const lowerValue = value.toLowerCase().trim();

  if (lowerValue.endsWith('px')) {
    return Math.round(numValue * TWIPS_PER_PIXEL);
  }
  if (lowerValue.endsWith('pt')) {
    return Math.round(numValue * TWIPS_PER_POINT);
  }
  if (lowerValue.endsWith('em') || lowerValue.endsWith('rem')) {
    return Math.round(numValue * TWIPS_PER_EM);
  }
  if (lowerValue.endsWith('in')) {
    return Math.round(numValue * 1440); // 1440 twips per inch
  }
  if (lowerValue.endsWith('cm')) {
    return Math.round(numValue * 567); // ~567 twips per cm
  }
  if (lowerValue.endsWith('mm')) {
    return Math.round(numValue * 56.7); // ~56.7 twips per mm
  }
  // Assume pixels if no unit
  return Math.round(numValue * TWIPS_PER_PIXEL);
}

/**
 * Handles indentation from element styles
 *
 * Converts margin-left and padding-left CSS values to DOCX w:ind.
 *
 * @param element - The element with indentation styles
 * @param context - Conversion context
 * @returns Conversion result with indentation applied
 */
export function handleIndentation(
  element: Element,
  context: ConversionContext
): ConversionResult {
  const style = (element as HTMLElement).style;

  let leftIndent = 0;
  let rightIndent = 0;
  let firstLineIndent = 0;

  // Parse margin-left
  if (style?.marginLeft) {
    leftIndent += parseCssIndentToTwips(style.marginLeft);
  }

  // Parse padding-left (adds to margin)
  if (style?.paddingLeft) {
    leftIndent += parseCssIndentToTwips(style.paddingLeft);
  }

  // Parse margin-right
  if (style?.marginRight) {
    rightIndent += parseCssIndentToTwips(style.marginRight);
  }

  // Parse padding-right
  if (style?.paddingRight) {
    rightIndent += parseCssIndentToTwips(style.paddingRight);
  }

  // Parse text-indent (first line indent)
  if (style?.textIndent) {
    firstLineIndent = parseCssIndentToTwips(style.textIndent);
  }

  // Check for data attributes (Plate-style)
  const dataIndent = element.getAttribute('data-indent');
  if (dataIndent) {
    const indentLevel = Number.parseInt(dataIndent, 10);
    if (!isNaN(indentLevel)) {
      // Each indent level is 720 twips (0.5 inch)
      leftIndent = indentLevel * 720;
    }
  }

  // If no indentation, just process children
  if (leftIndent === 0 && rightIndent === 0 && firstLineIndent === 0) {
    return {
      element: null,
      processChildren: true,
    };
  }

  // Create paragraph with indentation
  const paragraph = new Paragraph();

  if (leftIndent > 0) {
    paragraph.setLeftIndent(leftIndent);
  }

  if (rightIndent > 0) {
    paragraph.setRightIndent(rightIndent);
  }

  if (firstLineIndent !== 0) {
    paragraph.setFirstLineIndent(firstLineIndent);
  }

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: true,
    childContext: {
      currentParagraph:
        paragraph as unknown as ConversionContext['currentParagraph'],
    },
  };
}

/**
 * Handles div elements with potential indentation
 *
 * Checks for margin-left/padding-left and applies indentation.
 *
 * @param element - The <div> element
 * @param context - Conversion context
 * @returns Conversion result
 */
export function handleDiv(
  element: Element,
  context: ConversionContext
): ConversionResult {
  const style = (element as HTMLElement).style;

  // Check if this div has indentation
  if (
    style?.marginLeft ||
    style?.paddingLeft ||
    element.hasAttribute('data-indent')
  ) {
    return handleIndentation(element, context);
  }

  // Otherwise, just process children
  return {
    element: null,
    processChildren: true,
  };
}

// ============================================================================
// Handler Registry
// ============================================================================

/**
 * Registry of element handlers mapped by HTML tag name
 *
 * Usage:
 * ```typescript
 * const handler = elementHandlers[element.tagName.toLowerCase()];
 * if (handler) {
 *   const result = handler(element, context);
 * }
 * ```
 */
export const elementHandlers: Record<string, ElementHandler> = {
  // Block elements
  p: handleParagraph,
  h1: handleHeading,
  h2: handleHeading,
  h3: handleHeading,
  h4: handleHeading,
  h5: handleHeading,
  h6: handleHeading,
  blockquote: handleBlockquote,
  hr: handleHorizontalRule,
  pre: handlePreformatted,
  div: handleDiv,

  // List elements
  ul: handleUnorderedList,
  ol: handleOrderedList,
  li: handleListItem,

  // Table elements
  table: handleTable,
  tr: handleTableRow,
  td: handleTableCell,
  th: handleTableCell,

  // Inline elements
  a: handleAnchor,
  br: handleLineBreak,

  // Text formatting
  b: handleBold,
  strong: handleBold,
  i: handleItalic,
  em: handleItalic,
  u: handleUnderline,
  s: handleStrikethrough,
  strike: handleStrikethrough,
  del: handleStrikethrough,
  sub: handleSubscript,
  sup: handleSuperscript,
  code: handleInlineCode,
  mark: handleMark,
  span: handleSpan,
};

/**
 * Gets the appropriate handler for an element
 *
 * @param element - The HTML element to get handler for
 * @returns The handler function or undefined if no handler exists
 */
export function getHandler(element: Element): ElementHandler | undefined {
  return elementHandlers[element.tagName.toLowerCase()];
}

/**
 * Registers a custom element handler
 *
 * @param tagName - HTML tag name (case-insensitive)
 * @param handler - Handler function
 */
export function registerHandler(
  tagName: string,
  handler: ElementHandler
): void {
  elementHandlers[tagName.toLowerCase()] = handler;
}

/**
 * Processes an element through the handler system
 *
 * @param element - Element to process
 * @param context - Conversion context
 * @returns Conversion result
 */
export function processElement(
  element: Element,
  context: ConversionContext
): ConversionResult {
  const handler = getHandler(element);

  if (!handler) {
    // No handler for this element, process children with current context
    return {
      element: null,
      processChildren: true,
    };
  }

  return handler(element, context);
}
