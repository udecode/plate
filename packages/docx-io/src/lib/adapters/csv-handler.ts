/**
 * CSV Handler - CSV data to DOCX table conversion
 *
 * This module provides utilities for converting CSV-imported data to DOCX tables.
 * It bridges the gap between Plate's CSV plugin and the table-handler module.
 *
 * CSV data imported into Plate becomes table elements, which this handler
 * processes by delegating to the table-handler for actual DOCX conversion.
 *
 * @module csv-handler
 */

import type { Table } from '../docXMLater/src';
import {
  createSimpleTable,
  processHtmlTable,
  type TableConversionOptions,
} from './table-handler';
import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for CSV to table conversion
 */
export interface CSVConversionOptions extends TableConversionOptions {
  /** Whether the first row is a header row (default: false) */
  hasHeaders?: boolean;
  /** Column separator character (default: ',') */
  delimiter?: string;
  /** Row separator (default: '\n') */
  rowDelimiter?: string;
  /** Whether to trim whitespace from cell values (default: true) */
  trimValues?: boolean;
  /** Text qualifier character for quoted values (default: '"') */
  textQualifier?: string;
}

/**
 * Parsed CSV data structure
 */
export interface ParsedCSVData {
  /** 2D array of cell values */
  rows: string[][];
  /** Number of columns (max across all rows) */
  columnCount: number;
  /** Number of rows */
  rowCount: number;
}

// ============================================================================
// CSV Parsing Utilities
// ============================================================================

/**
 * Parses a CSV string into a 2D array of cell values
 *
 * @param csv - CSV string to parse
 * @param options - Parsing options
 * @returns Parsed CSV data
 *
 * @example
 * ```typescript
 * const data = parseCSV('Name,Age,City\nJohn,30,NYC\nJane,25,LA');
 * // => { rows: [['Name', 'Age', 'City'], ['John', '30', 'NYC'], ['Jane', '25', 'LA']], columnCount: 3, rowCount: 3 }
 * ```
 */
export function parseCSV(
  csv: string,
  options: Pick<
    CSVConversionOptions,
    'delimiter' | 'rowDelimiter' | 'trimValues' | 'textQualifier'
  > = {}
): ParsedCSVData {
  const {
    delimiter = ',',
    rowDelimiter = '\n',
    trimValues = true,
    textQualifier = '"',
  } = options;

  const rows: string[][] = [];
  let maxColumns = 0;

  // Handle empty input
  if (!csv || csv.trim() === '') {
    return { rows: [], columnCount: 0, rowCount: 0 };
  }

  // Split into lines, handling both \n and \r\n
  const lines = csv.replace(/\r\n/g, '\n').split(rowDelimiter);

  for (const line of lines) {
    // Skip empty lines
    if (line.trim() === '') continue;

    const cells: string[] = [];
    let currentCell = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (inQuotes) {
        // Inside quoted value
        if (char === textQualifier) {
          if (nextChar === textQualifier) {
            // Escaped quote (doubled)
            currentCell += textQualifier;
            i += 2;
          } else {
            // End of quoted value
            inQuotes = false;
            i++;
          }
        } else {
          currentCell += char;
          i++;
        }
      } else {
        // Outside quoted value
        if (char === textQualifier && currentCell === '') {
          // Start of quoted value
          inQuotes = true;
          i++;
        } else if (char === delimiter) {
          // End of cell
          cells.push(trimValues ? currentCell.trim() : currentCell);
          currentCell = '';
          i++;
        } else {
          currentCell += char;
          i++;
        }
      }
    }

    // Add last cell
    cells.push(trimValues ? currentCell.trim() : currentCell);

    rows.push(cells);
    maxColumns = Math.max(maxColumns, cells.length);
  }

  // Normalize row lengths (pad shorter rows)
  for (const row of rows) {
    while (row.length < maxColumns) {
      row.push('');
    }
  }

  return {
    rows,
    columnCount: maxColumns,
    rowCount: rows.length,
  };
}

// ============================================================================
// CSV to Table Conversion
// ============================================================================

/**
 * Converts CSV string data to a DOCX Table
 *
 * @param csv - CSV string to convert
 * @param options - Conversion options
 * @returns DOCX Table
 *
 * @example
 * ```typescript
 * const table = csvToTable('Name,Age\nJohn,30\nJane,25', { hasHeaders: true });
 * document.addTable(table);
 * ```
 */
