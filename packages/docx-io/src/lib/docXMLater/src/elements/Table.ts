/**
 * Table - Represents a table in a document
 */

import { TableRow, type RowFormatting } from './TableRow';
import { TableCell, type CellFormatting } from './TableCell';
import { XMLBuilder, type XMLElement } from '../xml/XMLBuilder';
import { deepClone } from '../utils/deepClone';
import type {
  TableAlignment as CommonTableAlignment,
  BorderStyle,
  HorizontalAnchor,
  VerticalAnchor,
  HorizontalAlignment,
  VerticalAlignment,
  ShadingPattern,
} from './CommonTypes';

// ============================================================================
// RE-EXPORTED TYPES (for backward compatibility)
// ============================================================================

/**
 * Table alignment
 * @see CommonTypes.TableAlignment
 */
export type TableAlignment = CommonTableAlignment;

/**
 * Table layout type
 */
export type TableLayout = 'auto' | 'fixed';

/**
 * Table border definition (same as cell borders)
 * @see CommonTypes.BorderDefinition
 */
export interface TableBorder {
  style?: BorderStyle;
  size?: number;
  space?: number; // Border spacing (padding) in points
  color?: string;
}

/**
 * Table borders
 * @see CommonTypes.TableBorderDefinitions
 */
export interface TableBorders {
  top?: TableBorder;
  bottom?: TableBorder;
  left?: TableBorder;
  right?: TableBorder;
  insideH?: TableBorder; // Inside horizontal borders
  insideV?: TableBorder; // Inside vertical borders
}

/**
 * Horizontal anchor for table positioning
 * @see CommonTypes.HorizontalAnchor
 */
export type TableHorizontalAnchor = HorizontalAnchor;

/**
 * Vertical anchor for table positioning
 * @see CommonTypes.VerticalAnchor
 */
export type TableVerticalAnchor = VerticalAnchor;

/**
 * Horizontal alignment for relative table positioning
 * @see CommonTypes.HorizontalAlignment
 */
export type TableHorizontalAlignment = HorizontalAlignment;

/**
 * Vertical alignment for relative table positioning
 * @see CommonTypes.VerticalAlignment
 */
export type TableVerticalAlignment = VerticalAlignment;

/**
 * Table positioning properties (for floating tables)
 * Per ECMA-376 Part 1 §17.4.57 (tblpPr)
 */
export interface TablePositionProperties {
  /** Horizontal position in twips (absolute positioning) */
  x?: number;
  /** Vertical position in twips (absolute positioning) */
  y?: number;
  /** Horizontal anchor/positioning base */
  horizontalAnchor?: TableHorizontalAnchor;
  /** Vertical anchor/positioning base */
  verticalAnchor?: TableVerticalAnchor;
  /** Horizontal alignment (relative positioning) */
  horizontalAlignment?: TableHorizontalAlignment;
  /** Vertical alignment (relative positioning) */
  verticalAlignment?: TableVerticalAlignment;
  /** Left padding from anchor in twips */
  leftFromText?: number;
  /** Right padding from anchor in twips */
  rightFromText?: number;
  /** Top padding from anchor in twips */
  topFromText?: number;
  /** Bottom padding from anchor in twips */
  bottomFromText?: number;
}

/**
 * Table width type
 */
export type TableWidthType = 'auto' | 'dxa' | 'pct';

/**
 * Table shading/background
 * Per ECMA-376 Part 1 §17.4.56 (w:shd inside w:tblPr)
 */
export interface TableShading {
  /** Background fill color in hex (e.g., 'F0F0F0') */
  fill?: string;
  /** Foreground/pattern color in hex */
  color?: string;
  /** Pattern type (solid, pct12, horzStripe, etc.) */
  pattern?: ShadingPattern;
}

/**
 * Table formatting options
 */
/**
 * Table cell margins (padding inside cells)
 * Per ECMA-376 Part 1 §17.4.42 (tblCellMar)
 */
export interface TableCellMargins {
  /** Top margin in twips */
  top?: number;
  /** Bottom margin in twips */
  bottom?: number;
  /** Left margin in twips */
  left?: number;
  /** Right margin in twips */
  right?: number;
}

/**
 * Table formatting options
 */
export interface TableFormatting {
  style?: string; // Table style ID (e.g., 'Table1', 'TableGrid')
  width?: number; // Table width in twips
  widthType?: TableWidthType; // Width type (auto, dxa=twips, pct=percentage)
  alignment?: TableAlignment;
  layout?: TableLayout;
  borders?: TableBorders;
  cellSpacing?: number; // Cell spacing in twips
  cellSpacingType?: TableWidthType; // Cell spacing type
  cellMargins?: TableCellMargins; // Default cell margins (padding) for all cells
  indent?: number; // Left indent in twips
  tblLook?: string; // Table look flags (appearance settings)
  shading?: TableShading; // Table background shading
  // Batch 1 properties
  position?: TablePositionProperties; // Floating table positioning
  overlap?: boolean; // Allow table overlap with other floating tables
  bidiVisual?: boolean; // Right-to-left table layout
  tableGrid?: number[]; // Column widths in twips
  caption?: string; // Table caption for accessibility
  description?: string; // Table description for accessibility
}

/**
 * First row formatting options for table headers
 */
export interface FirstRowFormattingOptions {
  /** Text alignment in cells */
  alignment?: 'left' | 'center' | 'right';
  /** Bold text */
  bold?: boolean;
  /** Italic text */
  italic?: boolean;
  /** Underline text */
  underline?: boolean | 'single' | 'double' | 'thick' | 'dotted' | 'dash';
  /** Spacing before paragraph (in twips) */
  spacingBefore?: number;
  /** Spacing after paragraph (in twips) */
  spacingAfter?: number;
  /** Background color (hex without #) */
  shading?: string;
}

/**
 * Represents a table
 */
export class Table {
  private rows: TableRow[] = [];
  private formatting: TableFormatting;
  /** StylesManager reference for conditional formatting resolution */
  private _stylesManager?: import('../formatting/StylesManager').StylesManager;

  /**
   * Creates a new Table
   * @param rows - Number of rows to create (optional)
   * @param columns - Number of columns per row (optional)
   * @param formatting - Table formatting options
   */
  constructor(
    rows?: number,
    columns?: number,
    formatting: TableFormatting = {}
  ) {
    // Set default width if not specified
    // Per ECMA-376, tables require <w:tblW> element for Word compatibility
    // Default: Letter page width (12240 twips) minus standard margins (2*1440 twips) = 9360 twips
    if (formatting.width === undefined) {
      formatting.width = 9360; // ~6.5 inches
    }

    this.formatting = formatting;

    if (
      rows !== undefined &&
      rows > 0 &&
      columns !== undefined &&
      columns > 0
    ) {
      for (let i = 0; i < rows; i++) {
        const row = new TableRow(columns);
        row._setParentTable(this);
        this.rows.push(row);
      }
    }
  }

