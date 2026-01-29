/**
 * Section - Represents a document section with page setup properties
 *
 * Sections allow different page setups within a single document (margins, orientation, etc.)
 * Each section can have its own headers, footers, and page numbering.
 */

import { XMLBuilder, type XMLElement } from '../xml/XMLBuilder';
import { PAGE_SIZES } from '../utils/units';

/**
 * Page orientation
 */
export type PageOrientation = 'portrait' | 'landscape';

/**
 * Section break type
 */
export type SectionType =
  | 'nextPage'
  | 'continuous'
  | 'evenPage'
  | 'oddPage'
  | 'nextColumn';

/**
 * Page numbering format
 */
export type PageNumberFormat =
  | 'decimal'
  | 'lowerRoman'
  | 'upperRoman'
  | 'lowerLetter'
  | 'upperLetter';

/**
 * Page size properties
 */
export interface PageSize {
  /** Width in twips */
  width: number;
  /** Height in twips */
  height: number;
  /** Orientation */
  orientation?: PageOrientation;
}

/**
 * Margin properties
 */
export interface Margins {
  /** Top margin in twips */
  top: number;
  /** Bottom margin in twips */
  bottom: number;
  /** Left margin in twips */
  left: number;
  /** Right margin in twips */
  right: number;
  /** Header distance from top in twips */
  header?: number;
  /** Footer distance from bottom in twips */
  footer?: number;
  /** Gutter margin in twips */
  gutter?: number;
}

/**
 * Column properties
 */
export interface Columns {
  /** Number of columns */
  count: number;
  /** Space between columns in twips */
  space?: number;
  /** Equal column widths */
  equalWidth?: boolean;
  /** Show column separator line */
  separator?: boolean;
  /** Individual column widths (for unequal columns) in twips */
  columnWidths?: number[];
}

/**
 * Page numbering properties
 */
export interface PageNumbering {
  /** Starting page number */
  start?: number;
  /** Number format */
  format?: PageNumberFormat;
}

/**
 * Paper source (printer tray) properties
 */
export interface PaperSource {
  /** First page tray number */
  first?: number;
  /** Other pages tray number */
  other?: number;
}

/**
 * Vertical page alignment
 */
export type VerticalAlignment = 'top' | 'center' | 'bottom' | 'both';

/**
 * Text direction
 */
export type TextDirection = 'ltr' | 'rtl' | 'tbRl' | 'btLr';

/**
 * Document grid type for East Asian typography
 */
export type DocumentGridType =
  | 'default'
  | 'lines'
  | 'linesAndChars'
  | 'snapToChars';

/**
 * Document grid properties
 */
export interface DocumentGrid {
  /** Grid type */
  type?: DocumentGridType;
  /** Lines per page */
  linePitch?: number;
  /** Characters per line */
  charSpace?: number;
}

/**
 * Line numbering restart mode
 */
export type LineNumberingRestart = 'newPage' | 'newSection' | 'continuous';

/**
 * Line numbering properties
 * Per ECMA-376 Part 1, Section 17.6.8 (w:lnNumType element)
 */
export interface LineNumbering {
  /** Display line number every N lines (countBy attribute) */
  countBy?: number;
  /** Starting line number */
  start?: number;
  /** Distance from text margin in twips */
  distance?: number;
  /** When to restart line numbering */
  restart?: LineNumberingRestart;
}

/**
 * Section properties
 */
export interface SectionProperties {
  /** Page size */
  pageSize?: PageSize;
  /** Margins */
  margins?: Margins;
  /** Column layout */
  columns?: Columns;
  /** Section break type */
  type?: SectionType;
  /** Page numbering */
  pageNumbering?: PageNumbering;
  /** Header reference IDs */
  headers?: {
    default?: string; // rId for default header
    first?: string; // rId for first page header
    even?: string; // rId for even page header
  };
  /** Footer reference IDs */
  footers?: {
    default?: string; // rId for default footer
    first?: string; // rId for first page footer
    even?: string; // rId for even page footer
  };
  /** Title page (different first page) */
  titlePage?: boolean;
  /** Vertical page alignment */
  verticalAlignment?: VerticalAlignment;
  /** Paper source (printer tray) */
  paperSource?: PaperSource;
  /** Text direction (LTR/RTL support) */
  textDirection?: TextDirection;
  /** Right-to-left section layout */
  bidi?: boolean;
  /** Gutter on right side (for RTL) */
  rtlGutter?: boolean;
  /** Document grid for snapping text to grid */
  docGrid?: DocumentGrid;
  /** Line numbering configuration */
  lineNumbering?: LineNumbering;
}

