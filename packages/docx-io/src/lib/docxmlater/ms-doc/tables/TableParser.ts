/**
 * Table Parser
 *
 * Parses table structures from MS-DOC files.
 * Tables are identified by special characters (cell mark 0x07) and
 * table properties are stored in TAP (Table Properties) structures.
 *
 * References:
 * - [MS-DOC] 2.6.2 Table Structure
 * - [MS-DOC] 2.9.328 Tap
 * - [MS-DOC] 2.9.323 TableBordersOperand80
 */

import { SPECIAL_CHARS } from '../types/Constants';
import { TableDefinition, TableRowDefinition, TableCellDefinition, TableProperties } from '../types/DocTypes';

/**
 * Error thrown when table parsing fails
 */
export class TableParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TableParseError';
  }
}

/**
 * Table row information extracted from text
 */
interface TableRowInfo {
  /** Start CP of row */
  cpStart: number;
  /** End CP of row */
  cpEnd: number;
  /** Cell contents */
  cells: string[];
  /** Is this a header row */
  isHeader: boolean;
}

/**
 * Table boundary in the document
 */
export interface TableBoundary {
  /** Start character position */
  cpStart: number;
  /** End character position */
  cpEnd: number;
  /** Number of rows */
  rowCount: number;
  /** Maximum columns in any row */
  maxColumns: number;
}

/**
 * Parse tables from document text
 */
export class TableParser {
  private text: string;
  private paragraphs: string[];

  constructor(documentText: string) {
    this.text = documentText;
    // Split by paragraph marks
    this.paragraphs = documentText.split(/[\r\n\x0D]/);
  }

  /**
   * Find all tables in the document
   */
  findTables(): TableBoundary[] {
    const tables: TableBoundary[] = [];
    const cellMark = String.fromCharCode(SPECIAL_CHARS.CELL);

    let currentTable: TableBoundary | null = null;
    let cpPosition = 0;

    for (const para of this.paragraphs) {
      const hasCell = para.includes(cellMark);

      if (hasCell) {
        // This is a table row
        const cellCount = (para.match(new RegExp(cellMark, 'g')) ?? []).length;

        if (!currentTable) {
          // Start new table
          currentTable = {
            cpStart: cpPosition,
            cpEnd: cpPosition + para.length,
            rowCount: 1,
            maxColumns: cellCount,
          };
        } else {
          // Continue table
          currentTable.cpEnd = cpPosition + para.length;
          currentTable.rowCount++;
          currentTable.maxColumns = Math.max(currentTable.maxColumns, cellCount);
        }
      } else if (currentTable) {
        // End of table
        tables.push(currentTable);
        currentTable = null;
      }

      cpPosition += para.length + 1; // +1 for paragraph mark
    }

    // Handle table at end of document
    if (currentTable) {
      tables.push(currentTable);
    }

    return tables;
  }

  /**
   * Parse a table at the given boundaries
   */
  parseTable(boundary: TableBoundary): TableDefinition {
    const cellMark = String.fromCharCode(SPECIAL_CHARS.CELL);
    const rows: TableRowDefinition[] = [];

    let cpPosition = 0;
    let rowIndex = 0;

    for (const para of this.paragraphs) {
      // Check if this paragraph is within our table boundary
      if (cpPosition >= boundary.cpStart && cpPosition <= boundary.cpEnd) {
        if (para.includes(cellMark)) {
          // Parse cells from this row
          const cellTexts = para.split(cellMark).filter((_, idx, arr) => idx < arr.length - 1);
          const cells: TableCellDefinition[] = cellTexts.map((text, colIndex) => ({
            text: text.trim(),
            rowIndex,
            colIndex,
            rowSpan: 1,
            colSpan: 1,
          }));

          rows.push({
            index: rowIndex,
            cells,
            isHeader: rowIndex === 0, // First row is typically header
          });
          rowIndex++;
        }
      }

      if (cpPosition > boundary.cpEnd) {
        break;
      }

      cpPosition += para.length + 1;
    }

    return {
      rows,
      rowCount: rows.length,
      columnCount: boundary.maxColumns,
      cpStart: boundary.cpStart,
      cpEnd: boundary.cpEnd,
    };
  }