  /**
   * Adds a row to the table
   *
   * Appends a TableRow instance to the end of the table.
   *
   * @param row - The TableRow instance to add
   * @returns This table instance for method chaining
   *
   * @example
   * ```typescript
   * const table = new Table();
   * const row = new TableRow(3);
   * table.addRow(row);
   * ```
   */
  addRow(row: TableRow): this {
    this.rows.push(row);
    row._setParentTable(this);
    return this;
  }

  /**
   * Creates a new row and adds it to the table
   *
   * Convenience method that creates a TableRow and appends it in one operation.
   *
   * @param cellCount - Number of cells to create in the row
   * @param formatting - Optional row formatting properties
   * @returns The created TableRow instance for further customization
   *
   * @example
   * ```typescript
   * const table = new Table();
   * const row = table.createRow(4);
   * row.getCell(0)?.addParagraph(new Paragraph().addText('Cell 1'));
   * ```
   */
  createRow(cellCount?: number, formatting?: RowFormatting): TableRow {
    const row = new TableRow(cellCount, formatting);
    this.rows.push(row);
    row._setParentTable(this);
    return row;
  }

  /**
   * Gets a row by its index
   *
   * @param index - The row index (0-based, where 0 is the first row)
   * @returns The TableRow at the specified index, or undefined if index is out of bounds
   *
   * @example
   * ```typescript
   * const firstRow = table.getRow(0);
   * const secondRow = table.getRow(1);
   * if (firstRow) {
   *   console.log(`First row has ${firstRow.getCellCount()} cells`);
   * }
   * ```
   */
  getRow(index: number): TableRow | undefined {
    return this.rows[index];
  }

  /**
   * Gets all rows in the table
   *
   * Returns a copy of the rows array to prevent external modification.
   *
   * @returns Array of all TableRow instances
   *
   * @example
   * ```typescript
   * const rows = table.getRows();
   * console.log(`Table has ${rows.length} rows`);
   * for (const row of rows) {
   *   console.log(`Row has ${row.getCellCount()} cells`);
   * }
   * ```
   */
  getRows(): TableRow[] {
    return [...this.rows];
  }

  /**
   * Gets the total number of rows in the table
   *
   * @returns Number of rows
   *
   * @example
   * ```typescript
   * console.log(`Table has ${table.getRowCount()} rows`);
   * ```
   */
  getRowCount(): number {
    return this.rows.length;
  }

  /**
   * Gets a specific cell by row and column indices
   *
   * @param rowIndex - The row index (0-based)
   * @param columnIndex - The column index (0-based)
   * @returns The TableCell at the specified position, or undefined if indices are out of bounds
   *
   * @example
   * ```typescript
   * const cell = table.getCell(0, 0); // Top-left cell
   * if (cell) {
   *   cell.addParagraph(new Paragraph().addText('A1'));
   * }
   *
   * // Access cell in third row, second column
   * const cell2 = table.getCell(2, 1);
   * ```
   */
  getCell(rowIndex: number, columnIndex: number): TableCell | undefined {
    const row = this.getRow(rowIndex);
    return row ? row.getCell(columnIndex) : undefined;
  }

  /**
   * Sets the table width
   *
   * Defines the total width of the table. Use with {@link setWidthType}
   * to specify if width is in twips, percentage, or auto.
   *
   * @param twips - Width value (interpretation depends on widthType)
   *   - For 'dxa' (default): Width in twips (1/20th of a point)
   *   - For 'pct': Percentage * 50 (e.g., 5000 = 100%)
   *   - For 'auto': Value is ignored
   * @returns This table instance for method chaining
   *
   * @example
   * ```typescript
   * table.setWidth(9360);              // 6.5 inches in twips
   * table.setWidth(5000).setWidthType('pct');  // 100% width
   * ```
   */
  setWidth(twips: number): this {
    this.formatting.width = twips;
    return this;
  }

  /**
   * Sets table horizontal alignment
   *
   * Controls where the table is positioned horizontally on the page.
   *
   * @param alignment - Alignment value ('left' |'center' | 'right')
   * @returns This table instance for method chaining
   *
   * @example
   * ```typescript
   * table.setAlignment('center');  // Center the table on page
   * table.setAlignment('right');   // Align table to right margin
   * ```
   */
  setAlignment(alignment: TableAlignment): this {
    this.formatting.alignment = alignment;
    return this;
  }

  /**
   * Sets table layout algorithm
   *
   * Controls how table column widths are calculated.
   *
   * @param layout - Layout type
   *   - 'auto': Columns auto-fit to content and window width
   *   - 'fixed': Columns use fixed widths (faster rendering)
   * @returns This table instance for method chaining
   *
   * @example
   * ```typescript
   * table.setLayout('auto');   // Auto-fit to window
   * table.setLayout('fixed');  // Use fixed column widths
   * ```
   */
  setLayout(layout: TableLayout): this {
    this.formatting.layout = layout;
    return this;
  }

  /**
   * Sets table borders
   *
   * Defines borders for all sides of the table and interior borders.
   *
   * @param borders - Border definitions for each edge
   * @param borders.top - Top border of table
   * @param borders.bottom - Bottom border of table
   * @param borders.left - Left border of table
   * @param borders.right - Right border of table
   * @param borders.insideH - Horizontal borders between rows
   * @param borders.insideV - Vertical borders between columns
   * @returns This table instance for method chaining
   *
   * @example
   * ```typescript
   * table.setBorders({
   *   top: { style: 'single', size: 4, color: '000000' },
   *   bottom: { style: 'single', size: 4, color: '000000' },
   *   insideH: { style: 'single', size: 2, color: 'CCCCCC' },
   *   insideV: { style: 'single', size: 2, color: 'CCCCCC' }
   * });
   * ```
   */
  setBorders(borders: TableBorders): this {
    this.formatting.borders = borders;
    return this;
  }

  /**
   * Sets all borders to the same style
   *
   * Convenience method that applies identical borders to all edges
   * (top, bottom, left, right, insideH, insideV).
   *
   * @param border - Border definition to apply uniformly
   * @returns This table instance for method chaining
   *
   * @example
   * ```typescript
   * // Apply single black border to all edges
   * table.setAllBorders({
   *   style: 'single',
   *   size: 4,
   *   color: '000000'
   * });
   * ```
   */
  setAllBorders(border: TableBorder): this {
    this.formatting.borders = {
      top: border,
      bottom: border,
      left: border,
      right: border,
      insideH: border,
      insideV: border,
    };
    return this;
  }

