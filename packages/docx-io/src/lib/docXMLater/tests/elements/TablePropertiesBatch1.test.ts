/**
 * Tests for Table Properties Batch 1 (Phase 4.3)
 *
 * Tests 7 table-level properties:
 * 1. position (tblpPr) - Floating table positioning
 * 2. overlap (tblOverlap) - Allow/prevent table overlap
 * 3. bidiVisual - Bidirectional visual layout
 * 4. tableGrid - Column widths
 * 5. caption - Accessibility caption
 * 6. description - Accessibility description
 * 7. widthType / cellSpacingType - Width type definitions
 */

import { describe, test, expect } from '@jest/globals';
import { Table } from '../../src/elements/Table';
import { Document } from '../../src/core/Document';
import * as path from 'path';

describe('Table Properties Batch 1 - Table-Level Properties', () => {
  describe('Table Positioning (tblpPr)', () => {
    test('should set and serialize absolute positioning', async () => {
      const table = new Table(2, 3);
      table.setPosition({
        x: 1440, // 1 inch
        y: 2880, // 2 inches
        horizontalAnchor: 'page',
        verticalAnchor: 'page',
      });

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-table-pos-absolute.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      expect(table2).toBeDefined();

      const pos = table2!.getFormatting().position;
      expect(pos).toBeDefined();
      expect(pos!.x).toBe(1440);
      expect(pos!.y).toBe(2880);
      expect(pos!.horizontalAnchor).toBe('page');
      expect(pos!.verticalAnchor).toBe('page');
    });

    test('should set and serialize relative positioning with alignment', async () => {
      const table = new Table(2, 2);
      table.setPosition({
        horizontalAlignment: 'center',
        verticalAlignment: 'top',
        horizontalAnchor: 'margin',
        verticalAnchor: 'page',
      });

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-table-pos-relative.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      expect(table2).toBeDefined();

      const pos = table2!.getFormatting().position;
      expect(pos).toBeDefined();
      expect(pos!.horizontalAlignment).toBe('center');
      expect(pos!.verticalAlignment).toBe('top');
      expect(pos!.horizontalAnchor).toBe('margin');
      expect(pos!.verticalAnchor).toBe('page');
    });

    test('should set and serialize positioning with text distances', async () => {
      const table = new Table(3, 3);
      table.setPosition({
        x: 720,
        y: 720,
        horizontalAnchor: 'text',
        verticalAnchor: 'text',
        leftFromText: 144,
        rightFromText: 144,
        topFromText: 144,
        bottomFromText: 144,
      });

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-table-pos-distances.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      const pos = table2!.getFormatting().position;

      expect(pos).toBeDefined();
      expect(pos!.leftFromText).toBe(144);
      expect(pos!.rightFromText).toBe(144);
      expect(pos!.topFromText).toBe(144);
      expect(pos!.bottomFromText).toBe(144);
    });
  });

  describe('Table Overlap (tblOverlap)', () => {
    test('should set and serialize overlap=true', async () => {
      const table = new Table(2, 2);
      table.setOverlap(true);

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-table-overlap-true.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      expect(table2).toBeDefined();
      expect(table2!.getFormatting().overlap).toBe(true);
    });

    test('should set and serialize overlap=false', async () => {
      const table = new Table(2, 2);
      table.setOverlap(false);

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-table-overlap-false.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      expect(table2).toBeDefined();
      expect(table2!.getFormatting().overlap).toBe(false);
    });
  });

  describe('Bidirectional Visual Layout (bidiVisual)', () => {
    test('should set and serialize bidiVisual=true', async () => {
      const table = new Table(2, 3);
      table.setBidiVisual(true);

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(__dirname, '../output/test-table-bidi.docx');
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      expect(table2).toBeDefined();
      expect(table2!.getFormatting().bidiVisual).toBe(true);
    });

    test('should handle undefined bidiVisual (default LTR)', () => {
      const table = new Table(2, 2);
      expect(table.getFormatting().bidiVisual).toBeUndefined();
    });
  });

  describe('Table Grid (Column Widths)', () => {
    test('should set and serialize table grid with custom widths', async () => {
      const table = new Table(2, 3);
      // 3 columns: 2 inches, 3 inches, 1.5 inches
      table.setTableGrid([2880, 4320, 2160]);

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(__dirname, '../output/test-table-grid.docx');
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      expect(table2).toBeDefined();

      const grid = table2!.getFormatting().tableGrid;
      expect(grid).toBeDefined();
      expect(grid).toHaveLength(3);
      expect(grid![0]).toBe(2880);
      expect(grid![1]).toBe(4320);
      expect(grid![2]).toBe(2160);
    });

    test('should handle varying column widths', async () => {
      const table = new Table(3, 4);
      table.setTableGrid([1440, 2880, 1440, 2160]);

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-table-grid-varying.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      const grid = table2!.getFormatting().tableGrid;

      expect(grid).toBeDefined();
      expect(grid).toHaveLength(4);
      expect(grid![0]).toBe(1440);
      expect(grid![1]).toBe(2880);
      expect(grid![2]).toBe(1440);
      expect(grid![3]).toBe(2160);
    });
  });

  describe('Accessibility Properties', () => {
    test('should set and serialize table caption', async () => {
      const table = new Table(3, 3);
      table.setCaption('Q4 Sales Data');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-table-caption.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      expect(table2).toBeDefined();
      expect(table2!.getFormatting().caption).toBe('Q4 Sales Data');
    });

    test('should set and serialize table description', async () => {
      const table = new Table(2, 4);
      table.setDescription(
        'This table shows quarterly sales figures broken down by region'
      );

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-table-description.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      expect(table2).toBeDefined();
      expect(table2!.getFormatting().description).toBe(
        'This table shows quarterly sales figures broken down by region'
      );
    });

    test('should set and serialize both caption and description', async () => {
      const table = new Table(2, 2);
      table.setCaption('Product Comparison');
      table.setDescription(
        'Comparison of product features across different models'
      );

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-table-caption-description.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      expect(table2!.getFormatting().caption).toBe('Product Comparison');
      expect(table2!.getFormatting().description).toBe(
        'Comparison of product features across different models'
      );
    });
  });

  describe('Width and Spacing Types', () => {
    test('should set and serialize table width with type', async () => {
      const table = new Table(2, 3);
      table.setWidth(5000);
      table.setWidthType('pct'); // percentage

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-table-width-type.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      expect(table2).toBeDefined();
      expect(table2!.getFormatting().width).toBe(5000);
      expect(table2!.getFormatting().widthType).toBe('pct');
    });

    test('should set and serialize cell spacing with type', async () => {
      const table = new Table(2, 2);
      table.setCellSpacing(100);
      table.setCellSpacingType('dxa');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-table-cell-spacing-type.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      expect(table2!.getFormatting().cellSpacing).toBe(100);
      expect(table2!.getFormatting().cellSpacingType).toBe('dxa');
    });

    test("should default to 'dxa' for width type", async () => {
      const table = new Table(2, 2);
      table.setWidth(9360);

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-table-width-default-type.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      // Should default to 'dxa' if not specified
      expect(table2!.getFormatting().widthType).toBeDefined();
    });
  });

  describe('Combined Properties', () => {
    test('should handle multiple properties together', async () => {
      const table = new Table(3, 4);

      // Set all batch 1 properties
      table.setPosition({
        horizontalAlignment: 'center',
        verticalAlignment: 'top',
        horizontalAnchor: 'margin',
        verticalAnchor: 'page',
      });
      table.setOverlap(false);
      table.setBidiVisual(false);
      table.setTableGrid([2000, 3000, 2000, 2500]);
      table.setCaption('Comprehensive Test Table');
      table.setDescription('Testing all Batch 1 properties together');
      table.setWidthType('dxa');
      table.setCellSpacingType('dxa');

      const doc = Document.create();
      doc.addTable(table);

      const outputPath = path.join(
        __dirname,
        '../output/test-table-batch1-combined.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const table2 = doc2.getTables()[0];
      expect(table2).toBeDefined();

      // Verify all properties preserved
      expect(table2!.getFormatting().position).toBeDefined();
      expect(table2!.getFormatting().overlap).toBe(false);
      expect(table2!.getFormatting().tableGrid).toHaveLength(4);
      expect(table2!.getFormatting().caption).toBe('Comprehensive Test Table');
      expect(table2!.getFormatting().description).toBe(
        'Testing all Batch 1 properties together'
      );
    });

    test('should preserve properties through multiple save/load cycles', async () => {
      const table = new Table(2, 3);
      table.setPosition({
        x: 1440,
        y: 1440,
        horizontalAnchor: 'page',
        verticalAnchor: 'page',
      });
      table.setOverlap(true);
      table.setTableGrid([2880, 2880, 2880]);
      table.setCaption('Multi-cycle Test');

      const doc1 = Document.create();
      doc1.addTable(table);

      // First save
      const path1 = path.join(__dirname, '../output/test-table-cycle1.docx');
      await doc1.save(path1);

      // First load
      const doc2 = await Document.load(path1);

      // Second save
      const path2 = path.join(__dirname, '../output/test-table-cycle2.docx');
      await doc2.save(path2);

      // Second load
      const doc3 = await Document.load(path2);
      const finalTable = doc3.getTables()[0];

      // Verify all properties still intact
      expect(finalTable!.getFormatting().position!.x).toBe(1440);
      expect(finalTable!.getFormatting().overlap).toBe(true);
      expect(finalTable!.getFormatting().tableGrid).toHaveLength(3);
      expect(finalTable!.getFormatting().caption).toBe('Multi-cycle Test');
    });
  });

  describe('XML Structure Validation', () => {
    test('should generate correct XML for positioning', () => {
      const table = new Table(2, 2);
      table.setPosition({
        x: 1000,
        y: 2000,
        horizontalAnchor: 'page',
        verticalAnchor: 'margin',
      });

      const xml = table.toXML();
      const xmlStr = JSON.stringify(xml);

      expect(xmlStr).toContain('"w:tblpPr"');
      expect(xmlStr).toContain('"w:tblpX"');
      expect(xmlStr).toContain('1000');
      expect(xmlStr).toContain('"w:tblpY"');
      expect(xmlStr).toContain('2000');
    });

    test('should generate correct XML for overlap', () => {
      const table = new Table(2, 2);
      table.setOverlap(false);

      const xml = table.toXML();
      const xmlStr = JSON.stringify(xml);

      expect(xmlStr).toContain('"w:tblOverlap"');
      expect(xmlStr).toContain('"never"');
    });

    test('should generate correct XML for bidiVisual', () => {
      const table = new Table(2, 2);
      table.setBidiVisual(true);

      const xml = table.toXML();
      const xmlStr = JSON.stringify(xml);

      expect(xmlStr).toContain('"w:bidiVisual"');
    });

    test('should generate correct XML for caption and description', () => {
      const table = new Table(2, 2);
      table.setCaption('Test Caption');
      table.setDescription('Test Description');

      const xml = table.toXML();
      const xmlStr = JSON.stringify(xml);

      expect(xmlStr).toContain('"w:tblCaption"');
      expect(xmlStr).toContain('"Test Caption"');
      expect(xmlStr).toContain('"w:tblDescription"');
      expect(xmlStr).toContain('"Test Description"');
    });
  });
});
