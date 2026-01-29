/**
 * Tests for Table Property Exceptions (tblPrEx)
 * Per ECMA-376 Part 1 §17.4.61
 *
 * Tests row-level overrides of table properties including:
 * - Borders
 * - Shading
 * - Cell spacing
 * - Width
 * - Indentation
 * - Justification
 */

import { Document } from '../../src/core/Document';
import { Table } from '../../src/elements/Table';
import path from 'path';
import fs from 'fs';

const OUTPUT_DIR = path.join(__dirname, '../output');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

describe('Table Property Exceptions (tblPrEx)', () => {
  describe('Border Exceptions', () => {
    test('should set border exceptions for a single row', async () => {
      const doc = Document.create();
      const table = new Table(3, 2);

      // First row with red borders
      table.getRow(0)!.setTablePropertyExceptions({
        borders: {
          top: { style: 'single', size: 8, color: 'FF0000' },
          bottom: { style: 'single', size: 8, color: 'FF0000' },
          left: { style: 'single', size: 8, color: 'FF0000' },
          right: { style: 'single', size: 8, color: 'FF0000' }
        }
      });
      table.getRow(0)!.getCell(0)!.createParagraph('Red borders');

      // Normal rows
      table.getRow(1)!.getCell(0)!.createParagraph('Normal row 1');
      table.getRow(2)!.getCell(0)!.createParagraph('Normal row 2');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-tblPrEx-borders.docx');
      await doc.save(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;
      const exceptions = loadedTable.getRow(0)!.getTablePropertyExceptions();

      expect(exceptions).toBeDefined();
      expect(exceptions!.borders).toBeDefined();
      expect(exceptions!.borders!.top).toBeDefined();
      expect(exceptions!.borders!.top!.color).toBe('FF0000');
    });

    test('should override different border styles per row', async () => {
      const doc = Document.create();
      const table = new Table(3, 2);

      // Row 0: Single borders
      table.getRow(0)!.setTablePropertyExceptions({
        borders: {
          top: { style: 'single', size: 8, color: '000000' },
          bottom: { style: 'single', size: 8, color: '000000' }
        }
      });
      table.getRow(0)!.getCell(0)!.createParagraph('Single borders');

      // Row 1: Double borders
      table.getRow(1)!.setTablePropertyExceptions({
        borders: {
          top: { style: 'double', size: 12, color: '0000FF' },
          bottom: { style: 'double', size: 12, color: '0000FF' }
        }
      });
      table.getRow(1)!.getCell(0)!.createParagraph('Double borders');

      // Row 2: Dashed borders
      table.getRow(2)!.setTablePropertyExceptions({
        borders: {
          top: { style: 'dashed', size: 6, color: '00FF00' },
          bottom: { style: 'dashed', size: 6, color: '00FF00' }
        }
      });
      table.getRow(2)!.getCell(0)!.createParagraph('Dashed borders');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-tblPrEx-border-styles.docx');
      await doc.save(outputPath);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;

      const ex0 = loadedTable.getRow(0)!.getTablePropertyExceptions();
      expect(ex0!.borders!.top!.style).toBe('single');

      const ex1 = loadedTable.getRow(1)!.getTablePropertyExceptions();
      expect(ex1!.borders!.top!.style).toBe('double');

      const ex2 = loadedTable.getRow(2)!.getTablePropertyExceptions();
      expect(ex2!.borders!.top!.style).toBe('dashed');
    });
  });

  describe('Shading Exceptions', () => {
    test('should set shading exception for a row', async () => {
      const doc = Document.create();
      const table = new Table(3, 2);

      // Row with yellow shading
      table.getRow(1)!.setTablePropertyExceptions({
        shading: {
          fill: 'FFFF00',
          pattern: 'clear'
        }
      });
      table.getRow(1)!.getCell(0)!.createParagraph('Yellow background');

      // Normal rows
      table.getRow(0)!.getCell(0)!.createParagraph('Normal row');
      table.getRow(2)!.getCell(0)!.createParagraph('Normal row');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-tblPrEx-shading.docx');
      await doc.save(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;
      const exceptions = loadedTable.getRow(1)!.getTablePropertyExceptions();

      expect(exceptions).toBeDefined();
      expect(exceptions!.shading).toBeDefined();
      expect(exceptions!.shading!.fill).toBe('FFFF00');
      expect(exceptions!.shading!.pattern).toBe('clear');
    });

    test('should preserve different shading colors per row', async () => {
      const doc = Document.create();
      const table = new Table(4, 2);

      // Different colors for each row
      const colors = [
        { fill: 'FFE6E6', name: 'Light Red' },
        { fill: 'E6F2FF', name: 'Light Blue' },
        { fill: 'E6FFE6', name: 'Light Green' },
        { fill: 'FFF9E6', name: 'Light Yellow' }
      ];

      colors.forEach((color, i) => {
        table.getRow(i)!.setTablePropertyExceptions({
          shading: { fill: color.fill, pattern: 'clear' }
        });
        table.getRow(i)!.getCell(0)!.createParagraph(color.name);
      });

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-tblPrEx-shading-colors.docx');
      await doc.save(outputPath);

      // Load and verify all colors
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;

      colors.forEach((color, i) => {
        const ex = loadedTable.getRow(i)!.getTablePropertyExceptions();
        expect(ex!.shading!.fill).toBe(color.fill);
      });
    });
  });

  describe('Combined Exceptions', () => {
    test('should set borders and shading together', async () => {
      const doc = Document.create();
      const table = new Table(2, 2);

      // Row with both borders and shading
      table.getRow(0)!.setTablePropertyExceptions({
        borders: {
          top: { style: 'double', size: 12, color: 'FF0000' },
          bottom: { style: 'double', size: 12, color: 'FF0000' }
        },
        shading: {
          fill: 'FFFFCC',
          pattern: 'clear'
        }
      });
      table.getRow(0)!.getCell(0)!.createParagraph('Borders + Shading');

      // Normal row
      table.getRow(1)!.getCell(0)!.createParagraph('Normal row');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-tblPrEx-combined.docx');
      await doc.save(outputPath);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;
      const exceptions = loadedTable.getRow(0)!.getTablePropertyExceptions();

      expect(exceptions).toBeDefined();
      expect(exceptions!.borders).toBeDefined();
      expect(exceptions!.shading).toBeDefined();
      expect(exceptions!.borders!.top!.style).toBe('double');
      expect(exceptions!.shading!.fill).toBe('FFFFCC');
    });

    test('should set all property types together', async () => {
      const doc = Document.create();
      const table = new Table(2, 2);

      // Row with all exceptions
      table.getRow(0)!.setTablePropertyExceptions({
        borders: {
          top: { style: 'single', size: 8, color: '000000' }
        },
        shading: { fill: 'E6E6E6', pattern: 'clear' },
        cellSpacing: 50,
        width: 7200,
        indentation: 144,
        justification: 'center'
      });
      table.getRow(0)!.getCell(0)!.createParagraph('All exceptions');

      // Normal row
      table.getRow(1)!.getCell(0)!.createParagraph('Normal row');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-tblPrEx-all-properties.docx');
      await doc.save(outputPath);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;
      const exceptions = loadedTable.getRow(0)!.getTablePropertyExceptions();

      expect(exceptions).toBeDefined();
      expect(exceptions!.borders).toBeDefined();
      expect(exceptions!.shading).toBeDefined();
      expect(exceptions!.cellSpacing).toBe(50);
      expect(exceptions!.width).toBe(7200);
      expect(exceptions!.indentation).toBe(144);
      expect(exceptions!.justification).toBe('center');
    });
  });

  describe('Cell Spacing Exception', () => {
    test('should override cell spacing for specific row', async () => {
      const doc = Document.create();
      const table = new Table(3, 2);

      // Middle row with extra cell spacing
      table.getRow(1)!.setTablePropertyExceptions({
        cellSpacing: 100 // Extra spacing
      });
      table.getRow(1)!.getCell(0)!.createParagraph('Extra spacing');

      table.getRow(0)!.getCell(0)!.createParagraph('Normal');
      table.getRow(2)!.getCell(0)!.createParagraph('Normal');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-tblPrEx-cell-spacing.docx');
      await doc.save(outputPath);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;
      const exceptions = loadedTable.getRow(1)!.getTablePropertyExceptions();

      expect(exceptions).toBeDefined();
      expect(exceptions!.cellSpacing).toBe(100);
    });
  });

  describe('Width and Indentation Exceptions', () => {
    test('should override width for specific row', async () => {
      const doc = Document.create();
      const table = new Table(2, 2);

      // First row narrower
      table.getRow(0)!.setTablePropertyExceptions({
        width: 5000, // Narrower width
        indentation: 500 // Indented
      });
      table.getRow(0)!.getCell(0)!.createParagraph('Narrow & indented');

      table.getRow(1)!.getCell(0)!.createParagraph('Normal width');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-tblPrEx-width-indent.docx');
      await doc.save(outputPath);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;
      const exceptions = loadedTable.getRow(0)!.getTablePropertyExceptions();

      expect(exceptions).toBeDefined();
      expect(exceptions!.width).toBe(5000);
      expect(exceptions!.indentation).toBe(500);
    });
  });

  describe('Justification Exception', () => {
    test('should override justification for specific rows', async () => {
      const doc = Document.create();
      const table = new Table(3, 2);

      // Different justifications
      table.getRow(0)!.setTablePropertyExceptions({
        justification: 'left'
      });
      table.getRow(0)!.getCell(0)!.createParagraph('Left justified');

      table.getRow(1)!.setTablePropertyExceptions({
        justification: 'center'
      });
      table.getRow(1)!.getCell(0)!.createParagraph('Center justified');

      table.getRow(2)!.setTablePropertyExceptions({
        justification: 'right'
      });
      table.getRow(2)!.getCell(0)!.createParagraph('Right justified');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-tblPrEx-justification.docx');
      await doc.save(outputPath);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;

      expect(loadedTable.getRow(0)!.getTablePropertyExceptions()!.justification).toBe('left');
      expect(loadedTable.getRow(1)!.getTablePropertyExceptions()!.justification).toBe('center');
      expect(loadedTable.getRow(2)!.getTablePropertyExceptions()!.justification).toBe('right');
    });
  });

  describe('Round-Trip Preservation', () => {
    test('should preserve exceptions through multiple save-load cycles', async () => {
      const doc = Document.create();
      const table = new Table(2, 2);

      table.getRow(0)!.setTablePropertyExceptions({
        borders: {
          top: { style: 'double', size: 12, color: 'FF0000' }
        },
        shading: { fill: 'FFFF00', pattern: 'clear' },
        cellSpacing: 75
      });
      table.getRow(0)!.getCell(0)!.createParagraph('Test row');

      doc.addTable(table);

      // Cycle 1
      const path1 = path.join(OUTPUT_DIR, 'test-tblPrEx-roundtrip1.docx');
      await doc.save(path1);

      const doc2 = await Document.load(path1);

      // Cycle 2
      const path2 = path.join(OUTPUT_DIR, 'test-tblPrEx-roundtrip2.docx');
      await doc2.save(path2);

      const doc3 = await Document.load(path2);

      // Verify after 2 cycles
      const exceptions = doc3.getTables()[0]!.getRow(0)!.getTablePropertyExceptions();
      expect(exceptions).toBeDefined();
      expect(exceptions!.borders!.top!.style).toBe('double');
      expect(exceptions!.shading!.fill).toBe('FFFF00');
      expect(exceptions!.cellSpacing).toBe(75);
    });
  });

  describe('Edge Cases', () => {
    test('should handle row without exceptions', async () => {
      const doc = Document.create();
      const table = new Table(1, 2);

      table.getRow(0)!.getCell(0)!.createParagraph('No exceptions');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-tblPrEx-none.docx');
      await doc.save(outputPath);

      const loadedDoc = await Document.load(outputPath);
      const exceptions = loadedDoc.getTables()[0]!.getRow(0)!.getTablePropertyExceptions();

      expect(exceptions).toBeUndefined();
    });

    test('should handle empty exceptions object', async () => {
      const doc = Document.create();
      const table = new Table(1, 2);

      // Set empty exceptions (should not serialize)
      table.getRow(0)!.setTablePropertyExceptions({});
      table.getRow(0)!.getCell(0)!.createParagraph('Empty exceptions');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-tblPrEx-empty.docx');
      await doc.save(outputPath);

      const loadedDoc = await Document.load(outputPath);
      const exceptions = loadedDoc.getTables()[0]!.getRow(0)!.getTablePropertyExceptions();

      // Empty exceptions should not be preserved
      expect(exceptions).toBeUndefined();
    });
  });
});