  /**
   * Sets shading (background color) for the first row of the table
   * Useful for header rows in data tables
   * @param color - Hex color without # (e.g., 'DFDFDF' for light gray)
   * @returns This table for chaining
   * @example
   * ```typescript
   * table.setFirstRowShading('DFDFDF'); // Light gray header
   * ```
   */
  setFirstRowShading(color: string): this {
    if (this.rows.length > 0) {
      const firstRow = this.rows[0];
      if (firstRow) {
        for (const cell of firstRow.getCells()) {
          cell.setShading({ fill: color });
        }
      }
    }
    return this;
  }

  /**
   * Sets comprehensive formatting for the first row of the table
   *
   * This is ideal for formatting table headers with alignment, text formatting,
   * spacing, and background color in a single call.
   *
   * @param options - Formatting options for the first row
   * @returns This table for chaining
   * @example
   * ```typescript
   * // Create a formatted table header
   * table.setFirstRowFormatting({
   *   alignment: 'center',
   *   bold: true,
   *   spacingBefore: 120,
   *   spacingAfter: 120,
   *   shading: 'DFDFDF'
   * });
   *
   * // Format header with underline and custom spacing
   * table.setFirstRowFormatting({
   *   alignment: 'left',
   *   bold: true,
   *   underline: 'single',
   *   spacingAfter: 80
   * });
   * ```
   */
  setFirstRowFormatting(options: FirstRowFormattingOptions): this {
    if (this.rows.length === 0) {
      return this; // No rows to format
    }

    const firstRow = this.rows[0];
    if (!firstRow) {
      return this;
    }

    // Apply formatting to each cell in the first row
    for (const cell of firstRow.getCells()) {
      const paragraphs = cell.getParagraphs();

      // Apply shading to the cell if specified
      if (options.shading) {
        cell.setShading({ fill: options.shading });
      }

      // Apply formatting to each paragraph in the cell
      for (const para of paragraphs) {
        // Apply paragraph alignment
        if (options.alignment) {
          para.setAlignment(options.alignment as any);
        }

        // Apply spacing
        if (options.spacingBefore !== undefined) {
          para.setSpaceBefore(options.spacingBefore);
        }
        if (options.spacingAfter !== undefined) {
          para.setSpaceAfter(options.spacingAfter);
        }

        // Apply run formatting to all runs in the paragraph
        const runs = para.getRuns();
        for (const run of runs) {
          // Apply formatting using run's setter methods
          if (options.bold !== undefined) {
            run.setBold(options.bold);
          }
          if (options.italic !== undefined) {
            run.setItalic(options.italic);
          }
          if (options.underline !== undefined) {
            run.setUnderline(options.underline);
          }
        }
      }
    }

    return this;
  }

  /**
   * Sets cell spacing
   * @param twips - Cell spacing in twips
   * @returns This table for chaining
   */
  setCellSpacing(twips: number): this {
    this.formatting.cellSpacing = twips;
    return this;
  }

  /**
   * Sets left indent
   * @param twips - Indent in twips
   * @returns This table for chaining
   */
  setIndent(twips: number): this {
    this.formatting.indent = twips;
    return this;
  }

  /**
   * Sets table style reference
   * @param style - Table style ID (e.g., 'Table1', 'TableGrid')
   * @returns This table for chaining
   */
  setStyle(style: string): this {
    this.formatting.style = style;
    return this;
  }

  /**
   * Sets table look flags (appearance settings)
   * @param tblLook - Table look value (e.g., '0000', '04A0')
   * @returns This table for chaining
   */
  setTblLook(tblLook: string): this {
    this.formatting.tblLook = tblLook;
    return this;
  }

  /**
   * Decodes tblLook hex string into boolean flags
   * Per ECMA-376 Part 1 Section 17.4.56
   * @returns Object with boolean flags for each tblLook property
   */
  getTblLookFlags(): {
    firstRow: boolean;
    lastRow: boolean;
    firstColumn: boolean;
    lastColumn: boolean;
    noHBand: boolean;
    noVBand: boolean;
  } {
    const hex = this.formatting.tblLook || '0000';
    const value = Number.parseInt(hex, 16) || 0;

    return {
      firstRow: (value & 0x00_20) !== 0,
      lastRow: (value & 0x00_40) !== 0,
      firstColumn: (value & 0x00_80) !== 0,
      lastColumn: (value & 0x01_00) !== 0,
      noHBand: (value & 0x02_00) !== 0,
      noVBand: (value & 0x04_00) !== 0,
    };
  }

  /**
   * Applies conditional formatting to table cells based on rules
   *
   * Enables advanced table formatting including:
   * - Automatic header row detection and styling
   * - Alternating row colors (zebra striping)
   * - Content-based formatting rules
   *
   * @param rules - Conditional formatting rules
   * @returns This table for chaining
   *
   * @example
   * ```typescript
   * // Apply header formatting and alternating rows
   * table.applyConditionalFormatting({
   *   headerRow: true,
   *   alternatingRows: {
   *     even: { shading: { fill: 'F0F0F0' } },
   *     odd: { shading: { fill: 'FFFFFF' } }
   *   }
   * });
   *
   * // Custom header formatting
   * table.applyConditionalFormatting({
   *   headerRow: {
   *     shading: { fill: '4472C4' },
   *     textColor: 'FFFFFF'
   *   }
   * });
   *
   * // Content-based formatting
   * table.applyConditionalFormatting({
   *   contentRules: [
   *     {
   *       condition: (text, row, col) => parseFloat(text) > 1000,
   *       formatting: { shading: { fill: 'FFD700' } } // Gold for large numbers
   *     },
   *     {
   *       condition: (text) => text.toLowerCase().includes('error'),
   *       formatting: { shading: { fill: 'FF0000' } } // Red for errors
   *     }
   *   ]
   * });
   *
   * // Combined rules
   * table.applyConditionalFormatting({
   *   headerRow: { shading: { fill: '2F5496' } },
   *   alternatingRows: {
   *     even: { shading: { fill: 'D9E1F2' } }
   *   },
   *   contentRules: [
   *     {
   *       condition: (text, row, col) => col === 0 && row > 0,
   *       formatting: { textColor: '000000' }
   *     }
   *   ]
   * });
   * ```
   */
  applyConditionalFormatting(rules: {
    headerRow?: boolean | Partial<CellFormatting>;
    alternatingRows?: {
      even?: Partial<CellFormatting>;
      odd?: Partial<CellFormatting>;
    };
    contentRules?: Array<{
      condition: (
        cellText: string,
        rowIndex: number,
        colIndex: number
      ) => boolean;
      formatting: Partial<CellFormatting>;
    }>;
  }): this {
    const rows = this.getRows();

    // Apply header row formatting
    if (rules.headerRow && rows.length > 0) {
      const headerFormatting: Partial<CellFormatting> =
        rules.headerRow === true
          ? { shading: { fill: '4472C4' } } // Default blue header
          : rules.headerRow;

      const headerRow = rows[0];
      if (headerRow) {
        for (const cell of headerRow.getCells()) {
          this.applyCellFormatting(cell, headerFormatting);
        }
      }
    }

    // Apply alternating rows
    if (rules.alternatingRows) {
      rows.forEach((row, index) => {
        const isEven = index % 2 === 0;
        const formatting = isEven
          ? rules.alternatingRows?.even
          : rules.alternatingRows?.odd;

        if (formatting) {
          for (const cell of row.getCells()) {
            this.applyCellFormatting(cell, formatting);
          }
        }
      });
    }

    // Apply content-based rules
    if (rules.contentRules && rules.contentRules.length > 0) {
      rows.forEach((row, rowIndex) => {
        row.getCells().forEach((cell, colIndex) => {
          const cellText = cell
            .getParagraphs()
            .map((p) => p.getText())
            .join('');

          for (const rule of rules.contentRules!) {
            if (rule.condition(cellText, rowIndex, colIndex)) {
              this.applyCellFormatting(cell, rule.formatting);
            }
          }
        });
      });
    }

    return this;
  }

