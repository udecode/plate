/**
 * PropertyChangeTypes - Type definitions for property change tracking in revisions
 *
 * These types represent the parsed data from OOXML property change elements:
 * - w:rPrChange (run property changes)
 * - w:pPrChange (paragraph property changes)
 * - w:tblPrChange, w:trPrChange, w:tcPrChange (table property changes)
 * - w:sectPrChange (section property changes)
 * - w:numberingChange (numbering property changes)
 *
 * Per ECMA-376, property change elements track the PREVIOUS state of properties
 * before a change was made, allowing Word to show what changed and enabling
 * accept/reject functionality.
 *
 * @module PropertyChangeTypes
 */

import type { RunFormatting } from './Run';

/**
 * Common base for all property change types
 */
export interface PropertyChangeBase {
  /** Unique revision ID (ST_DecimalNumber) */
  id: number;
  /** Author who made the change (required) */
  author: string;
  /** Date when the change was made (ISO 8601) */
  date: Date;
}

/**
 * Run property change (w:rPrChange)
 *
 * Tracks changes to run-level formatting such as:
 * - Bold, italic, underline
 * - Font name, size, color
 * - Highlight, strikethrough
 * - Character spacing, subscript/superscript
 *
 * @example
 * ```xml
 * <w:rPrChange w:id="1" w:author="John" w:date="2024-01-15T10:30:00Z">
 *   <w:rPr>
 *     <w:b/>  <!-- Was bold before change -->
 *   </w:rPr>
 * </w:rPrChange>
 * ```
 */
export interface RunPropertyChange extends PropertyChangeBase {
  /** Previous run formatting properties before the change */
  previousProperties: Partial<RunFormatting>;
}

/**
 * Border definition for paragraph borders
 * Per ECMA-376 Part 1 Section 17.3.1.24
 */
export interface ParagraphBorderDef {
  /** Border style (single, double, dotted, dashed, etc.) */
  val?: string;
  /** Border width in eighths of a point */
  sz?: number;
  /** Space between border and content in points */
  space?: number;
  /** Border color (hex RGB without #) */
  color?: string;
  /** Theme color reference */
  themeColor?: string;
}

/**
 * Paragraph borders (w:pBdr)
 * Per ECMA-376 Part 1 Section 17.3.1.24
 */
export interface ParagraphBorders {
  /** Top border */
  top?: ParagraphBorderDef;
  /** Bottom border */
  bottom?: ParagraphBorderDef;
  /** Left border */
  left?: ParagraphBorderDef;
  /** Right border */
  right?: ParagraphBorderDef;
  /** Border between paragraphs with same borders */
  between?: ParagraphBorderDef;
  /** Bar border (vertical line) */
  bar?: ParagraphBorderDef;
}

/**
 * Paragraph shading (w:shd)
 * Per ECMA-376 Part 1 Section 17.3.1.32
 */
export interface ParagraphShading {
  /** Fill color (hex RGB without #) */
  fill?: string;
  /** Pattern color (hex RGB without #) */
  color?: string;
  /** Shading pattern value (clear, solid, pct10, etc.) */
  val?: string;
  /** Theme fill color reference */
  themeFill?: string;
  /** Theme color reference */
  themeColor?: string;
}

/**
 * Tab stop definition
 * Per ECMA-376 Part 1 Section 17.3.1.38
 */
export interface TabStopDef {
  /** Tab stop type (left, right, center, decimal, bar, clear) */
  val?: string;
  /** Tab position in twips */
  pos?: number;
  /** Leader character (none, dot, hyphen, underscore, middleDot) */
  leader?: string;
}

/**
 * Paragraph formatting options (subset for type safety)
 * Full ParagraphFormatting is in Paragraph.ts but we need a partial here
 *
 * Per ECMA-376 Part 1 Section 17.3.1, this covers all paragraph properties
 * that can be tracked in w:pPrChange revision elements.
 */
export interface ParagraphFormattingPartial {
  /** Text alignment: left, center, right, justify */
  alignment?: 'left' | 'center' | 'right' | 'justify';
  /** Left indentation in twips */
  leftIndent?: number;
  /** Right indentation in twips */
  rightIndent?: number;
  /** First line indentation in twips */
  firstLineIndent?: number;
  /** Hanging indentation in twips */
  hangingIndent?: number;
  /** Spacing before paragraph in twips */
  spaceBefore?: number;
  /** Spacing after paragraph in twips */
  spaceAfter?: number;
  /** Line spacing in twips */
  lineSpacing?: number;
  /** Line spacing rule */
  lineSpacingRule?: 'auto' | 'exact' | 'atLeast';
  /** Paragraph style ID */
  style?: string;
  /** Keep with next paragraph */
  keepNext?: boolean;
  /** Keep lines together */
  keepLines?: boolean;
  /** Page break before */
  pageBreakBefore?: boolean;
  /** Widow/orphan control */
  widowControl?: boolean;
  /** Suppress auto-hyphenation */
  suppressAutoHyphens?: boolean;
  /** Contextual spacing */
  contextualSpacing?: boolean;
  /** Mirror indents */
  mirrorIndents?: boolean;
  /** Outline level (for headings) */
  outlineLevel?: number;
  /** Right-to-left paragraph */
  bidi?: boolean;
  /** Numbering properties (list formatting) */
  numbering?: {
    numId?: number;
    level?: number;
  };

