/**
 * Document Options Adapter
 *
 * Provides a simplified interface for configuring document-level options
 * and applying them to docXMLater Document objects.
 *
 * @module adapters/document-options
 */

import type {
  Margins,
  PageSize,
  PageOrientation,
  PageNumberFormat,
  DocumentProperties,
} from '../docXMLater/src';
import {
  Document,
  PAGE_SIZES,
  inchesToTwips,
  cmToTwips,
} from '../docXMLater/src';

/**
 * Preset page sizes available for documents
 * Note: Based on PAGE_SIZES from docXMLater which supports LETTER, A4, LEGAL, TABLOID, and A3
 */
export type PageSizePreset = 'letter' | 'a4' | 'legal' | 'a3' | 'tabloid';

/**
 * Unit for margin specification
 */
export type MarginUnit = 'twips' | 'inches' | 'cm' | 'points';

/**
 * Simplified margin specification
 */
export interface DocumentMargins {
  /**
   * Top margin
   */
  top?: number;

  /**
   * Right margin
   */
  right?: number;

  /**
   * Bottom margin
   */
  bottom?: number;

  /**
   * Left margin
   */
  left?: number;

  /**
   * Header distance from top
   */
  header?: number;

  /**
   * Footer distance from bottom
   */
  footer?: number;

  /**
   * Gutter margin for binding
   */
  gutter?: number;

  /**
   * Unit for margin values (default: 'twips')
   */
  unit?: MarginUnit;
}

/**
 * Document layout options
 */
export interface DocumentLayoutOptions {
  /**
   * Page size preset or custom dimensions
   */
  pageSize?: PageSizePreset | PageSize;

  /**
   * Page orientation
   */
  orientation?: PageOrientation;

  /**
   * Page margins
   */
  margins?: DocumentMargins;

  /**
   * Number of columns
   */
  columns?: number;

  /**
   * Space between columns in twips
   */
  columnSpace?: number;
}

/**
 * Document header/footer options
 */
export interface HeaderFooterOptions {
  /**
   * Whether the first page has different header/footer
   */
  differentFirstPage?: boolean;

  /**
   * Whether odd and even pages have different headers/footers
   */
  differentOddEven?: boolean;
}

/**
 * Page numbering options
 */
export interface PageNumberingOptions {
  /**
   * Starting page number
   */
  startAt?: number;

  /**
   * Page number format
   */
  format?: PageNumberFormat;

  /**
   * Position of page numbers: 'header' | 'footer'
   */
  position?: 'header' | 'footer';

  /**
   * Alignment of page numbers
   */
  alignment?: 'left' | 'center' | 'right';
}

/**
 * Complete document options interface
 */
export interface DocumentOptions {
  /**
   * Document metadata properties
   */
  properties?: DocumentProperties;

  /**
   * Layout options (page size, margins, etc.)
   */
  layout?: DocumentLayoutOptions;

  /**
   * Header and footer configuration
   */
  headerFooter?: HeaderFooterOptions;

  /**
   * Page numbering configuration
   */
  pageNumbering?: PageNumberingOptions;

  /**
   * Default font family for the document
   */
  defaultFontFamily?: string;

  /**
   * Default font size in points
   */
  defaultFontSize?: number;

  /**
   * Default line spacing multiplier (1.0 = single, 1.5 = 1.5 lines, 2.0 = double)
   */
  defaultLineSpacing?: number;

  /**
   * Enable track changes
   */
  trackChanges?: boolean;

  /**
   * Default language code (e.g., 'en-US')
   */
  language?: string;
}

/**
 * Default document options
 */
export const DEFAULT_DOCUMENT_OPTIONS: Required<
  Pick<
    DocumentOptions,
    'layout' | 'defaultFontFamily' | 'defaultFontSize' | 'defaultLineSpacing'
  >
> = {
  layout: {
    pageSize: 'letter',
    orientation: 'portrait',
    margins: {
      top: 1440, // 1 inch in twips
      right: 1440,
      bottom: 1440,
      left: 1440,
      unit: 'twips',
    },
  },
  defaultFontFamily: 'Calibri',
  defaultFontSize: 11,
  defaultLineSpacing: 1.15,
};