/**
 * Represents a document section
 */
export class Section {
  private properties: SectionProperties;

  /**
   * Creates a new section
   * @param properties Section properties
   */
  constructor(properties: SectionProperties = {}) {
    // Set defaults only where necessary
    this.properties = {
      pageSize: properties.pageSize || {
        width: PAGE_SIZES.LETTER.width,
        height: PAGE_SIZES.LETTER.height,
        orientation: 'portrait',
      },
      margins: properties.margins || {
        top: 1440, // 1 inch
        bottom: 1440,
        left: 1440,
        right: 1440,
        header: 720, // 0.5 inch
        footer: 720,
      },
      // Default to single column layout
      columns: properties.columns || {
        count: 1,
      },
      // Default to next page section break
      type: properties.type || 'nextPage',
      pageNumbering: properties.pageNumbering,
      headers: properties.headers,
      footers: properties.footers,
      titlePage: properties.titlePage,
      // Phase 4.5 - New properties
      verticalAlignment: properties.verticalAlignment,
      paperSource: properties.paperSource,
      textDirection: properties.textDirection,
    };
  }

  /**
   * Gets the section properties
   */
  getProperties(): SectionProperties {
    return { ...this.properties };
  }

  /**
   * Sets page size
   * @param width Width in twips
   * @param height Height in twips
   * @param orientation Page orientation
   */
  setPageSize(
    width: number,
    height: number,
    orientation: PageOrientation = 'portrait'
  ): this {
    this.properties.pageSize = { width, height, orientation };
    return this;
  }

  /**
   * Sets page orientation
   * @param orientation Page orientation
   */
  setOrientation(orientation: PageOrientation): this {
    if (!this.properties.pageSize) {
      this.properties.pageSize = {
        width: PAGE_SIZES.LETTER.width,
        height: PAGE_SIZES.LETTER.height,
      };
    }
    this.properties.pageSize.orientation = orientation;

    // Swap width/height for landscape
    if (
      orientation === 'landscape' &&
      this.properties.pageSize.width < this.properties.pageSize.height
    ) {
      const temp = this.properties.pageSize.width;
      this.properties.pageSize.width = this.properties.pageSize.height;
      this.properties.pageSize.height = temp;
    }

    return this;
  }

  /**
   * Sets margins
   * @param margins Margin properties
   */
  setMargins(margins: Margins): this {
    this.properties.margins = { ...margins };
    return this;
  }

  /**
   * Sets column layout
   * @param count Number of columns
   * @param space Space between columns in twips
   */
  setColumns(count: number, space = 720): this {
    this.properties.columns = {
      count,
      space,
      equalWidth: true,
    };
    return this;
  }

  /**
   * Sets section type
   * @param type Section break type
   */
  setSectionType(type: SectionType): this {
    this.properties.type = type;
    return this;
  }

  /**
   * Sets page numbering
   * @param start Starting page number
   * @param format Number format
   */
  setPageNumbering(start?: number, format?: PageNumberFormat): this {
    this.properties.pageNumbering = { start, format };
    return this;
  }

  /**
   * Sets title page flag (different first page)
   * @param titlePage Whether this section has a different first page
   */
  setTitlePage(titlePage = true): this {
    this.properties.titlePage = titlePage;
    return this;
  }

  /**
   * Sets header reference
   * @param type Header type (default, first, even)
   * @param rId Relationship ID
   */
  setHeaderReference(type: 'default' | 'first' | 'even', rId: string): this {
    if (!this.properties.headers) {
      this.properties.headers = {};
    }
    this.properties.headers[type] = rId;
    return this;
  }

  /**
   * Sets footer reference
   * @param type Footer type (default, first, even)
   * @param rId Relationship ID
   */
  setFooterReference(type: 'default' | 'first' | 'even', rId: string): this {
    if (!this.properties.footers) {
      this.properties.footers = {};
    }
    this.properties.footers[type] = rId;
    return this;
  }