  // === Extended properties for full ECMA-376 compliance ===

  /**
   * Paragraph borders (w:pBdr)
   * Per ECMA-376 Part 1 Section 17.3.1.24
   */
  borders?: ParagraphBorders;

  /**
   * Paragraph shading/background (w:shd)
   * Per ECMA-376 Part 1 Section 17.3.1.32
   */
  shading?: ParagraphShading;

  /**
   * Custom tab stops (w:tabs)
   * Per ECMA-376 Part 1 Section 17.3.1.38
   */
  tabs?: TabStopDef[];

  /**
   * Text direction (w:textDirection)
   * Per ECMA-376 Part 1 Section 17.3.1.40
   * Values: lrTb, tbRl, btLr, lrTbV, tbRlV, tbLrV
   */
  textDirection?: string;

  /**
   * Suppress line numbers (w:suppressLineNumbers)
   * Per ECMA-376 Part 1 Section 17.3.1.35
   */
  suppressLineNumbers?: boolean;

  /**
   * Adjust right indent (w:adjustRightInd)
   * Per ECMA-376 Part 1 Section 17.3.1.1
   */
  adjustRightInd?: boolean;

  /**
   * Snap to grid (w:snapToGrid)
   * Per ECMA-376 Part 1 Section 17.3.1.33
   */
  snapToGrid?: boolean;

  /**
   * Word wrap (w:wordWrap)
   * Per ECMA-376 Part 1 Section 17.3.1.44
   */
  wordWrap?: boolean;

  /**
   * Auto space between East Asian and numeric (w:autoSpaceDE)
   */
  autoSpaceDE?: boolean;

  /**
   * Auto space between East Asian and Western (w:autoSpaceDN)
   */
  autoSpaceDN?: boolean;
}

/**
 * Paragraph property change (w:pPrChange)
 *
 * Tracks changes to paragraph-level formatting such as:
 * - Alignment (left, center, right, justify)
 * - Indentation (left, right, first line, hanging)
 * - Spacing (before, after, line)
 * - Keep with next, keep lines together
 * - Paragraph style
 * - Numbering/list formatting (numId, ilvl)
 *
 * @example
 * ```xml
 * <w:pPrChange w:id="2" w:author="Jane" w:date="2024-01-15T11:00:00Z">
 *   <w:pPr>
 *     <w:jc w:val="left"/>  <!-- Was left-aligned before change -->
 *   </w:pPr>
 * </w:pPrChange>
 * ```
 */
export interface ParagraphPropertyChange extends PropertyChangeBase {
  /** Previous paragraph formatting properties before the change */
  previousProperties: Partial<ParagraphFormattingPartial>;
}

/**
 * Table property change types
 */
export type TablePropertyChangeType = 'table' | 'row' | 'cell';

/**
 * Table property change (w:tblPrChange, w:trPrChange, w:tcPrChange)
 *
 * Tracks changes to table-level properties including:
 * - Table: width, alignment, borders, shading
 * - Row: height, header row, can't split
 * - Cell: width, vertical alignment, borders, shading, merge
 *
 * @example
 * ```xml
 * <w:tblPrChange w:id="3" w:author="John" w:date="2024-01-15T12:00:00Z">
 *   <w:tblPr>
 *     <w:tblW w:w="5000" w:type="pct"/>
 *   </w:tblPr>
 * </w:tblPrChange>
 * ```
 */
export interface TablePropertyChange extends PropertyChangeBase {
  /** Type of table element (table, row, or cell) */
  elementType: TablePropertyChangeType;
  /** Previous table properties before the change */
  previousProperties: Record<string, any>;
}

/**
 * Section property change (w:sectPrChange)
 *
 * Tracks changes to section-level properties such as:
 * - Page size (width, height)
 * - Page margins (top, bottom, left, right, header, footer, gutter)
 * - Page orientation (portrait, landscape)
 * - Columns configuration
 * - Page numbering
 *
 * @example
 * ```xml
 * <w:sectPrChange w:id="4" w:author="Jane" w:date="2024-01-15T13:00:00Z">
 *   <w:sectPr>
 *     <w:pgSz w:w="12240" w:h="15840"/>
 *     <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
 *   </w:sectPr>
 * </w:sectPrChange>
 * ```
 */
export interface SectionPropertyChange extends PropertyChangeBase {
  /** Previous section properties before the change */
  previousProperties: Record<string, any>;
}