  /**
   * Parse all tables in the document
   */
  parseAllTables(): TableDefinition[] {
    const boundaries = this.findTables();
    return boundaries.map((b) => this.parseTable(b));
  }

  /**
   * Check if text contains table content
   */
  static hasTableContent(text: string): boolean {
    const cellMark = String.fromCharCode(SPECIAL_CHARS.CELL);
    return text.includes(cellMark);
  }

  /**
   * Extract table rows from text segment
   */
  static extractRows(text: string): string[][] {
    const cellMark = String.fromCharCode(SPECIAL_CHARS.CELL);
    const paragraphs = text.split(/[\r\n\x0D]/);
    const rows: string[][] = [];

    for (const para of paragraphs) {
      if (para.includes(cellMark)) {
        const cells = para.split(cellMark).filter((_, idx, arr) => idx < arr.length - 1);
        rows.push(cells.map((c) => c.trim()));
      }
    }

    return rows;
  }
}

/**
 * TAP (Table Properties) Parser
 *
 * Parses table property structures from PAPX data.
 * TAP contains properties like row height, cell widths, borders, etc.
 */
export class TAPParser {
  private data: Uint8Array;
  private view: DataView;

  constructor(tapData: Uint8Array) {
    this.data = tapData;
    this.view = new DataView(this.data.buffer, this.data.byteOffset, this.data.byteLength);
  }

  /**
   * Parse table properties
   */
  parse(): TableProperties {
    const props: TableProperties = {};

    if (this.data.length < 4) {
      return props;
    }

    // TAP structure is complex and varies by Word version
    // Basic parsing of common properties

    let offset = 0;

    // jc - Table justification (0=left, 1=center, 2=right)
    if (offset + 2 <= this.data.length) {
      const jc = this.view.getInt16(offset, true);
      switch (jc) {
        case 0:
          props.alignment = 'left';
          break;
        case 1:
          props.alignment = 'center';
          break;
        case 2:
          props.alignment = 'right';
          break;
      }
      offset += 2;
    }

    // dxaGapHalf - Half of the horizontal gap between cells (twips)
    if (offset + 2 <= this.data.length) {
      props.cellSpacing = this.view.getInt16(offset, true);
      offset += 2;
    }

    // dyaRowHeight - Row height (twips, negative = minimum height)
    if (offset + 2 <= this.data.length) {
      const height = this.view.getInt16(offset, true);
      props.rowHeight = Math.abs(height);
      props.rowHeightRule = height < 0 ? 'atLeast' : 'exact';
      offset += 2;
    }

    return props;
  }

  /**
   * Parse cell widths from TAP
   */
  parseCellWidths(cellCount: number): number[] {
    const widths: number[] = [];

    // Cell widths are stored as an array of shorts
    // Located after the basic TAP header (varies by version)
    const widthsOffset = 24; // Approximate offset

    if (widthsOffset + cellCount * 2 > this.data.length) {
      return widths;
    }

    for (let i = 0; i < cellCount; i++) {
      const width = this.view.getInt16(widthsOffset + i * 2, true);
      widths.push(width);
    }

    return widths;
  }

  /**
   * Check if this is a table row PAPX
   */
  static isTableRow(papxData: Uint8Array): boolean {
    // Table rows have specific SPRM codes
    // sprmPFInTable (0x2416) sets fInTable flag
    const view = new DataView(papxData.buffer, papxData.byteOffset, papxData.byteLength);

    for (let i = 0; i < papxData.length - 2; i++) {
      const sprm = view.getUint16(i, true);
      if (sprm === 0x2416) {
        // Found fInTable
        return true;
      }
    }

    return false;
  }
}
