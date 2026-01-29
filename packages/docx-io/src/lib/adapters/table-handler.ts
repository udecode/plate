/**
 * Table Handler - HTML table to DOCX table conversion
 *
 * This module provides handlers for converting HTML table elements to
 * docXMLater Table, TableRow, and TableCell objects.
 *
 * Supports:
 * - Basic table structure conversion
 * - colspan (gridSpan) for horizontal cell merging
 * - rowspan (vMerge) for vertical cell merging
 * - Header row detection and styling
 * - Cell formatting (alignment, borders, shading)
 *
 * @module table-handler
 */

import { Table, TableRow, TableCell } from '../docXMLater/src';
import type {
  ConversionContext,
  ConversionResult,
  TableContext,
} from './element-handlers';

// ============================================================================
// Constants
// ============================================================================

/** Default table width in twips (100% of page width is typically ~9360 twips) */
const DEFAULT_TABLE_WIDTH = 9360;

/** Default cell padding in twips (1/20 of a point, 72 twips = 1/10 inch) */
const DEFAULT_CELL_PADDING = 72;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for table conversion
 */
export interface TableConversionOptions {
  /** Default table width in twips */
  defaultWidth?: number;
  /** Default cell padding in twips */
  defaultCellPadding?: number;
  /** Whether to auto-detect header rows */
  autoDetectHeaders?: boolean;
  /** Default border style */
  defaultBorderStyle?: 'single' | 'none' | 'dashed' | 'dotted';
  /** Default border color (hex without #) */
  defaultBorderColor?: string;
  /** Default border size in eighths of a point */
  defaultBorderSize?: number;
}

/**
 * Cell merge tracking for vMerge handling
 */