/**
 * Converts margin values to twips based on the specified unit.
 *
 * @param margins - The margins with unit specification
 * @returns Margins in twips
 */
export function convertMarginsToTwips(margins: DocumentMargins): Margins {
  const unit = margins.unit || 'twips';

  const convert = (value: number | undefined): number => {
    if (value === undefined) return 0;

    switch (unit) {
      case 'inches':
        return inchesToTwips(value);
      case 'cm':
        return cmToTwips(value);
      case 'points':
        return value * 20; // 1 point = 20 twips
      case 'twips':
      default:
        return value;
    }
  };

  return {
    top: convert(margins.top) || DEFAULT_DOCUMENT_OPTIONS.layout.margins!.top!,
    right:
      convert(margins.right) || DEFAULT_DOCUMENT_OPTIONS.layout.margins!.right!,
    bottom:
      convert(margins.bottom) ||
      DEFAULT_DOCUMENT_OPTIONS.layout.margins!.bottom!,
    left:
      convert(margins.left) || DEFAULT_DOCUMENT_OPTIONS.layout.margins!.left!,
    header: margins.header !== undefined ? convert(margins.header) : undefined,
    footer: margins.footer !== undefined ? convert(margins.footer) : undefined,
    gutter: margins.gutter !== undefined ? convert(margins.gutter) : undefined,
  };
}

/**
 * Resolves a page size preset to actual dimensions.
 *
 * @param preset - The page size preset name
 * @param orientation - The page orientation
 * @returns The PageSize object with width and height in twips
 */
export function resolvePageSize(
  preset: PageSizePreset | PageSize,
  orientation: PageOrientation = 'portrait'
): PageSize {
  // If already a PageSize object, return it
  if (typeof preset === 'object' && 'width' in preset && 'height' in preset) {
    return preset;
  }

  // Map preset names to PAGE_SIZES constants
  const presetMap: Record<PageSizePreset, { width: number; height: number }> = {
    letter: PAGE_SIZES.LETTER,
    a4: PAGE_SIZES.A4,
    legal: PAGE_SIZES.LEGAL,
    a3: PAGE_SIZES.A3,
    tabloid: PAGE_SIZES.TABLOID,
  };

  const size = presetMap[preset] || PAGE_SIZES.LETTER;

  // Swap width and height for landscape orientation
  if (orientation === 'landscape') {
    return {
      width: size.height,
      height: size.width,
      orientation: 'landscape',
    };
  }

  return {
    width: size.width,
    height: size.height,
    orientation: 'portrait',
  };
}

/**
 * Applies document options to a Document object.
 *
 * This function configures the document's section properties, metadata,
 * and default formatting based on the provided options.
 *
 * @param doc - The Document object to configure
 * @param options - The options to apply
 *
 * @example
 * ```typescript
 * const doc = Document.create();
 *
 * applyDocumentOptions(doc, {
 *   properties: {
 *     title: 'My Report',
 *     creator: 'My Application',
 *   },
 *   layout: {
 *     pageSize: 'a4',
 *     orientation: 'portrait',
 *     margins: {
 *       top: 1,
 *       right: 1,
 *       bottom: 1,
 *       left: 1,
 *       unit: 'inches',
 *     },
 *   },
 *   defaultFontFamily: 'Arial',
 *   defaultFontSize: 12,
 * });
 * ```
 */