  /**
   * Helper method to apply formatting to a cell
   * @private
   */
  private applyCellFormatting(
    cell: TableCell,
    formatting: Partial<CellFormatting>
  ): void {
    // Apply shading
    if (formatting.shading) {
      cell.setShading(formatting.shading);
    }

    // Apply borders
    if (formatting.borders) {
      cell.setBorders(formatting.borders);
    }

    // Apply text direction
    if (formatting.textDirection) {
      cell.setTextDirection(formatting.textDirection);
    }

    // Apply vertical alignment
    if (formatting.verticalAlignment) {
      cell.setVerticalAlignment(formatting.verticalAlignment);
    }

    // Apply width
    if (formatting.width !== undefined) {
      cell.setWidth(formatting.width);
    }

    // Apply margins
    if (formatting.margins) {
      cell.setMargins(formatting.margins);
    }
  }

  /**
   * Sets table positioning properties for floating tables
   * Per ECMA-376 Part 1 §17.4.57
   * @param position - Table position properties
   * @returns This table for chaining
   * @example
   * ```typescript
   * // Position table at absolute coordinates
   * table.setPosition({
   *   x: 1440, // 1 inch from left
   *   y: 1440, // 1 inch from top
   *   horizontalAnchor: 'page',
   *   verticalAnchor: 'page'
   * });
   *
   * // Position table with relative alignment
   * table.setPosition({
   *   horizontalAlignment: 'center',
   *   verticalAlignment: 'top',
   *   horizontalAnchor: 'margin',
   *   verticalAnchor: 'page'
   * });
   * ```
   */
  setPosition(position: TablePositionProperties): this {
    this.formatting.position = position;
    return this;
  }

  /**
   * Sets whether table can overlap with other floating tables
   * Per ECMA-376 Part 1 §17.4.30
   * @param overlap - True to allow overlap, false to prevent
   * @returns This table for chaining
   */
  setOverlap(overlap: boolean): this {
    this.formatting.overlap = overlap;
    return this;
  }

  /**
   * Sets bidirectional (right-to-left) visual layout
   * Per ECMA-376 Part 1 §17.4.1
   * @param bidi - True for RTL layout, false for LTR
   * @returns This table for chaining
   */
  setBidiVisual(bidi: boolean): this {
    this.formatting.bidiVisual = bidi;
    return this;
  }

  /**
   * Sets table grid column widths
   * Per ECMA-376 Part 1 §17.4.49
   * @param widths - Array of column widths in twips
   * @returns This table for chaining
   * @example
   * ```typescript
   * // 3 columns: 2 inches, 3 inches, 2 inches
   * table.setTableGrid([2880, 4320, 2880]);
   * ```
   */
  setTableGrid(widths: number[]): this {
    this.formatting.tableGrid = widths;
    return this;
  }

  /**
   * Sets table caption for accessibility
   * Per ECMA-376 Part 1 §17.4.58
   * @param caption - Table caption text
   * @returns This table for chaining
   */
  setCaption(caption: string): this {
    this.formatting.caption = caption;
    return this;
  }

  /**
   * Sets table description for accessibility
   * Per ECMA-376 Part 1 §17.4.63
   * @param description - Table description text
   * @returns This table for chaining
   */
  setDescription(description: string): this {
    this.formatting.description = description;
    return this;
  }

  /**
   * Sets table-level shading (background)
   *
   * Per ECMA-376 Part 1 §17.4.56 (w:shd), this sets the default
   * background shading for the entire table. Individual cells can
   * override this with their own shading.
   *
   * @param shading - Table shading configuration
   * @returns This table instance for method chaining
   *
   * @example
   * ```typescript
   * table.setShading({ fill: 'F0F0F0' }); // Light gray background
   * table.setShading({ fill: 'FFFFFF', pattern: 'pct12', color: '000000' });
   * ```
   */
  setShading(shading: TableShading): this {
    this.formatting.shading = shading;
    return this;
  }

  /**
   * Gets table-level shading configuration
   * @returns Table shading or undefined if not set
   */
  getShading(): TableShading | undefined {
    return this.formatting.shading;
  }

  /**
   * Sets table width type
   *
   * Defines how the table width value should be interpreted.
   * Per ECMA-376 Part 1 §17.4.64
   *
   * @param type - Width interpretation type
   *   - 'auto': Automatic width (ignores width value)
   *   - 'dxa': Width in twips (1/20th of a point)
   *   - 'pct': Width as percentage (value * 50 = percentage, e.g., 5000 = 100%)
   * @returns This table instance for method chaining
   *
   * @example
   * ```typescript
   * table.setWidth(5000).setWidthType('pct');  // 100% page width
   * table.setWidth(9360).setWidthType('dxa');  // 6.5 inches (absolute)
   * table.setWidthType('auto');                // Auto-fit content
   * ```
   */
  setWidthType(type: TableWidthType): this {
    this.formatting.widthType = type;
    return this;
  }

  /**
   * Sets cell spacing type
   * @param type - Cell spacing type
   * @returns This table for chaining
   */
  setCellSpacingType(type: TableWidthType): this {
    this.formatting.cellSpacingType = type;
    return this;
  }

  /**
   * Gets a copy of the table formatting
   *
   * Returns a copy of all formatting properties including width, alignment,
   * layout, borders, and other table-level settings.
   *
   * @returns Copy of the table formatting object
   *
   * @example
   * ```typescript
   * const formatting = table.getFormatting();
   * console.log(`Width: ${formatting.width} twips`);
   * console.log(`Layout: ${formatting.layout}`);
   * ```
   */
  getFormatting(): TableFormatting {
    return { ...this.formatting };
  }

  // ============================================================================
  // Individual Formatting Getters
  // ============================================================================

