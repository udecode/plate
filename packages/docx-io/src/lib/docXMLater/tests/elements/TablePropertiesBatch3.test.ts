/**
 * Tests for Phase 4.3 Batch 3 - Table Row Properties Part 1
 * Tests row-level properties: justification, hidden, gridBefore, gridAfter
 * Plus verification of existing properties: cantSplit, isHeader, trHeight
 */

import { Document } from '../../src/core/Document';
import { Table } from '../../src/elements/Table';
import path from 'path';
import fs from 'fs';

const OUTPUT_DIR = path.join(__dirname, '../output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

describe('Phase 4.3 Batch 3 - Table Row Properties Part 1', () => {
  describe('Row Justification (w:jc)', () => {
    test('should set row justification to center', async () => {
      const doc = Document.create();
      const table = new Table(2, 2);

      // Set row justification
      table.getRow(0)!.setJustification('center');
      table.getRow(0)!.getCell(0)!.createParagraph('Centered Row');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-row-jc-center.docx');
      await doc.save(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;
      const loadedRow = loadedTable.getRow(0)!;
      const formatting = loadedRow.getFormatting();

      expect(formatting.justification).toBe('center');
    });

    test('should set row justification to right', async () => {
      const doc = Document.create();
      const table = new Table(2, 2);

      // Set row justification
      table.getRow(0)!.setJustification('right');
      table.getRow(0)!.getCell(0)!.createParagraph('Right-aligned Row');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-row-jc-right.docx');
      await doc.save(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;
      const loadedRow = loadedTable.getRow(0)!;
      const formatting = loadedRow.getFormatting();

      expect(formatting.justification).toBe('right');
    });

    test('should preserve multiple row justifications in round-trip', async () => {
      const doc = Document.create();
      const table = new Table(3, 2);

      // Different justifications for each row
      table
        .getRow(0)!
        .setJustification('left')
        .getCell(0)!
        .createParagraph('Left');
      table
        .getRow(1)!
        .setJustification('center')
        .getCell(0)!
        .createParagraph('Center');
      table
        .getRow(2)!
        .setJustification('right')
        .getCell(0)!
        .createParagraph('Right');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-row-jc-mixed.docx');
      await doc.save(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;

      expect(loadedTable.getRow(0)!.getFormatting().justification).toBe('left');
      expect(loadedTable.getRow(1)!.getFormatting().justification).toBe(
        'center'
      );
      expect(loadedTable.getRow(2)!.getFormatting().justification).toBe(
        'right'
      );
    });
  });

  describe('Hidden Row (w:hidden)', () => {
    test('should set row as hidden', async () => {
      const doc = Document.create();
      const table = new Table(3, 2);

      // Hide middle row
      table.getRow(0)!.getCell(0)!.createParagraph('Visible Row 1');
      table
        .getRow(1)!
        .setHidden(true)
        .getCell(0)!
        .createParagraph('Hidden Row');
      table.getRow(2)!.getCell(0)!.createParagraph('Visible Row 2');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-row-hidden.docx');
      await doc.save(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;

      expect(loadedTable.getRow(0)!.getFormatting().hidden).toBeUndefined();
      expect(loadedTable.getRow(1)!.getFormatting().hidden).toBe(true);
      expect(loadedTable.getRow(2)!.getFormatting().hidden).toBeUndefined();
    });

    test('should preserve hidden flag in round-trip', async () => {
      const doc = Document.create();
      const table = new Table(2, 2);

      table.getRow(0)!.setHidden(true).getCell(0)!.createParagraph('Hidden');

      doc.addTable(table);

      const outputPath = path.join(
        OUTPUT_DIR,
        'test-row-hidden-roundtrip.docx'
      );
      await doc.save(outputPath);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;
      expect(loadedTable.getRow(0)!.getFormatting().hidden).toBe(true);
    });
  });

  describe('Grid Before (w:gridBefore)', () => {
    test('should set gridBefore to skip columns', async () => {
      const doc = Document.create();
      const table = new Table(2, 3);

      // First row skips 1 column before first cell
      table.getRow(0)!.setGridBefore(1);
      table.getRow(0)!.getCell(0)!.createParagraph('Indented Cell');

      // Normal row
      table.getRow(1)!.getCell(0)!.createParagraph('Cell 1');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-row-gridBefore.docx');
      await doc.save(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;

      expect(loadedTable.getRow(0)!.getFormatting().gridBefore).toBe(1);
      expect(loadedTable.getRow(1)!.getFormatting().gridBefore).toBeUndefined();
    });

    test('should preserve gridBefore in round-trip', async () => {
      const doc = Document.create();
      const table = new Table(1, 3);

      table.getRow(0)!.setGridBefore(2).getCell(0)!.createParagraph('Indented');

      doc.addTable(table);

      const outputPath = path.join(
        OUTPUT_DIR,
        'test-row-gridBefore-roundtrip.docx'
      );
      await doc.save(outputPath);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;
      expect(loadedTable.getRow(0)!.getFormatting().gridBefore).toBe(2);
    });
  });

  describe('Grid After (w:gridAfter)', () => {
    test('should set gridAfter to leave columns', async () => {
      const doc = Document.create();
      const table = new Table(2, 3);

      // First row leaves 1 column after last cell
      table.getRow(0)!.setGridAfter(1);
      table.getRow(0)!.getCell(0)!.createParagraph('Short Row');

      // Normal row
      table.getRow(1)!.getCell(0)!.createParagraph('Cell 1');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-row-gridAfter.docx');
      await doc.save(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;

      expect(loadedTable.getRow(0)!.getFormatting().gridAfter).toBe(1);
      expect(loadedTable.getRow(1)!.getFormatting().gridAfter).toBeUndefined();
    });

    test('should preserve gridAfter in round-trip', async () => {
      const doc = Document.create();
      const table = new Table(1, 3);

      table.getRow(0)!.setGridAfter(2).getCell(0)!.createParagraph('Short');

      doc.addTable(table);

      const outputPath = path.join(
        OUTPUT_DIR,
        'test-row-gridAfter-roundtrip.docx'
      );
      await doc.save(outputPath);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;
      expect(loadedTable.getRow(0)!.getFormatting().gridAfter).toBe(2);
    });
  });

  describe('Grid Before + Grid After Combined', () => {
    test('should handle both gridBefore and gridAfter', async () => {
      const doc = Document.create();
      const table = new Table(2, 5);

      // Row with both gridBefore and gridAfter
      table.getRow(0)!.setGridBefore(1).setGridAfter(1);
      table.getRow(0)!.getCell(0)!.createParagraph('Centered Row');

      // Normal row
      table.getRow(1)!.getCell(0)!.createParagraph('Cell 1');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-row-gridBoth.docx');
      await doc.save(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;
      const row0 = loadedTable.getRow(0)!.getFormatting();

      expect(row0.gridBefore).toBe(1);
      expect(row0.gridAfter).toBe(1);
    });

    test('should preserve gridBefore and gridAfter in round-trip', async () => {
      const doc = Document.create();
      const table = new Table(1, 5);

      table
        .getRow(0)!
        .setGridBefore(2)
        .setGridAfter(2)
        .getCell(0)!
        .createParagraph('Centered');

      doc.addTable(table);

      const outputPath = path.join(
        OUTPUT_DIR,
        'test-row-gridBoth-roundtrip.docx'
      );
      await doc.save(outputPath);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;
      const formatting = loadedTable.getRow(0)!.getFormatting();

      expect(formatting.gridBefore).toBe(2);
      expect(formatting.gridAfter).toBe(2);
    });
  });

  describe('Existing Properties Verification', () => {
    test('should verify cantSplit property works correctly', async () => {
      const doc = Document.create();
      const table = new Table(2, 2);

      // Set cantSplit
      table.getRow(0)!.setCantSplit(true);
      table.getRow(0)!.getCell(0)!.createParagraph('Cannot Split Row');

      doc.addTable(table);

      const outputPath = path.join(
        OUTPUT_DIR,
        'test-row-cantSplit-verify.docx'
      );
      await doc.save(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;

      expect(loadedTable.getRow(0)!.getFormatting().cantSplit).toBe(true);
    });

    test('should verify isHeader property works correctly', async () => {
      const doc = Document.create();
      const table = new Table(2, 2);

      // Set isHeader
      table.getRow(0)!.setHeader(true);
      table.getRow(0)!.getCell(0)!.createParagraph('Header Row');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-row-isHeader-verify.docx');
      await doc.save(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;

      expect(loadedTable.getRow(0)!.getFormatting().isHeader).toBe(true);
    });

    test('should verify trHeight property works correctly', async () => {
      const doc = Document.create();
      const table = new Table(2, 2);

      // Set row height
      table.getRow(0)!.setHeight(720, 'exact'); // 0.5 inch exact
      table.getRow(0)!.getCell(0)!.createParagraph('Tall Row');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-row-trHeight-verify.docx');
      await doc.save(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;
      const formatting = loadedTable.getRow(0)!.getFormatting();

      expect(formatting.height).toBe(720);
      expect(formatting.heightRule).toBe('exact');
    });
  });

  describe('Combined Properties', () => {
    test('should handle multiple row properties together', async () => {
      const doc = Document.create();
      const table = new Table(3, 3);

      // Row 0: Header with center justification
      table
        .getRow(0)!
        .setHeader(true)
        .setJustification('center')
        .setCantSplit(true)
        .setHeight(480, 'exact');
      table.getRow(0)!.getCell(0)!.createParagraph('Header');

      // Row 1: Hidden row with gridBefore
      table.getRow(1)!.setHidden(true).setGridBefore(1);
      table.getRow(1)!.getCell(0)!.createParagraph('Hidden');

      // Row 2: Normal row with gridAfter
      table.getRow(2)!.setGridAfter(1);
      table.getRow(2)!.getCell(0)!.createParagraph('Normal');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-row-combined.docx');
      await doc.save(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;

      // Verify row 0
      const row0 = loadedTable.getRow(0)!.getFormatting();
      expect(row0.isHeader).toBe(true);
      expect(row0.justification).toBe('center');
      expect(row0.cantSplit).toBe(true);
      expect(row0.height).toBe(480);
      expect(row0.heightRule).toBe('exact');

      // Verify row 1
      const row1 = loadedTable.getRow(1)!.getFormatting();
      expect(row1.hidden).toBe(true);
      expect(row1.gridBefore).toBe(1);

      // Verify row 2
      const row2 = loadedTable.getRow(2)!.getFormatting();
      expect(row2.gridAfter).toBe(1);
    });

    test('should preserve all properties in multi-cycle round-trip', async () => {
      const doc = Document.create();
      const table = new Table(2, 2);

      // Set all properties
      table
        .getRow(0)!
        .setJustification('center')
        .setHidden(false)
        .setGridBefore(1)
        .setGridAfter(1)
        .setCantSplit(true)
        .setHeader(true)
        .setHeight(600, 'atLeast');
      table.getRow(0)!.getCell(0)!.createParagraph('Complex Row');

      doc.addTable(table);

      // Cycle 1: Save and load
      const outputPath1 = path.join(OUTPUT_DIR, 'test-row-multicycle1.docx');
      await doc.save(outputPath1);

      const doc2 = await Document.load(outputPath1);

      // Cycle 2: Save and load again
      const outputPath2 = path.join(OUTPUT_DIR, 'test-row-multicycle2.docx');
      await doc2.save(outputPath2);

      const doc3 = await Document.load(outputPath2);

      // Verify all properties survived both cycles
      const row = doc3.getTables()[0]!.getRow(0)!.getFormatting();
      expect(row.justification).toBe('center');
      expect(row.gridBefore).toBe(1);
      expect(row.gridAfter).toBe(1);
      expect(row.cantSplit).toBe(true);
      expect(row.isHeader).toBe(true);
      expect(row.height).toBe(600);
      expect(row.heightRule).toBe('atLeast');
    });
  });

  describe('Edge Cases', () => {
    test('should handle row with no properties', async () => {
      const doc = Document.create();
      const table = new Table(1, 2);

      // No properties set
      table.getRow(0)!.getCell(0)!.createParagraph('Plain Row');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-row-no-properties.docx');
      await doc.save(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;
      const formatting = loadedTable.getRow(0)!.getFormatting();

      expect(formatting.justification).toBeUndefined();
      expect(formatting.hidden).toBeUndefined();
      expect(formatting.gridBefore).toBeUndefined();
      expect(formatting.gridAfter).toBeUndefined();
    });

    test('should handle gridBefore and gridAfter with value 0', async () => {
      const doc = Document.create();
      const table = new Table(1, 2);

      // Zero values should not be serialized
      table.getRow(0)!.setGridBefore(0).setGridAfter(0);
      table.getRow(0)!.getCell(0)!.createParagraph('Row');

      doc.addTable(table);

      const outputPath = path.join(OUTPUT_DIR, 'test-row-gridZero.docx');
      await doc.save(outputPath);

      // Round-trip test - zero values shouldn't persist
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;
      const formatting = loadedTable.getRow(0)!.getFormatting();

      // Zero values should not be set (undefined)
      expect(formatting.gridBefore).toBeUndefined();
      expect(formatting.gridAfter).toBeUndefined();
    });

    test('should handle all justification values', async () => {
      const doc = Document.create();
      const table = new Table(5, 2);

      const justifications: Array<
        'left' | 'center' | 'right' | 'start' | 'end'
      > = ['left', 'center', 'right', 'start', 'end'];

      justifications.forEach((jc, i) => {
        table.getRow(i)!.setJustification(jc);
        table.getRow(i)!.getCell(0)!.createParagraph(`${jc} aligned`);
      });

      doc.addTable(table);

      const outputPath = path.join(
        OUTPUT_DIR,
        'test-row-all-justifications.docx'
      );
      await doc.save(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Round-trip test
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0]!;

      justifications.forEach((jc, i) => {
        const formatting = loadedTable.getRow(i)!.getFormatting();
        expect(formatting.justification).toBe(jc);
      });
    });
  });
});