export function applyDocumentOptions(
  doc: Document,
  options: DocumentOptions
): void {
  // 1. Apply layout options
  if (options.layout) {
    const layout = options.layout;
    const orientation = layout.orientation ?? 'portrait';

    // Apply page size with orientation
    if (layout.pageSize) {
      const resolved = resolvePageSize(layout.pageSize, orientation);
      doc.setPageSize(resolved.width, resolved.height, orientation);
    } else if (layout.orientation) {
      // Only orientation specified without page size
      doc.setPageOrientation(orientation);
    }

    // Apply margins
    if (layout.margins) {
      const marginsInTwips = convertMarginsToTwips(layout.margins);
      doc.setMargins(marginsInTwips);
    }

    // Apply columns
    if (layout.columns && layout.columns > 1) {
      const columnSpace = layout.columnSpace ?? 720; // default 0.5 inch
      doc.getSection().setColumns(layout.columns, columnSpace);
    }
  }

  // 2. Apply document properties (title, creator, subject, etc.)
  if (options.properties) {
    doc.setProperties(options.properties);
  }

  // 3. Apply header/footer options
  if (options.headerFooter && options.headerFooter.differentFirstPage) {
    doc.getSection().setTitlePage(true);
  }

  // 4. Apply page numbering
  if (options.pageNumbering) {
    doc
      .getSection()
      .setPageNumbering(
        options.pageNumbering.startAt,
        options.pageNumbering.format
      );
  }

  // 5. Apply default font family and size via Normal style
  const hasDefaultFont = options.defaultFontFamily !== undefined;
  const hasDefaultSize = options.defaultFontSize !== undefined;

  if (hasDefaultFont || hasDefaultSize) {
    const normalStyle = doc.getStylesManager().getStyle('Normal');

    if (normalStyle) {
      const existingRunFormatting = normalStyle.getRunFormatting() ?? {};
      const updatedRunFormatting = { ...existingRunFormatting };

      if (hasDefaultFont) {
        updatedRunFormatting.font = options.defaultFontFamily;
      }
      if (hasDefaultSize) {
        // RunFormatting size is in points; Style.generateRunProperties
        // converts to half-points internally
        updatedRunFormatting.size = options.defaultFontSize;
      }

      normalStyle.setRunFormatting(updatedRunFormatting);
    }
  }

  // 6. Apply line spacing via Normal style paragraph formatting
  if (options.defaultLineSpacing !== undefined) {
    const normalStyle = doc.getStylesManager().getStyle('Normal');

    if (normalStyle) {
      const existingParagraphFormatting =
        normalStyle.getParagraphFormatting() ?? {};
      // Line spacing in OOXML: lineRule 'auto' uses 240 = single spacing
      // Multiply by 240 to get the OOXML line value
      const lineValue = Math.round(options.defaultLineSpacing * 240);

      normalStyle.setParagraphFormatting({
        ...existingParagraphFormatting,
        spacing: {
          ...existingParagraphFormatting.spacing,
          line: lineValue,
          lineRule: 'auto',
        },
      });
    }
  }

  // 7. Enable track changes if specified
  if (options.trackChanges) {
    doc.enableTrackChanges();
  }

  // 8. Language - not directly supported by docXMLater, no-op
}

/**
 * Creates a Document with the specified options pre-applied.
 *
 * @param options - The document options
 * @returns A new Document with options applied
 */
export function createDocumentWithOptions(options: DocumentOptions): Document {
  const doc = Document.create();
  applyDocumentOptions(doc, options);
  return doc;
}

/**
 * Validates document options and returns any issues found.
 *
 * @param options - The options to validate
 * @returns An array of validation error messages (empty if valid)
 */
export function validateDocumentOptions(options: DocumentOptions): string[] {
  const errors: string[] = [];

  // Validate margins are non-negative
  if (options.layout?.margins) {
    const margins = options.layout.margins;
    if (margins.top !== undefined && margins.top < 0) {
      errors.push('Top margin cannot be negative');
    }
    if (margins.right !== undefined && margins.right < 0) {
      errors.push('Right margin cannot be negative');
    }
    if (margins.bottom !== undefined && margins.bottom < 0) {
      errors.push('Bottom margin cannot be negative');
    }
    if (margins.left !== undefined && margins.left < 0) {
      errors.push('Left margin cannot be negative');
    }
  }

  // Validate font size
  if (
    options.defaultFontSize !== undefined &&
    (options.defaultFontSize < 1 || options.defaultFontSize > 1638)
  ) {
    errors.push('Font size must be between 1 and 1638 points');
  }

  // Validate line spacing
  if (
    options.defaultLineSpacing !== undefined &&
    (options.defaultLineSpacing < 0.5 || options.defaultLineSpacing > 10)
  ) {
    errors.push('Line spacing must be between 0.5 and 10');
  }

  // Validate columns
  if (
    options.layout?.columns !== undefined &&
    (options.layout.columns < 1 || options.layout.columns > 10)
  ) {
    errors.push('Number of columns must be between 1 and 10');
  }

  return errors;
}