  /**
   * Gets the table width in twips
   * @returns Width in twips or undefined if not set
   */
  getWidth(): number | undefined {
    return this.formatting.width;
  }

  /**
   * Gets the table width type
   * @returns Width type ('auto', 'dxa', 'pct', 'nil') or undefined
   */
  getWidthType(): string | undefined {
    return this.formatting.widthType;
  }

  /**
   * Gets the table horizontal alignment
   * @returns Alignment ('left', 'center', 'right') or undefined
   */
  getAlignment(): string | undefined {
    return this.formatting.alignment;
  }

  /**
   * Gets the table layout type
   * @returns Layout ('autofit', 'fixed') or undefined
   */
  getLayout(): string | undefined {
    return this.formatting.layout;
  }

  /**
   * Gets the table left indentation in twips
   * @returns Indent in twips or undefined if not set
   */
  getIndent(): number | undefined {
    return this.formatting.indent;
  }

  /**
   * Gets the table borders
   * @returns Borders object or undefined
   */
  getBorders(): TableFormatting['borders'] | undefined {
    return this.formatting.borders;
  }

  /**
   * Gets the column widths (table grid)
   * @returns Array of column widths in twips
   */
  getColumnWidths(): number[] {
    return [...(this.formatting.tableGrid || [])];
  }

  /**
   * Gets the cell spacing value
   * @returns Cell spacing in twips or undefined
   */
  getCellSpacing(): number | undefined {
    return this.formatting.cellSpacing;
  }

  /**
   * Gets the default cell margins (padding) for all cells
   * Per ECMA-376 Part 1 §17.4.42 (tblCellMar)
   * @returns Cell margins object or undefined if not set
   */
  getCellMargins(): TableCellMargins | undefined {
    return this.formatting.cellMargins;
  }

  /**
   * Sets the default cell margins (padding) for all cells
   * Per ECMA-376 Part 1 §17.4.42 (tblCellMar)
   * @param margins - Cell margins in twips
   * @returns This table for chaining
   * @example
   * ```typescript
   * table.setCellMargins({ top: 43, left: 115, bottom: 43, right: 115 });
   * ```
   */
  setCellMargins(margins: TableCellMargins): this {
    this.formatting.cellMargins = margins;
    return this;
  }

  /**
   * Gets the table style ID
   * @returns Style ID or undefined if not set
   */
  getStyle(): string | undefined {
    return this.formatting.style;
  }

  // ============================================================================
  // Checker Methods
  // ============================================================================

  /**
   * Checks if the table has any rows
   * @returns True if table has rows
   */
  hasRows(): boolean {
    return this.rows.length > 0;
  }

  /**
   * Checks if the table is a floating table (has positioning)
   * @returns True if table has positioning properties
   */
  isFloating(): boolean {
    return this.formatting.position !== undefined;
  }

  /**
   * Checks if the table has a style applied
   * @returns True if table has a style
   */
  hasStyle(): boolean {
    return this.formatting.style !== undefined && this.formatting.style !== '';
  }

  /**
   * Sets the StylesManager reference for conditional formatting resolution.
   * Propagates to all paragraphs in all cells.
   * @internal
   */
  _setStylesManager(
    manager: import('../formatting/StylesManager').StylesManager
  ): void {
    this._stylesManager = manager;
    // Propagate to all paragraphs in all cells
    for (const row of this.rows) {
      for (const cell of row.getCells()) {
        for (const para of cell.getParagraphs()) {
          para._setStylesManager(manager);
        }
      }
    }
  }

  /**
   * Gets the StylesManager reference for conditional formatting resolution.
   * @internal
   */
  _getStylesManager():
    | import('../formatting/StylesManager').StylesManager
    | undefined {
    return this._stylesManager;
  }

