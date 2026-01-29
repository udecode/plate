/**
 * Tests for Table vertical merging (vMerge)
 */

import { Table } from '../../src/elements/Table';
import { Document } from '../../src/core/Document';
import * as path from 'path';
import * as fs from 'fs';

const OUTPUT_DIR = path.join(__dirname, '..', 'output');

describe('Table Vertical Merge (vMerge)', () => {
  beforeAll(() => {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
  });

  describe('Basic Vertical Merging', () => {
    it('should merge cells vertically using vMerge', () => {
      const table = new Table(3, 2);

      // Set some content
      table.getCell(0, 0)?.createParagraph('Merged Cell');
      table.getCell(1, 0)?.createParagraph('This will be merged');
      table.getCell(2, 0)?.createParagraph('This will be merged too');

      // Merge vertically (rows 0-2, column 0)
      table.mergeCells(0, 0, 2, 0);

      // Check vMerge attributes
      const cell0 = table.getCell(0, 0);
      const cell1 = table.getCell(1, 0);
      const cell2 = table.getCell(2, 0);

      expect(cell0).toBeDefined();
      expect(cell1).toBeDefined();
      expect(cell2).toBeDefined();

      // Verify XML structure - First cell should have vMerge='restart'
      const xml0 = cell0!.toXML();
      const tcPr0 = xml0.children?.find((c: any) => c.name === 'w:tcPr') as any;
      const vMerge0 = tcPr0?.children?.find((c: any) => c.name === 'w:vMerge');
      expect(vMerge0).toBeDefined();
      expect(vMerge0?.attributes?.['w:val']).toBe('restart');

      // Subsequent cells should have vMerge (continue)
      const xml1 = cell1!.toXML();
      const tcPr1 = xml1.children?.find((c: any) => c.name === 'w:tcPr') as any;
      const vMerge1 = tcPr1?.children?.find((c: any) => c.name === 'w:vMerge');
      expect(vMerge1).toBeDefined();
      expect(vMerge1?.attributes?.['w:val']).toBeUndefined(); // continue has no val attribute
    });

    it('should merge cells both horizontally and vertically', () => {
      const table = new Table(3, 3);

      // Merge a 2x2 block
      table.mergeCells(0, 0, 1, 1);

      const cell0_0 = table.getCell(0, 0);
      const cell1_0 = table.getCell(1, 0);
      const cell0_1 = table.getCell(0, 1);
      const cell1_1 = table.getCell(1, 1);

      // Top-left cell should have both vMerge='restart' and columnSpan
      const xml0_0 = cell0_0!.toXML();
      const tcPr0_0 = xml0_0.children?.find((c: any) => c.name === 'w:tcPr') as any;
      const vMerge0_0 = tcPr0_0?.children?.find((c: any) => c.name === 'w:vMerge');
      const gridSpan0_0 = tcPr0_0?.children?.find((c: any) => c.name === 'w:gridSpan');
      expect(vMerge0_0).toBeDefined();
      expect(vMerge0_0?.attributes?.['w:val']).toBe('restart');
      expect(gridSpan0_0).toBeDefined();

      // Bottom-left cell should have vMerge='continue' and columnSpan
      const xml1_0 = cell1_0!.toXML();
      const tcPr1_0 = xml1_0.children?.find((c: any) => c.name === 'w:tcPr') as any;
      const vMerge1_0 = tcPr1_0?.children?.find((c: any) => c.name === 'w:vMerge');
      const gridSpan1_0 = tcPr1_0?.children?.find((c: any) => c.name === 'w:gridSpan');
      expect(vMerge1_0).toBeDefined();
      expect(gridSpan1_0).toBeDefined();
    });

    it('should create valid DOCX with vertical merges', async () => {
      const doc = Document.create();
      const table = doc.createTable(4, 3);

      // Add content
      table.getCell(0, 0)?.createParagraph('Header 1');
      table.getCell(0, 1)?.createParagraph('Header 2');
      table.getCell(0, 2)?.createParagraph('Header 3');

      // Merge first column vertically (rows 1-3)
      table.mergeCells(1, 0, 3, 0);
      table.getCell(1, 0)?.createParagraph('Vertically Merged');

      // Add other content
      table.getCell(1, 1)?.createParagraph('Cell 1,1');
      table.getCell(2, 1)?.createParagraph('Cell 2,1');
      table.getCell(3, 1)?.createParagraph('Cell 3,1');

      const outputPath = path.join(OUTPUT_DIR, 'test-table-vmerge.docx');
      await doc.save(outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);

      // Load and verify
      const loadedDoc = await Document.load(outputPath);
      const loadedTable = loadedDoc.getTables()[0];
      expect(loadedTable).toBeDefined();
      expect(loadedTable?.getRowCount()).toBe(4);
    });

    it('should handle complex merge patterns', async () => {
      const doc = Document.create();
      const table = doc.createTable(5, 4);

      // Create a complex pattern:
      // - Merge cells (0,0) to (1,1) - 2x2 block
      // - Merge cells (2,0) to (4,0) - vertical merge
      // - Merge cells (3,2) to (4,3) - 2x2 block

      table.mergeCells(0, 0, 1, 1);
      table.getCell(0, 0)?.createParagraph('Block 1');

      table.mergeCells(2, 0, 4, 0);
      table.getCell(2, 0)?.createParagraph('Tall Cell');

      table.mergeCells(3, 2, 4, 3);
      table.getCell(3, 2)?.createParagraph('Block 2');

      const outputPath = path.join(OUTPUT_DIR, 'test-table-vmerge-complex.docx');
      await doc.save(outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);

      // Verify it can be loaded
      const loadedDoc = await Document.load(outputPath);
      expect(loadedDoc.getTables().length).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single-row merge (no vertical merge)', () => {
      const table = new Table(3, 3);

      // Merge horizontally only
      table.mergeCells(0, 0, 0, 2);

      const cell = table.getCell(0, 0);
      const xml = cell!.toXML();
      const tcPr = xml.children?.find((c: any) => c.name === 'w:tcPr') as any;
      const gridSpan = tcPr?.children?.find((c: any) => c.name === 'w:gridSpan');
      const vMerge = tcPr?.children?.find((c: any) => c.name === 'w:vMerge');

      // Should have column span but not vMerge
      expect(gridSpan).toBeDefined();
      expect(vMerge).toBeUndefined();
    });

    it('should handle single-column merge (only vertical merge)', () => {
      const table = new Table(3, 3);

      // Merge vertically only
      table.mergeCells(0, 0, 2, 0);

      const cell0 = table.getCell(0, 0);
      const xml0 = cell0!.toXML();
      const tcPr0 = xml0.children?.find((c: any) => c.name === 'w:tcPr') as any;
      const vMerge0 = tcPr0?.children?.find((c: any) => c.name === 'w:vMerge');
      const gridSpan0 = tcPr0?.children?.find((c: any) => c.name === 'w:gridSpan');

      // Should have vMerge but not gridSpan
      expect(vMerge0).toBeDefined();
      expect(vMerge0?.attributes?.['w:val']).toBe('restart');
      expect(gridSpan0).toBeUndefined();
    });

    it('should handle invalid merge ranges gracefully', () => {
      const table = new Table(3, 3);

      // Out of bounds merge - should not crash
      expect(() => {
        table.mergeCells(0, 0, 10, 0);
      }).not.toThrow();

      // Negative indices
      expect(() => {
        table.mergeCells(-1, 0, 2, 0);
      }).not.toThrow();
    });
  });

  describe('Round-trip Testing', () => {
    it('should preserve vMerge on round-trip', async () => {
      // Create document with merged cells
      const doc = Document.create();
      const table = doc.createTable(3, 2);

      table.mergeCells(0, 0, 2, 0);
      table.getCell(0, 0)?.createParagraph('Merged');

      const outputPath = path.join(OUTPUT_DIR, 'test-vmerge-roundtrip.docx');
      await doc.save(outputPath);

      // Load and re-save
      const loadedDoc = await Document.load(outputPath);
      const outputPath2 = path.join(OUTPUT_DIR, 'test-vmerge-roundtrip2.docx');
      await loadedDoc.save(outputPath2);

      // Verify both exist
      expect(fs.existsSync(outputPath)).toBe(true);
      expect(fs.existsSync(outputPath2)).toBe(true);
    });
  });
});