  /**
   * Sets vertical page alignment
   * Controls how content is vertically aligned on the page
   * @param alignment Vertical alignment (top, center, bottom, both=justified)
   */
  setVerticalAlignment(alignment: VerticalAlignment): this {
    this.properties.verticalAlignment = alignment;
    return this;
  }

  /**
   * Sets paper source (printer tray selection)
   * @param first First page tray number
   * @param other Other pages tray number
   */
  setPaperSource(first?: number, other?: number): this {
    this.properties.paperSource = { first, other };
    return this;
  }

  /**
   * Sets column separator line
   * Shows a vertical line between columns
   * @param separator Whether to show column separator line
   */
  setColumnSeparator(separator = true): this {
    if (!this.properties.columns) {
      this.properties.columns = { count: 1 };
    }
    this.properties.columns.separator = separator;
    return this;
  }

  /**
   * Sets custom column widths (for unequal columns)
   * @param widths Array of column widths in twips
   */
  setColumnWidths(widths: number[]): this {
    if (!this.properties.columns) {
      this.properties.columns = { count: widths.length };
    }
    this.properties.columns.columnWidths = widths;
    this.properties.columns.equalWidth = false;
    this.properties.columns.count = widths.length;
    return this;
  }

  /**
   * Sets text direction for the section
   * @param direction Text direction (ltr=left-to-right, rtl=right-to-left, tbRl=top-to-bottom-right-to-left, btLr=bottom-to-top-left-to-right)
   */
  setTextDirection(direction: TextDirection): this {
    this.properties.textDirection = direction;
    return this;
  }

  /**
   * Sets line numbering for the section
   * Per ECMA-376 Part 1, Section 17.6.8 (w:lnNumType)
   * @param options Line numbering configuration
   */
  setLineNumbering(options: LineNumbering): this {
    this.properties.lineNumbering = { ...options };
    return this;
  }

  /**
   * Gets line numbering configuration
   * @returns Line numbering settings or undefined if not set
   */
  getLineNumbering(): LineNumbering | undefined {
    return this.properties.lineNumbering
      ? { ...this.properties.lineNumbering }
      : undefined;
  }

  /**
   * Clears line numbering for the section
   */
  clearLineNumbering(): this {
    this.properties.lineNumbering = undefined;
    return this;
  }