  /**
   * Converts the table to WordprocessingML XML element
   * @returns XMLElement representing the table
   */
  toXML(): XMLElement {
    const tblPrChildren: XMLElement[] = [];

    // Add table style (must come first per ECMA-376)
    if (this.formatting.style) {
      tblPrChildren.push(
        XMLBuilder.wSelf('tblStyle', { 'w:val': this.formatting.style })
      );
    }

    // Add table positioning properties (tblpPr) - for floating tables
    if (this.formatting.position) {
      const pos = this.formatting.position;
      const posAttrs: Record<string, string | number> = {};

      if (pos.x !== undefined) posAttrs['w:tblpX'] = pos.x;
      if (pos.y !== undefined) posAttrs['w:tblpY'] = pos.y;
      if (pos.horizontalAnchor) posAttrs['w:tblpXSpec'] = pos.horizontalAnchor;
      if (pos.verticalAnchor) posAttrs['w:tblpYSpec'] = pos.verticalAnchor;
      if (pos.horizontalAlignment)
        posAttrs['w:tblpXAlign'] = pos.horizontalAlignment;
      if (pos.verticalAlignment)
        posAttrs['w:tblpYAlign'] = pos.verticalAlignment;
      if (pos.leftFromText !== undefined)
        posAttrs['w:leftFromText'] = pos.leftFromText;
      if (pos.rightFromText !== undefined)
        posAttrs['w:rightFromText'] = pos.rightFromText;
      if (pos.topFromText !== undefined)
        posAttrs['w:topFromText'] = pos.topFromText;
      if (pos.bottomFromText !== undefined)
        posAttrs['w:bottomFromText'] = pos.bottomFromText;

      if (Object.keys(posAttrs).length > 0) {
        tblPrChildren.push(XMLBuilder.wSelf('tblpPr', posAttrs));
      }
    }

    // Add table overlap
    if (this.formatting.overlap !== undefined) {
      tblPrChildren.push(
        XMLBuilder.wSelf('tblOverlap', {
          'w:val': this.formatting.overlap ? 'overlap' : 'never',
        })
      );
    }

    // Add bidirectional visual layout
    if (this.formatting.bidiVisual) {
      tblPrChildren.push(XMLBuilder.wSelf('bidiVisual'));
    }

    // Add table width
    if (this.formatting.width !== undefined) {
      const widthType = this.formatting.widthType || 'dxa';
      tblPrChildren.push(
        XMLBuilder.wSelf('tblW', {
          'w:w': this.formatting.width,
          'w:type': widthType,
        })
      );
    }

    // Add table alignment (jc = justification/alignment)
    if (this.formatting.alignment) {
      tblPrChildren.push(
        XMLBuilder.wSelf('jc', { 'w:val': this.formatting.alignment })
      );
    }

    // Add table layout
    if (this.formatting.layout) {
      tblPrChildren.push(
        XMLBuilder.wSelf('tblLayout', { 'w:type': this.formatting.layout })
      );
    }

    // Add table borders
    if (this.formatting.borders) {
      const borderElements: XMLElement[] = [];
      const borders = this.formatting.borders;

      if (borders.top) {
        borderElements.push(XMLBuilder.createBorder('top', borders.top));
      }
      if (borders.bottom) {
        borderElements.push(XMLBuilder.createBorder('bottom', borders.bottom));
      }
      if (borders.left) {
        borderElements.push(XMLBuilder.createBorder('left', borders.left));
      }
      if (borders.right) {
        borderElements.push(XMLBuilder.createBorder('right', borders.right));
      }
      if (borders.insideH) {
        borderElements.push(
          XMLBuilder.createBorder('insideH', borders.insideH)
        );
      }
      if (borders.insideV) {
        borderElements.push(
          XMLBuilder.createBorder('insideV', borders.insideV)
        );
      }

      if (borderElements.length > 0) {
        tblPrChildren.push(
          XMLBuilder.w('tblBorders', undefined, borderElements)
        );
      }
    }

    // Add cell spacing
    if (this.formatting.cellSpacing !== undefined) {
      const cellSpacingType = this.formatting.cellSpacingType || 'dxa';
      tblPrChildren.push(
        XMLBuilder.wSelf('tblCellSpacing', {
          'w:w': this.formatting.cellSpacing,
          'w:type': cellSpacingType,
        })
      );
    }

    // Add cell margins (tblCellMar) - per ECMA-376 Part 1 §17.4.42
    if (this.formatting.cellMargins) {
      const marginElements: XMLElement[] = [];
      if (this.formatting.cellMargins.top !== undefined) {
        marginElements.push(
          XMLBuilder.wSelf('top', {
            'w:w': this.formatting.cellMargins.top,
            'w:type': 'dxa',
          })
        );
      }
      if (this.formatting.cellMargins.left !== undefined) {
        marginElements.push(
          XMLBuilder.wSelf('left', {
            'w:w': this.formatting.cellMargins.left,
            'w:type': 'dxa',
          })
        );
      }
      if (this.formatting.cellMargins.bottom !== undefined) {
        marginElements.push(
          XMLBuilder.wSelf('bottom', {
            'w:w': this.formatting.cellMargins.bottom,
            'w:type': 'dxa',
          })
        );
      }
      if (this.formatting.cellMargins.right !== undefined) {
        marginElements.push(
          XMLBuilder.wSelf('right', {
            'w:w': this.formatting.cellMargins.right,
            'w:type': 'dxa',
          })
        );
      }
      if (marginElements.length > 0) {
        tblPrChildren.push(
          XMLBuilder.w('tblCellMar', undefined, marginElements)
        );
      }
    }

    // Add table indent
    if (this.formatting.indent !== undefined) {
      tblPrChildren.push(
        XMLBuilder.wSelf('tblInd', {
          'w:w': this.formatting.indent,
          'w:type': 'dxa',
        })
      );
    }

    // Add table look (appearance flags)
    if (this.formatting.tblLook) {
      tblPrChildren.push(
        XMLBuilder.wSelf('tblLook', { 'w:val': this.formatting.tblLook })
      );
    }

    // Add table shading (background) per ECMA-376 Part 1 §17.4.56
    if (this.formatting.shading) {
      const shdAttrs: Record<string, string> = {};
      if (this.formatting.shading.pattern)
        shdAttrs['w:val'] = this.formatting.shading.pattern;
      if (this.formatting.shading.fill)
        shdAttrs['w:fill'] = this.formatting.shading.fill;
      if (this.formatting.shading.color)
        shdAttrs['w:color'] = this.formatting.shading.color;
      if (Object.keys(shdAttrs).length > 0) {
        tblPrChildren.push(XMLBuilder.wSelf('shd', shdAttrs));
      }
    }

    // Add table caption (accessibility)
    if (this.formatting.caption) {
      tblPrChildren.push(
        XMLBuilder.wSelf('tblCaption', { 'w:val': this.formatting.caption })
      );
    }

    // Add table description (accessibility)
    if (this.formatting.description) {
      tblPrChildren.push(
        XMLBuilder.wSelf('tblDescription', {
          'w:val': this.formatting.description,
        })
      );
    }

    // Build table element
    const tableChildren: XMLElement[] = [];

    // Add table properties
    tableChildren.push(XMLBuilder.w('tblPr', undefined, tblPrChildren));

    // Add table grid (column definitions)
    // Per ECMA-376 Part 1 §17.4.49, w:tblGrid MUST be present in w:tbl
    // Use custom tableGrid if specified, otherwise auto-generate
    // CRITICAL: Use getTotalGridSpan() instead of getCellCount() to account for
    // cells with gridSpan (column span). A row with 2 cells where one spans 4 columns
    // should generate 5 grid columns, not 2.
    const gridWidths = this.formatting.tableGrid;
    const maxColumns = gridWidths
      ? gridWidths.length
      : Math.max(...this.rows.map((row) => row.getTotalGridSpan()), 0);

    // Always generate tblGrid - use at least 1 column for empty tables
    const gridColumnCount = maxColumns > 0 ? maxColumns : 1;
    const tblGridChildren: XMLElement[] = [];

    for (let i = 0; i < gridColumnCount; i++) {
      if (gridWidths && gridWidths[i] !== undefined) {
        // Use specified grid width
        tblGridChildren.push(
          XMLBuilder.wSelf('gridCol', { 'w:w': gridWidths[i] })
        );
      } else {
        // Auto width (default to 2880 twips = 2 inches)
        tblGridChildren.push(XMLBuilder.wSelf('gridCol', { 'w:w': 2880 }));
      }
    }
    tableChildren.push(XMLBuilder.w('tblGrid', undefined, tblGridChildren));

    // Add rows
    for (const row of this.rows) {
      tableChildren.push(row.toXML());
    }

    return XMLBuilder.w('tbl', undefined, tableChildren);
  }