/**
 * Numbering change (w:numberingChange)
 *
 * Tracks changes to list numbering properties:
 * - Numbering definition ID
 * - Indentation level
 * - Starting number
 *
 * @example
 * ```xml
 * <w:numberingChange w:id="5" w:author="John" w:date="2024-01-15T14:00:00Z"
 *                    w:original="1" />
 * ```
 */
export interface NumberingChange extends PropertyChangeBase {
  /** Previous numbering definition ID */
  previousNumId?: number;
  /** Previous indentation level */
  previousIlvl?: number;
  /** Original numbering format string */
  original?: string;
}

/**
 * Location of a revision within the document structure
 * Used for precise change tracking and changelog generation
 */
export interface RevisionLocation {
  /** Paragraph index within the document body (0-based) */
  paragraphIndex?: number;
  /** Run index within the paragraph (0-based) */
  runIndex?: number;
  /** Table row index (0-based) - only for table revisions */
  tableRow?: number;
  /** Table cell index within row (0-based) - only for table revisions */
  tableCell?: number;
  /** Section index (0-based) - only for section revisions */
  sectionIndex?: number;
  /** Header/footer type if revision is in header/footer */
  headerFooterType?:
    | 'header'
    | 'footer'
    | 'firstHeader'
    | 'firstFooter'
    | 'evenHeader'
    | 'evenFooter';
}

/**
 * Union type for all property change types
 */
export type AnyPropertyChange =
  | RunPropertyChange
  | ParagraphPropertyChange
  | TablePropertyChange
  | SectionPropertyChange
  | NumberingChange;

/**
 * Type guard to check if a property change is a RunPropertyChange
 *
 * Note: Empty previousProperties cannot be reliably typed - this guard returns
 * false for empty objects. Use context-aware typing when the source is known.
 */
export function isRunPropertyChange(
  change: AnyPropertyChange
): change is RunPropertyChange {
  if (
    !('previousProperties' in change) ||
    'elementType' in change ||
    'previousNumId' in change
  ) {
    return false;
  }
  // Check for typical run properties - must have at least one identifiable property
  const props = change.previousProperties as Partial<RunFormatting>;
  return (
    props.bold !== undefined ||
    props.italic !== undefined ||
    props.font !== undefined ||
    props.size !== undefined ||
    props.color !== undefined ||
    props.underline !== undefined ||
    props.strike !== undefined ||
    props.highlight !== undefined ||
    props.smallCaps !== undefined ||
    props.allCaps !== undefined ||
    props.subscript !== undefined ||
    props.superscript !== undefined
  );
}

/**
 * Type guard to check if a property change is a ParagraphPropertyChange
 */
export function isParagraphPropertyChange(
  change: AnyPropertyChange
): change is ParagraphPropertyChange {
  return (
    'previousProperties' in change &&
    !('elementType' in change) &&
    !('previousNumId' in change) &&
    // Check for typical paragraph properties
    ((change.previousProperties as ParagraphFormattingPartial).alignment !==
      undefined ||
      (change.previousProperties as ParagraphFormattingPartial).leftIndent !==
        undefined ||
      (change.previousProperties as ParagraphFormattingPartial).spaceBefore !==
        undefined ||
      (change.previousProperties as ParagraphFormattingPartial).style !==
        undefined)
  );
}

/**
 * Type guard to check if a property change is a TablePropertyChange
 */
export function isTablePropertyChange(
  change: AnyPropertyChange
): change is TablePropertyChange {
  return 'elementType' in change;
}

/**
 * Type guard to check if a property change is a SectionPropertyChange
 *
 * Checks for section-specific properties: page size, margins, orientation, columns, etc.
 * Per ECMA-376, section properties are distinct from run/paragraph properties.
 */
export function isSectionPropertyChange(
  change: AnyPropertyChange
): change is SectionPropertyChange {
  if (
    !('previousProperties' in change) ||
    'elementType' in change ||
    'previousNumId' in change
  ) {
    return false;
  }
  // Check for section-specific properties
  const props = change.previousProperties as Record<string, any>;
  return (
    props.pageWidth !== undefined ||
    props.pageHeight !== undefined ||
    props.orientation !== undefined ||
    props.marginTop !== undefined ||
    props.marginBottom !== undefined ||
    props.marginLeft !== undefined ||
    props.marginRight !== undefined ||
    props.columns !== undefined ||
    props.headerDistance !== undefined ||
    props.footerDistance !== undefined ||
    props.gutterMargin !== undefined ||
    props.pageNumberStart !== undefined ||
    props.sectionType !== undefined
  );
}

/**
 * Type guard to check if a property change is a NumberingChange
 */
export function isNumberingChange(
  change: AnyPropertyChange
): change is NumberingChange {
  return (
    'previousNumId' in change ||
    'previousIlvl' in change ||
    'original' in change
  );
}