  /**
   * Generates WordprocessingML XML for section properties
   */
  toXML(): XMLElement {
    const children: XMLElement[] = [];

    // Header references
    if (this.properties.headers) {
      if (this.properties.headers.first) {
        children.push(
          XMLBuilder.wSelf('headerReference', {
            'w:type': 'first',
            'r:id': this.properties.headers.first,
          })
        );
      }
      if (this.properties.headers.even) {
        children.push(
          XMLBuilder.wSelf('headerReference', {
            'w:type': 'even',
            'r:id': this.properties.headers.even,
          })
        );
      }
      if (this.properties.headers.default) {
        children.push(
          XMLBuilder.wSelf('headerReference', {
            'w:type': 'default',
            'r:id': this.properties.headers.default,
          })
        );
      }
    }

    // Footer references
    if (this.properties.footers) {
      if (this.properties.footers.first) {
        children.push(
          XMLBuilder.wSelf('footerReference', {
            'w:type': 'first',
            'r:id': this.properties.footers.first,
          })
        );
      }
      if (this.properties.footers.even) {
        children.push(
          XMLBuilder.wSelf('footerReference', {
            'w:type': 'even',
            'r:id': this.properties.footers.even,
          })
        );
      }
      if (this.properties.footers.default) {
        children.push(
          XMLBuilder.wSelf('footerReference', {
            'w:type': 'default',
            'r:id': this.properties.footers.default,
          })
        );
      }
    }

    // Section type
    if (this.properties.type) {
      children.push(
        XMLBuilder.wSelf('type', { 'w:val': this.properties.type })
      );
    }

    // Page size
    if (this.properties.pageSize) {
      const attrs: Record<string, string> = {
        'w:w': this.properties.pageSize.width.toString(),
        'w:h': this.properties.pageSize.height.toString(),
      };
      if (this.properties.pageSize.orientation === 'landscape') {
        attrs['w:orient'] = 'landscape';
      }
      children.push(XMLBuilder.wSelf('pgSz', attrs));
    }

    // Margins
    if (this.properties.margins) {
      const attrs: Record<string, string> = {
        'w:top': this.properties.margins.top.toString(),
        'w:right': this.properties.margins.right.toString(),
        'w:bottom': this.properties.margins.bottom.toString(),
        'w:left': this.properties.margins.left.toString(),
      };
      if (this.properties.margins.header !== undefined) {
        attrs['w:header'] = this.properties.margins.header.toString();
      }
      if (this.properties.margins.footer !== undefined) {
        attrs['w:footer'] = this.properties.margins.footer.toString();
      }
      if (this.properties.margins.gutter !== undefined) {
        attrs['w:gutter'] = this.properties.margins.gutter.toString();
      }
      children.push(XMLBuilder.wSelf('pgMar', attrs));
    }

    // Columns - output when set (including single column)
    if (this.properties.columns) {
      const attrs: Record<string, string> = {
        'w:num': this.properties.columns.count.toString(),
      };
      if (this.properties.columns.space !== undefined) {
        attrs['w:space'] = this.properties.columns.space.toString();
      }
      if (this.properties.columns.equalWidth !== undefined) {
        attrs['w:equalWidth'] = this.properties.columns.equalWidth ? '1' : '0';
      }
      if (this.properties.columns.separator !== undefined) {
        attrs['w:sep'] = this.properties.columns.separator ? '1' : '0';
      }

      // Add individual column widths if specified
      const colChildren: XMLElement[] = [];
      if (this.properties.columns.columnWidths) {
        for (const width of this.properties.columns.columnWidths) {
          colChildren.push(
            XMLBuilder.wSelf('col', { 'w:w': width.toString() })
          );
        }
      }

      children.push(
        colChildren.length > 0
          ? XMLBuilder.w('cols', attrs, colChildren)
          : XMLBuilder.wSelf('cols', attrs)
      );
    }

    // Title page
    if (this.properties.titlePage) {
      children.push(XMLBuilder.wSelf('titlePg', { 'w:val': '1' }));
    }

    // Page numbering
    if (this.properties.pageNumbering) {
      const attrs: Record<string, string> = {};
      if (this.properties.pageNumbering.start !== undefined) {
        attrs['w:start'] = this.properties.pageNumbering.start.toString();
      }
      if (this.properties.pageNumbering.format) {
        attrs['w:fmt'] = this.properties.pageNumbering.format;
      }
      if (Object.keys(attrs).length > 0) {
        children.push(XMLBuilder.wSelf('pgNumType', attrs));
      }
    }

    // Vertical alignment
    if (this.properties.verticalAlignment) {
      children.push(
        XMLBuilder.wSelf('vAlign', {
          'w:val': this.properties.verticalAlignment,
        })
      );
    }

    // Paper source
    if (this.properties.paperSource) {
      const attrs: Record<string, string> = {};
      if (this.properties.paperSource.first !== undefined) {
        attrs['w:first'] = this.properties.paperSource.first.toString();
      }
      if (this.properties.paperSource.other !== undefined) {
        attrs['w:other'] = this.properties.paperSource.other.toString();
      }
      if (Object.keys(attrs).length > 0) {
        children.push(XMLBuilder.wSelf('paperSrc', attrs));
      }
    }

    // Text direction
    if (this.properties.textDirection) {
      children.push(
        XMLBuilder.wSelf('textDirection', {
          'w:val': this.properties.textDirection,
        })
      );
    }

    // Bidirectional section (RTL)
    if (this.properties.bidi) {
      children.push(XMLBuilder.wSelf('bidi'));
    }

    // RTL gutter (gutter on right side)
    if (this.properties.rtlGutter) {
      children.push(XMLBuilder.wSelf('rtlGutter'));
    }

    // Line numbering (w:lnNumType)
    if (this.properties.lineNumbering) {
      const attrs: Record<string, string> = {};
      if (this.properties.lineNumbering.countBy !== undefined) {
        attrs['w:countBy'] = this.properties.lineNumbering.countBy.toString();
      }
      if (this.properties.lineNumbering.start !== undefined) {
        attrs['w:start'] = this.properties.lineNumbering.start.toString();
      }
      if (this.properties.lineNumbering.distance !== undefined) {
        attrs['w:distance'] = this.properties.lineNumbering.distance.toString();
      }
      if (this.properties.lineNumbering.restart) {
        attrs['w:restart'] = this.properties.lineNumbering.restart;
      }
      if (Object.keys(attrs).length > 0) {
        children.push(XMLBuilder.wSelf('lnNumType', attrs));
      }
    }

    // Document grid
    if (this.properties.docGrid) {
      const attrs: Record<string, string> = {};
      if (this.properties.docGrid.type) {
        attrs['w:type'] = this.properties.docGrid.type;
      }
      if (this.properties.docGrid.linePitch !== undefined) {
        attrs['w:linePitch'] = this.properties.docGrid.linePitch.toString();
      }
      if (this.properties.docGrid.charSpace !== undefined) {
        attrs['w:charSpace'] = this.properties.docGrid.charSpace.toString();
      }
      if (Object.keys(attrs).length > 0) {
        children.push(XMLBuilder.wSelf('docGrid', attrs));
      }
    }

    return XMLBuilder.w('sectPr', undefined, children);
  }