interface CellMergeTracker {
  /** Column index to remaining rowspan count */
  [columnIndex: number]: {
    remaining: number;
    columnSpan: number;
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parses a CSS dimension value to twips
 * @param value - CSS value (e.g., '100px', '50%', '10pt')
 * @param containerWidth - Container width for percentage calculations
 * @returns Value in twips
 */
function parseDimensionToTwips(
  value: string | null,
  containerWidth: number = DEFAULT_TABLE_WIDTH
): number {
  if (!value) return 0;

  const numValue = Number.parseFloat(value);
  if (isNaN(numValue)) return 0;

  if (value.endsWith('%')) {
    return Math.round((numValue / 100) * containerWidth);
  }
  if (value.endsWith('px')) {
    // 1px ≈ 15 twips at 96 DPI
    return Math.round(numValue * 15);
  }
  if (value.endsWith('pt')) {
    // 1pt = 20 twips
    return Math.round(numValue * 20);
  }
  if (value.endsWith('in')) {
    // 1in = 1440 twips
    return Math.round(numValue * 1440);
  }
  if (value.endsWith('cm')) {
    // 1cm ≈ 567 twips
    return Math.round(numValue * 567);
  }
  if (value.endsWith('mm')) {
    // 1mm ≈ 56.7 twips
    return Math.round(numValue * 56.7);
  }

  // Assume pixels if no unit
  return Math.round(numValue * 15);
}

/**
 * Parses border style from CSS
 * @param style - CSS border-style value
 * @returns DOCX border style
 */
function parseBorderStyle(
  style: string | null
): 'single' | 'dashed' | 'dotted' | 'none' {
  if (!style) return 'single';

  switch (style.toLowerCase()) {
    case 'none':
    case 'hidden':
      return 'none';
    case 'dashed':
      return 'dashed';
    case 'dotted':
      return 'dotted';
    default:
      return 'single';
  }
}

/**
 * Parses color from CSS to hex (without #)
 * @param color - CSS color value
 * @returns Hex color string without #
 */
function parseColorToHex(color: string | null): string {
  if (!color) return '000000';

  // Remove # if present
  if (color.startsWith('#')) {
    color = color.substring(1);
    // Handle shorthand (e.g., #FFF -> FFFFFF)
    if (color.length === 3) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    return color.toUpperCase();
  }

  // Handle rgb/rgba
  const rgbMatch = color.match(/rgb[a]?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const r = Number.parseInt(rgbMatch[1]!, 10).toString(16).padStart(2, '0');
    const g = Number.parseInt(rgbMatch[2]!, 10).toString(16).padStart(2, '0');
    const b = Number.parseInt(rgbMatch[3]!, 10).toString(16).padStart(2, '0');
    return (r + g + b).toUpperCase();
  }

  // Named colors (basic subset)
  const namedColors: Record<string, string> = {
    black: '000000',
    white: 'FFFFFF',
    red: 'FF0000',
    green: '00FF00',
    blue: '0000FF',
    gray: '808080',
    grey: '808080',
  };

  return namedColors[color.toLowerCase()] || '000000';
}

// ============================================================================
// Table Handlers
// ============================================================================

/**
 * Handles table elements (<table>)
 *
 * Creates a new Table with appropriate formatting.
 *
 * @param element - The <table> element
 * @param context - Conversion context
 * @param options - Table conversion options
 * @returns Conversion result with Table
 *
 * @example
 * ```typescript
 * const result = handleTableElement(tableElement, context);
 * if (result.element) {
 *   document.addTable(result.element as Table);
 * }
 * ```
 */
export function handleTableElement(
  element: Element,
  context: ConversionContext,
  options: TableConversionOptions = {}
): ConversionResult {
  const {
    defaultWidth = DEFAULT_TABLE_WIDTH,
    defaultBorderStyle = 'single',
    defaultBorderColor = '000000',
    defaultBorderSize = 4,
  } = options;

  // Create new table
  const table = new Table();

  // Parse table width
  const widthAttr = element.getAttribute('width');
  const styleWidth = (element as HTMLElement).style?.width;
  const tableWidth =
    parseDimensionToTwips(styleWidth || widthAttr, defaultWidth) ||
    defaultWidth;
  table.setWidth(tableWidth).setWidthType('dxa');

  // Set default borders
  table.setBorders({
    top: {
      style: defaultBorderStyle,
      size: defaultBorderSize,
      color: defaultBorderColor,
    },
    bottom: {
      style: defaultBorderStyle,
      size: defaultBorderSize,
      color: defaultBorderColor,
    },
    left: {
      style: defaultBorderStyle,
      size: defaultBorderSize,
      color: defaultBorderColor,
    },
    right: {
      style: defaultBorderStyle,
      size: defaultBorderSize,
      color: defaultBorderColor,
    },
    insideH: {
      style: defaultBorderStyle,
      size: defaultBorderSize,
      color: defaultBorderColor,
    },
    insideV: {
      style: defaultBorderStyle,
      size: defaultBorderSize,
      color: defaultBorderColor,
    },
  });

  // Parse cell margin from cellpadding attribute
  const cellPadding = element.getAttribute('cellpadding');
  if (cellPadding) {
    const paddingTwips = parseDimensionToTwips(cellPadding + 'px');
    table.setCellMargins({
      top: paddingTwips,
      bottom: paddingTwips,
      left: paddingTwips,
      right: paddingTwips,
    });
  }

  // Initialize merge tracker for vMerge handling
  const mergeTracker: CellMergeTracker = {};

  // Create table context
  const tableContext: TableContext = {
    table,
    columnWidths: [],
  };

  return {
    element: table,
    processChildren: true,
    childContext: {
      tableContext,
    },
  };
}

/**
 * Handles table row elements (<tr>)
 *
 * Creates a new TableRow and adds it to the current table.
 *
 * @param element - The <tr> element
 * @param context - Conversion context
 * @returns Conversion result with TableRow
 */
export function handleTableRowElement(
  element: Element,
  context: ConversionContext
): ConversionResult {
  if (!context.tableContext?.table) {
    return {
      error: 'TableRow outside of Table context',
      processChildren: false,
    };
  }

  // Create new row
  const row = new TableRow();

  // Check if this is a header row (inside <thead> or first row with <th> cells)
  const isInThead = element.parentElement?.tagName.toLowerCase() === 'thead';
  const hasThCells = element.querySelector('th') !== null;

  if (isInThead || hasThCells) {
    row.setHeader(true);
  }

  // Parse row height if specified
  const heightStyle = (element as HTMLElement).style?.height;
  if (heightStyle) {
    const heightTwips = parseDimensionToTwips(heightStyle);
    if (heightTwips > 0) {
      row.setHeight(heightTwips, 'atLeast');
    }
  }

  // Add row to table
  context.tableContext.table.addRow(row);

  return {
    element: row,
    processChildren: true,
    childContext: {
      tableContext: {
        ...context.tableContext,
        currentRow: row,
      },
    },
  };
}

/**
 * Handles table cell elements (<td> and <th>)
 *
 * Creates a new TableCell with colspan/rowspan support.
 *
 * @param element - The <td> or <th> element
 * @param context - Conversion context
 * @returns Conversion result with TableCell
 */
export function handleTableCellElement(
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

  // Create new cell
  const cell = new TableCell();

  // Handle colspan (gridSpan)
  const colspanAttr = element.getAttribute('colspan');
  if (colspanAttr) {
    const colspan = Number.parseInt(colspanAttr, 10);
    if (colspan > 1) {
      cell.setColumnSpan(colspan);
    }
  }

  // Handle rowspan (vMerge)
  const rowspanAttr = element.getAttribute('rowspan');
  if (rowspanAttr) {
    const rowspan = Number.parseInt(rowspanAttr, 10);
    if (rowspan > 1) {
      // This cell starts a vertical merge
      cell.setVerticalMerge('restart');
      // Note: Tracking of continuing cells must be done at a higher level
      // that processes all rows in order
    }
  }

  // Parse cell width
  const widthAttr = element.getAttribute('width');
  const styleWidth = (element as HTMLElement).style?.width;
  if (styleWidth || widthAttr) {
    const cellWidth = parseDimensionToTwips(styleWidth || widthAttr);
    if (cellWidth > 0) {
      cell.setWidth(cellWidth);
    }
  }

  // Parse vertical alignment
  const valignAttr = element.getAttribute('valign');
  const styleValign = (element as HTMLElement).style?.verticalAlign;
  const valign = styleValign || valignAttr;
  if (valign) {
    const alignMap: Record<string, 'top' | 'center' | 'bottom'> = {
      top: 'top',
      middle: 'center',
      center: 'center',
      bottom: 'bottom',
    };
    const docxAlign = alignMap[valign.toLowerCase()];
    if (docxAlign) {
      cell.setVerticalAlignment(docxAlign);
    }
  }

  // Parse background color
  const bgColorAttr = element.getAttribute('bgcolor');
  const styleBgColor = (element as HTMLElement).style?.backgroundColor;
  if (styleBgColor || bgColorAttr) {
    const bgColor = parseColorToHex(styleBgColor || bgColorAttr);
    cell.setShading({ fill: bgColor, pattern: 'clear' });
  }

  // Apply header styling if <th>
  if (isHeader) {
    // Headers typically have bold text and gray background
    const currentShading = cell.getShading();
    if (!currentShading?.fill) {
      cell.setShading({ fill: 'F0F0F0', pattern: 'clear' });
    }
  }

  // Add cell to row
  context.tableContext.currentRow.addCell(cell);

  return {
    element: cell,
    processChildren: true,
    childContext: {
      tableContext: {
        ...context.tableContext,
        currentCell: cell,
      },
    },
  };
}

// ============================================================================
// Advanced Table Handling
// ============================================================================

/**
 * Processes a complete HTML table with proper rowspan tracking
 *
 * This function handles the complete conversion of an HTML table,
 * including proper vMerge tracking for rowspan cells.
 *
 * @param tableElement - The <table> element
 * @param context - Conversion context
 * @param options - Conversion options
 * @returns The created Table or null if conversion failed
 */
export function processHtmlTable(
  tableElement: Element,
  context: ConversionContext,
  options: TableConversionOptions = {}
): Table | null {
  // Create the table
  const tableResult = handleTableElement(tableElement, context, options);
  if (!tableResult.element) {
    return null;
  }

  const table = tableResult.element as Table;

  // Track rowspan continuations: column index -> remaining rows
  const rowspanTracker: Map<number, { remaining: number; colspan: number }> =
    new Map();

  // Process all rows
  const rows = tableElement.querySelectorAll(
    ':scope > tr, :scope > thead > tr, :scope > tbody > tr, :scope > tfoot > tr'
  );

  rows.forEach((rowElement) => {
    const row = new TableRow();

    // Check if header row
    const isInThead =
      rowElement.parentElement?.tagName.toLowerCase() === 'thead';
    const hasThCells = rowElement.querySelector('th') !== null;
    if (isInThead || hasThCells) {
      row.setHeader(true);
    }

    table.addRow(row);

    // Process cells in this row
    const cells = rowElement.querySelectorAll(':scope > td, :scope > th');
    let columnIndex = 0;

    cells.forEach((cellElement) => {
      // Skip columns that are covered by rowspan from previous rows
      while (rowspanTracker.has(columnIndex)) {
        const tracker = rowspanTracker.get(columnIndex)!;

        // Create continuation cell for vMerge
        const continueCell = new TableCell();
        continueCell.setVerticalMerge('continue');
        if (tracker.colspan > 1) {
          continueCell.setColumnSpan(tracker.colspan);
        }
        // Add empty paragraph (required by DOCX spec)
        continueCell.createParagraph('');
        row.addCell(continueCell);

        // Decrement tracker
        tracker.remaining--;
        if (tracker.remaining <= 0) {
          rowspanTracker.delete(columnIndex);
        }

        columnIndex += tracker.colspan;
      }

      const isHeader = cellElement.tagName.toLowerCase() === 'th';

      // Create the actual cell
      const cell = new TableCell();

      // Handle colspan
      const colspanAttr = cellElement.getAttribute('colspan');
      const colspan = colspanAttr ? Number.parseInt(colspanAttr, 10) : 1;
      if (colspan > 1) {
        cell.setColumnSpan(colspan);
      }

      // Handle rowspan
      const rowspanAttr = cellElement.getAttribute('rowspan');
      const rowspan = rowspanAttr ? Number.parseInt(rowspanAttr, 10) : 1;
      if (rowspan > 1) {
        cell.setVerticalMerge('restart');
        // Track for subsequent rows
        rowspanTracker.set(columnIndex, {
          remaining: rowspan - 1,
          colspan,
        });
      }

      // Apply header styling
      if (isHeader) {
        cell.setShading({ fill: 'F0F0F0', pattern: 'clear' });
      }

      // Add text content (simplified - full implementation would recurse)
      const textContent = cellElement.textContent?.trim() || '';
      cell.createParagraph(textContent);

      row.addCell(cell);
      columnIndex += colspan;
    });

    // Handle any remaining rowspan continuations at the end of the row
    while (rowspanTracker.has(columnIndex)) {
      const tracker = rowspanTracker.get(columnIndex)!;

      const continueCell = new TableCell();
      continueCell.setVerticalMerge('continue');
      if (tracker.colspan > 1) {
        continueCell.setColumnSpan(tracker.colspan);
      }
      continueCell.createParagraph('');
      row.addCell(continueCell);

      tracker.remaining--;
      if (tracker.remaining <= 0) {
        rowspanTracker.delete(columnIndex);
      }

      columnIndex += tracker.colspan;
    }
  });

  return table;
}

/**
 * Creates a simple table from data
 *
 * Utility function to create a table from a 2D array of strings.
 *
 * @param data - 2D array of cell contents
 * @param hasHeaders - Whether the first row is headers
 * @returns Created Table
 *
 * @example
 * ```typescript
 * const table = createSimpleTable([
 *   ['Name', 'Age', 'City'],
 *   ['John', '30', 'NYC'],
 *   ['Jane', '25', 'LA'],
 * ], true);
 * ```
 */
export function createSimpleTable(data: string[][], hasHeaders = false): Table {
  const table = new Table();

  // Set default borders
  table.setBorders({
    top: { style: 'single', size: 4, color: '000000' },
    bottom: { style: 'single', size: 4, color: '000000' },
    left: { style: 'single', size: 4, color: '000000' },
    right: { style: 'single', size: 4, color: '000000' },
    insideH: { style: 'single', size: 4, color: '000000' },
    insideV: { style: 'single', size: 4, color: '000000' },
  });

  data.forEach((rowData, rowIndex) => {
    const row = new TableRow();

    if (hasHeaders && rowIndex === 0) {
      row.setHeader(true);
    }

    rowData.forEach((cellData) => {
      const cell = new TableCell();

      if (hasHeaders && rowIndex === 0) {
        cell.setShading({ fill: 'F0F0F0', pattern: 'clear' });
      }

      cell.createParagraph(cellData);
      row.addCell(cell);
    });

    table.addRow(row);
  });

  return table;
}