export function csvToTable(
  csv: string,
  options: CSVConversionOptions = {}
): Table {
  const { hasHeaders = false, ...tableOptions } = options;

  // Parse CSV data
  const parsed = parseCSV(csv, options);

  if (parsed.rowCount === 0) {
    // Return empty table with one row/cell
    return createSimpleTable([['']]);
  }

  // Use createSimpleTable from table-handler
  return createSimpleTable(parsed.rows, hasHeaders);
}

/**
 * Converts parsed CSV data to a DOCX Table
 *
 * @param data - Parsed CSV data
 * @param options - Conversion options
 * @returns DOCX Table
 */
export function csvDataToTable(
  data: ParsedCSVData,
  options: CSVConversionOptions = {}
): Table {
  const { hasHeaders = false } = options;

  if (data.rowCount === 0) {
    return createSimpleTable([['']]);
  }

  return createSimpleTable(data.rows, hasHeaders);
}

// ============================================================================
// Element Handler
// ============================================================================

/**
 * Handles table elements that originated from CSV import
 *
 * This handler detects tables created by Plate's CSV plugin and ensures
 * they are properly converted to DOCX tables. It works by delegating to
 * the standard table handler after applying any CSV-specific processing.
 *
 * Note: In Plate, CSV-imported data becomes standard table elements.
 * This handler checks for CSV-specific data attributes and applies
 * appropriate options before table conversion.
 *
 * @param element - The table element (from CSV import)
 * @param context - Conversion context
 * @param options - CSV conversion options
 * @returns Conversion result with Table
 */
export function handleCSVTable(
  element: Element,
  context: ConversionContext,
  options: CSVConversionOptions = {}
): ConversionResult {
  // Check for CSV-specific data attributes that Plate might add
  const hasHeaders =
    element.getAttribute('data-csv-headers') === 'true' ||
    element.querySelector('thead') !== null;

  // Merge options with detected settings
  const mergedOptions: TableConversionOptions = {
    ...options,
    autoDetectHeaders: hasHeaders,
  };

  // Delegate to processHtmlTable for actual conversion
  const table = processHtmlTable(element, context, mergedOptions);

  if (!table) {
    return {
      error: 'Failed to convert CSV table',
      processChildren: false,
    };
  }

  return {
    element: table,
    processChildren: false, // Table is fully processed
  };
}

/**
 * Checks if an element is a CSV-imported table
 *
 * Plate's CSV plugin may add data attributes or specific classes to
 * tables created from CSV data.
 *
 * @param element - Element to check
 * @returns True if element appears to be a CSV-imported table
 */
export function isCSVTable(element: Element): boolean {
  // Check for common CSV-related indicators
  if (element.tagName.toLowerCase() !== 'table') {
    return false;
  }

  // Check for Plate-specific data attributes
  if (element.hasAttribute('data-csv-import')) {
    return true;
  }

  // Check for CSV-related class names
  const className = element.className || '';
  if (className.includes('csv') || className.includes('spreadsheet')) {
    return true;
  }

  return false;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extracts CSV data from a table element
 *
 * This reverses the import process - useful for round-tripping or
 * when you need the raw data from an imported CSV table.
 *
 * @param tableElement - Table element to extract data from
 * @returns 2D array of cell values
 */
export function extractCSVDataFromTable(tableElement: Element): string[][] {
  const rows: string[][] = [];

  const rowElements = tableElement.querySelectorAll('tr');
  rowElements.forEach((rowEl) => {
    const cells: string[] = [];
    const cellElements = rowEl.querySelectorAll('td, th');
    cellElements.forEach((cellEl) => {
      cells.push(cellEl.textContent?.trim() || '');
    });
    if (cells.length > 0) {
      rows.push(cells);
    }
  });

  return rows;
}

/**
 * Converts a table element to CSV string
 *
 * @param tableElement - Table element to convert
 * @param options - Conversion options
 * @returns CSV string
 */
export function tableToCSV(
  tableElement: Element,
  options: Pick<
    CSVConversionOptions,
    'delimiter' | 'rowDelimiter' | 'textQualifier'
  > = {}
): string {
  const { delimiter = ',', rowDelimiter = '\n', textQualifier = '"' } = options;

  const data = extractCSVDataFromTable(tableElement);

  return data
    .map((row) =>
      row
        .map((cell) => {
          // Quote cells that contain delimiter, quotes, or newlines
          if (
            cell.includes(delimiter) ||
            cell.includes(textQualifier) ||
            cell.includes('\n')
          ) {
            return (
              textQualifier +
              cell.replace(
                new RegExp(textQualifier, 'g'),
                textQualifier + textQualifier
              ) +
              textQualifier
            );
          }
          return cell;
        })
        .join(delimiter)
    )
    .join(rowDelimiter);
}