  /**
   * Creates a deep clone of this section
   * @returns New Section instance with copied properties
   */
  clone(): Section {
    // Deep clone all nested objects
    const clonedProperties: SectionProperties = {};

    if (this.properties.pageSize) {
      clonedProperties.pageSize = { ...this.properties.pageSize };
    }

    if (this.properties.margins) {
      clonedProperties.margins = { ...this.properties.margins };
    }

    if (this.properties.columns) {
      clonedProperties.columns = {
        ...this.properties.columns,
        columnWidths: this.properties.columns.columnWidths
          ? [...this.properties.columns.columnWidths]
          : undefined,
      };
    }

    if (this.properties.pageNumbering) {
      clonedProperties.pageNumbering = { ...this.properties.pageNumbering };
    }

    if (this.properties.headers) {
      clonedProperties.headers = { ...this.properties.headers };
    }

    if (this.properties.footers) {
      clonedProperties.footers = { ...this.properties.footers };
    }

    if (this.properties.paperSource) {
      clonedProperties.paperSource = { ...this.properties.paperSource };
    }

    if (this.properties.docGrid) {
      clonedProperties.docGrid = { ...this.properties.docGrid };
    }

    if (this.properties.lineNumbering) {
      clonedProperties.lineNumbering = { ...this.properties.lineNumbering };
    }

    // Copy primitive properties
    clonedProperties.type = this.properties.type;
    clonedProperties.titlePage = this.properties.titlePage;
    clonedProperties.verticalAlignment = this.properties.verticalAlignment;
    clonedProperties.textDirection = this.properties.textDirection;
    clonedProperties.bidi = this.properties.bidi;
    clonedProperties.rtlGutter = this.properties.rtlGutter;

    return new Section(clonedProperties);
  }

  /**
   * Creates a section with default properties
   */
  static create(properties?: SectionProperties): Section {
    return new Section(properties);
  }

  /**
   * Creates a letter-sized section (8.5" x 11")
   */
  static createLetter(): Section {
    return new Section({
      pageSize: {
        width: PAGE_SIZES.LETTER.width,
        height: PAGE_SIZES.LETTER.height,
        orientation: 'portrait',
      },
    });
  }

  /**
   * Creates an A4-sized section (21cm x 29.7cm)
   */
  static createA4(): Section {
    return new Section({
      pageSize: {
        width: PAGE_SIZES.A4.width,
        height: PAGE_SIZES.A4.height,
        orientation: 'portrait',
      },
    });
  }

  /**
   * Creates a landscape section
   * @param pageSize Page size (default: Letter)
   */
  static createLandscape(pageSize: 'letter' | 'a4' = 'letter'): Section {
    const size = pageSize === 'a4' ? PAGE_SIZES.A4 : PAGE_SIZES.LETTER;
    return new Section({
      pageSize: {
        width: size.height, // Swap for landscape
        height: size.width,
        orientation: 'landscape',
      },
    });
  }
}