  /**
   * Removes a row from the table
   *
   * Deletes the row at the specified index and shifts subsequent rows up.
   *
   * @param index - The row index to remove (0-based)
   * @returns True if the row was removed, false if index was invalid
   *
   * @example
   * ```typescript
   * table.removeRow(0);  // Remove first row
   * table.removeRow(2);  // Remove third row
   * ```
   */
  removeRow(index: number): boolean {
    if (index >= 0 && index < this.rows.length) {
      this.rows.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Inserts a row at a specific position
   *
   * Inserts a new row at the specified index. If no row is provided,
   * creates an empty row with columns matching the table's column count.
   *
   * @param index - Position to insert at (0-based, clamped to valid range)
   * @param row - Optional TableRow to insert (creates new row if not provided)
   * @returns The inserted TableRow instance
   *
   * @example
   * ```typescript
   * // Insert empty row at beginning
   * const row = table.insertRow(0);
   *
   * // Insert custom row in the middle
   * const customRow = new TableRow(3);
   * table.insertRow(2, customRow);
   * ```
   */
  insertRow(index: number, row?: TableRow): TableRow {
    // Clamp index to valid range
    if (index < 0) index = 0;
    if (index > this.rows.length) index = this.rows.length;

    // Create new row if not provided, matching the column count
    if (!row) {
      const columnCount = this.getColumnCount();
      row = new TableRow(columnCount);
    }

    // Insert the row
    this.rows.splice(index, 0, row);
    return row;
  }

  /**
   * Adds a column to all rows in the table
   *
   * Inserts a new cell in each row at the specified position.
   * If no index is provided, adds the column at the end.
   *
   * @param index - Optional position to insert the column (0-based, defaults to end)
   * @returns This table instance for method chaining
   *
   * @example
   * ```typescript
   * table.addColumn();     // Add column at end
   * table.addColumn(0);    // Insert column at beginning
   * table.addColumn(2);    // Insert column at position 2
   * ```
   */
  addColumn(index?: number): this {
    for (const row of this.rows) {
      const cell = new TableCell();
      const cells = row.getCells();

      if (index === undefined || index >= cells.length) {
        // Add to end
        row.addCell(cell);
      } else {
        // Insert at specific position
        const idx = Math.max(0, index);
        // We need to rebuild the row with cells in the correct order
        const newCells = [...cells.slice(0, idx), cell, ...cells.slice(idx)];

        // Clear existing cells and add in new order
        (row as any).cells = newCells;
      }
    }
    return this;
  }

  /**
   * Removes a column from all rows in the table
   *
   * Deletes the cell at the specified column index in every row.
   *
   * @param index - The column index to remove (0-based)
   * @returns True if the column was removed from at least one row, false if index was invalid
   *
   * @example
   * ```typescript
   * table.removeColumn(0);  // Remove first column
   * table.removeColumn(2);  // Remove third column
   * ```
   */
  removeColumn(index: number): boolean {
    if (index < 0 || this.rows.length === 0) {
      return false;
    }

    let removed = false;
    for (const row of this.rows) {
      const cells = row.getCells();
      if (index < cells.length) {
        // Remove the cell at the specified index
        (row as any).cells.splice(index, 1);
        removed = true;
      }
    }

    return removed;
  }

  /**
   * Gets the maximum column count across all rows
   *
   * Returns the highest number of cells in any row. Useful since
   * rows may have different numbers of cells.
   *
   * @returns Maximum number of columns in the table
   *
   * @example
   * ```typescript
   * console.log(`Table has up to ${table.getColumnCount()} columns`);
   * ```
   */
  getColumnCount(): number {
    if (this.rows.length === 0) {
      return 0;
    }
    return Math.max(...this.rows.map((row) => row.getCellCount()));
  }

  /**
   * Sets specific widths for table columns
   *
   * Defines the width of each column. Use null for auto-width columns.
   *
   * @param widths - Array of column widths in twips (null = auto width)
   * @returns This table instance for method chaining
   *
   * @example
   * ```typescript
   * // First column 2", second column 3", third auto
   * table.setColumnWidths([2880, 4320, null]);
   * ```
   */
  setColumnWidths(widths: (number | null)[]): this {
    // Store column widths in formatting for use in toXML
    (this.formatting as any).columnWidths = widths;
    return this;
  }

  /**
   * Creates a new Table instance
   *
   * Factory method for creating a table with specified dimensions and formatting.
   *
   * @param rows - Number of rows to create
   * @param columns - Number of columns per row
   * @param formatting - Optional table formatting properties
   * @returns New Table instance
   *
   * @example
   * ```typescript
   * const table = Table.create(3, 4);  // 3 rows × 4 columns
   * const styledTable = Table.create(2, 3, {
   *   alignment: 'center',
   *   layout: 'auto'
   * });
   * ```
   */
  static create(
    rows?: number,
    columns?: number,
    formatting?: TableFormatting
  ): Table {
    return new Table(rows, columns, formatting);
  }

  /**
   * Merges cells into a single cell (uses columnSpan and rowSpan)
   * @param startRow - Starting row index (0-based)
   * @param startCol - Starting column index (0-based)
   * @param endRow - Ending row index (0-based, inclusive)
   * @param endCol - Ending column index (0-based, inclusive)
   * @returns This table for chaining
   * @example
   * ```typescript
   * table.mergeCells(0, 0, 0, 2);  // Merge cells across columns in first row
   * table.mergeCells(0, 0, 2, 0);  // Merge cells down rows in first column
   * ```
   */
  mergeCells(
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number
  ): this {
    // Validate bounds
    if (
      startRow < 0 ||
      endRow >= this.rows.length ||
      startCol < 0 ||
      endCol < 0
    ) {
      return this;
    }

    // Validate that end position is >= start position
    if (endRow < startRow || endCol < startCol) {
      return this;
    }

    const cell = this.getCell(startRow, startCol);
    if (!cell) {
      return this;
    }

    // Set column span if merging horizontally
    if (endCol > startCol) {
      cell.setColumnSpan(endCol - startCol + 1);
    }

    // Set vertical merge if merging vertically
    if (endRow > startRow) {
      // First cell starts the merge region
      cell.setVerticalMerge('restart');

      // Subsequent cells continue the merge
      for (let row = startRow + 1; row <= endRow; row++) {
        const mergeCell = this.getCell(row, startCol);
        if (mergeCell) {
          mergeCell.setVerticalMerge('continue');
          // If also merging horizontally, set column span on all merged cells
          if (endCol > startCol) {
            mergeCell.setColumnSpan(endCol - startCol + 1);
          }
        }
      }
    }

    return this;
  }

  /**
   * Splits a cell (removes column/row span)
   * @param row - Row index (0-based)
   * @param col - Column index (0-based)
   * @returns This table for chaining
   * @example
   * ```typescript
   * table.splitCell(0, 0);  // Remove any spanning from cell
   * ```
   */
  splitCell(row: number, col: number): this {
    const cell = this.getCell(row, col);
    if (cell) {
      cell.setColumnSpan(1); // Reset to single cell
    }
    return this;
  }

  /**
   * Moves cell contents from one position to another
   * @param fromRow - Source row index
   * @param fromCol - Source column index
   * @param toRow - Target row index
   * @param toCol - Target column index
   * @returns This table for chaining
   * @example
   * ```typescript
   * table.moveCell(0, 0, 1, 1);  // Move cell from [0,0] to [1,1]
   * ```
   */
  moveCell(
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ): this {
    const fromCell = this.getCell(fromRow, fromCol);
    const toCell = this.getCell(toRow, toCol);

    if (!fromCell || !toCell) {
      return this;
    }

    // Copy all paragraphs from source to target
    const paragraphs = fromCell.getParagraphs();
    for (const para of paragraphs) {
      toCell.addParagraph(para);
    }

    // Copy formatting
    const formatting = fromCell.getFormatting();
    if (formatting.shading) toCell.setShading(formatting.shading);
    if (formatting.borders) toCell.setBorders(formatting.borders);
    if (formatting.width) toCell.setWidth(formatting.width);
    if (formatting.verticalAlignment)
      toCell.setVerticalAlignment(formatting.verticalAlignment);

    // Clear source cell (replace with empty paragraph)
    const row = this.getRow(fromRow);
    if (row) {
      const cells = row.getCells();
      cells[fromCol] = new TableCell();
    }

    return this;
  }

  /**
   * Swaps contents of two cells
   * @param row1 - First cell row index
   * @param col1 - First cell column index
   * @param row2 - Second cell row index
   * @param col2 - Second cell column index
   * @returns This table for chaining
   * @example
   * ```typescript
   * table.swapCells(0, 0, 1, 1);  // Swap cells at [0,0] and [1,1]
   * ```
   */
  swapCells(row1: number, col1: number, row2: number, col2: number): this {
    const row1Obj = this.getRow(row1);
    const row2Obj = this.getRow(row2);

    if (!row1Obj || !row2Obj) {
      return this;
    }

    const cells1 = row1Obj.getCells();
    const cells2 = row2Obj.getCells();

    if (col1 >= cells1.length || col2 >= cells2.length) {
      return this;
    }

    // Swap cells
    const temp = cells1[col1];
    cells1[col1] = cells2[col2]!;
    cells2[col2] = temp!;

    return this;
  }

  /**
   * Sets the width of a specific column
   *
   * Defines the width for a single column without affecting others.
   *
   * @param columnIndex - The column index (0-based)
   * @param width - Width in twips (1/20th of a point)
   * @returns This table instance for method chaining
   *
   * @example
   * ```typescript
   * table.setColumnWidth(0, 2880);  // First column = 2 inches
   * table.setColumnWidth(1, 1440);  // Second column = 1 inch
   * ```
   */
  setColumnWidth(columnIndex: number, width: number): this {
    const columnWidths = (this.formatting as any).columnWidths || [];
    columnWidths[columnIndex] = width;
    (this.formatting as any).columnWidths = columnWidths;
    return this;
  }

  /**
   * Inserts multiple rows at once
   * @param startIndex - Position to insert at (0-based)
   * @param count - Number of rows to insert
   * @returns Array of inserted rows
   * @example
   * ```typescript
   * const rows = table.insertRows(2, 3);  // Insert 3 rows at position 2
   * ```
   */
  insertRows(startIndex: number, count: number): TableRow[] {
    const insertedRows: TableRow[] = [];
    const columnCount = this.getColumnCount();

    for (let i = 0; i < count; i++) {
      const row = new TableRow(columnCount);
      this.insertRow(startIndex + i, row);
      insertedRows.push(row);
    }

    return insertedRows;
  }

  /**
   * Removes multiple rows at once
   * @param startIndex - Starting position (0-based)
   * @param count - Number of rows to remove
   * @returns True if rows were removed
   * @example
   * ```typescript
   * table.removeRows(2, 3);  // Remove 3 rows starting at position 2
   * ```
   */
  removeRows(startIndex: number, count: number): boolean {
    if (startIndex < 0 || startIndex >= this.rows.length || count <= 0) {
      return false;
    }

    const actualCount = Math.min(count, this.rows.length - startIndex);
    this.rows.splice(startIndex, actualCount);
    return actualCount > 0;
  }

  /**
   * Sorts table rows by the content of a specified column
   *
   * Sorts all rows based on the text content of cells in the given column.
   * By default, excludes the first row (header row) from sorting.
   *
   * @param columnIndex - Column to sort by (0-based)
   * @param options - Sort options
   * @param options.ascending - Sort ascending (default: true)
   * @param options.numeric - Treat values as numbers (default: false, string sort)
   * @param options.skipHeaderRow - Skip first row from sorting (default: true)
   * @returns This table for chaining
   *
   * @example
   * ```typescript
   * // Sort by first column alphabetically
   * table.sortRows(0);
   *
   * // Sort by third column numerically, descending
   * table.sortRows(2, { numeric: true, ascending: false });
   *
   * // Sort all rows including header
   * table.sortRows(0, { skipHeaderRow: false });
   * ```
   */
  sortRows(
    columnIndex: number,
    options?: {
      ascending?: boolean;
      numeric?: boolean;
      skipHeaderRow?: boolean;
    }
  ): this {
    const ascending = options?.ascending ?? true;
    const numeric = options?.numeric ?? false;
    const skipHeaderRow = options?.skipHeaderRow ?? true;

    if (this.rows.length <= 1) {
      return this; // Nothing to sort
    }

    // Determine which rows to sort
    const headerRow = skipHeaderRow ? this.rows.shift() : null;
    const rowsToSort = [...this.rows];

    // Sort the rows
    rowsToSort.sort((a, b) => {
      const cellA = a.getCell(columnIndex);
      const cellB = b.getCell(columnIndex);

      const textA = cellA?.getText().trim() || '';
      const textB = cellB?.getText().trim() || '';

      let comparison: number;
      if (numeric) {
        const numA = Number.parseFloat(textA) || 0;
        const numB = Number.parseFloat(textB) || 0;
        comparison = numA - numB;
      } else {
        comparison = textA.localeCompare(textB);
      }

      return ascending ? comparison : -comparison;
    });

    // Reconstruct rows array
    this.rows = headerRow ? [headerRow, ...rowsToSort] : rowsToSort;

    return this;
  }

  /**
   * Creates a deep clone of this table
   *
   * Creates a new Table with copies of all rows, cells, content, and formatting.
   * The clone is completely independent of the original.
   *
   * @returns New Table instance with the same structure and content
   *
   * @example
   * ```typescript
   * const original = new Table(2, 3);
   * original.getCell(0, 0)?.addParagraph(new Paragraph().addText('Data'));
   *
   * const copy = original.clone();
   * copy.getCell(0, 0)?.addParagraph(new Paragraph().addText(' - Modified'));
   * // Original table unchanged
   * ```
   */
  clone(): Table {
    // Clone formatting
    const clonedFormatting: TableFormatting = deepClone(this.formatting);

    // Create new table with same structure
    const clonedTable = new Table(0, 0, clonedFormatting);

    // Clone all rows
    for (const row of this.rows) {
      // Clone row by creating new cells with same content
      const cells = row.getCells();
      const clonedRow = new TableRow(0);

      for (const cell of cells) {
        const cellFormatting = cell.getFormatting();
        const clonedCell = new TableCell(deepClone(cellFormatting));

        // Clone paragraphs in cell
        for (const para of cell.getParagraphs()) {
          clonedCell.addParagraph(para.clone());
        }

        clonedRow.addCell(clonedCell);
      }

      clonedTable.addRow(clonedRow);
    }

    return clonedTable;
  }
}
