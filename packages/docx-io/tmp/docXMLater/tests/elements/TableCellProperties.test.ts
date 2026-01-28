/**
 * Round-trip tests for table cell properties (Phase 4.0.3)
 * Tests cell margins, borders, shading, and alignment parsing
 */

import { Document } from '../../src/core/Document';
import { Table } from '../../src/elements/Table';
import path from 'path';
import fs from 'fs';

describe('Table Cell Properties - Round Trip Tests', () => {
  const testOutputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('Cell Margins', () => {
    it('should round-trip cell with all margins', async () => {
      const doc = Document.create();
      const table = new Table(1, 1);
      const cell = table.getCell(0, 0);

      cell?.setMargins({
        top: 100,
        bottom: 100,
        left: 200,
        right: 200,
      });
      cell?.createParagraph('Cell with margins');

      doc.addTable(table);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedTable = loadedDoc.getTables()[0];
      const loadedCell = loadedTable?.getCell(0, 0);

      const formatting = loadedCell?.getFormatting();
      expect(formatting?.margins).toBeDefined();
      expect(formatting?.margins?.top).toBe(100);
      expect(formatting?.margins?.bottom).toBe(100);
      expect(formatting?.margins?.left).toBe(200);
      expect(formatting?.margins?.right).toBe(200);
    });

    it('should round-trip cell with top and bottom margins only', async () => {
      const doc = Document.create();
      const table = new Table(1, 1);
      const cell = table.getCell(0, 0);

      cell?.setMargins({
        top: 150,
        bottom: 150,
      });
      cell?.createParagraph('Cell with top/bottom margins');

      doc.addTable(table);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedTable = loadedDoc.getTables()[0];
      const loadedCell = loadedTable?.getCell(0, 0);

      const formatting = loadedCell?.getFormatting();
      expect(formatting?.margins?.top).toBe(150);
      expect(formatting?.margins?.bottom).toBe(150);
      expect(formatting?.margins?.left).toBeUndefined();
      expect(formatting?.margins?.right).toBeUndefined();
    });

    it('should round-trip cell with uniform margins', async () => {
      const doc = Document.create();
      const table = new Table(1, 1);
      const cell = table.getCell(0, 0);

      cell?.setAllMargins(120);
      cell?.createParagraph('Cell with uniform margins');

      doc.addTable(table);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedTable = loadedDoc.getTables()[0];
      const loadedCell = loadedTable?.getCell(0, 0);

      const formatting = loadedCell?.getFormatting();
      expect(formatting?.margins?.top).toBe(120);
      expect(formatting?.margins?.bottom).toBe(120);
      expect(formatting?.margins?.left).toBe(120);
      expect(formatting?.margins?.right).toBe(120);
    });

    it('should save margins to file and load correctly', async () => {
      const doc = Document.create();
      const table = new Table(1, 1);
      const cell = table.getCell(0, 0);

      cell?.setMargins({
        top: 100,
        bottom: 100,
        left: 150,
        right: 150,
      });
      cell?.createParagraph('Testing file save/load with margins');

      doc.addTable(table);

      const filePath = path.join(testOutputDir, 'table-cell-margins.docx');
      await doc.save(filePath);

      const loadedDoc = await Document.load(filePath);
      const loadedTable = loadedDoc.getTables()[0];
      const loadedCell = loadedTable?.getCell(0, 0);

      const formatting = loadedCell?.getFormatting();
      expect(formatting?.margins?.top).toBe(100);
      expect(formatting?.margins?.bottom).toBe(100);
      expect(formatting?.margins?.left).toBe(150);
      expect(formatting?.margins?.right).toBe(150);

      // Cleanup
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });

  describe('Cell Borders', () => {
    it('should round-trip cell with borders', async () => {
      const doc = Document.create();
      const table = new Table(1, 1);
      const cell = table.getCell(0, 0);

      cell?.setBorders({
        top: { style: 'single', size: 4, color: '000000' },
        bottom: { style: 'double', size: 8, color: 'FF0000' },
        left: { style: 'dashed', size: 4, color: '0000FF' },
        right: { style: 'thick', size: 12, color: '00FF00' },
      });
      cell?.createParagraph('Cell with borders');

      doc.addTable(table);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedTable = loadedDoc.getTables()[0];
      const loadedCell = loadedTable?.getCell(0, 0);

      const formatting = loadedCell?.getFormatting();
      expect(formatting?.borders).toBeDefined();
      expect(formatting?.borders?.top).toEqual({ style: 'single', size: 4, color: '000000' });
      expect(formatting?.borders?.bottom).toEqual({ style: 'double', size: 8, color: 'FF0000' });
      expect(formatting?.borders?.left).toEqual({ style: 'dashed', size: 4, color: '0000FF' });
      expect(formatting?.borders?.right).toEqual({ style: 'thick', size: 12, color: '00FF00' });
    });
  });

  describe('Cell Shading', () => {
    it('should round-trip cell with shading', async () => {
      const doc = Document.create();
      const table = new Table(1, 1);
      const cell = table.getCell(0, 0);

      cell?.setShading({ fill: 'FFFF00' });
      cell?.createParagraph('Cell with yellow background');

      doc.addTable(table);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedTable = loadedDoc.getTables()[0];
      const loadedCell = loadedTable?.getCell(0, 0);

      const formatting = loadedCell?.getFormatting();
      expect(formatting?.shading).toBeDefined();
      expect(formatting?.shading?.fill).toBe('FFFF00');
    });
  });

  describe('Cell Vertical Alignment', () => {
    it('should round-trip cell with vertical alignment', async () => {
      const doc = Document.create();
      const table = new Table(1, 3);

      table.getCell(0, 0)?.setVerticalAlignment('top').createParagraph('Top');
      table.getCell(0, 1)?.setVerticalAlignment('center').createParagraph('Center');
      table.getCell(0, 2)?.setVerticalAlignment('bottom').createParagraph('Bottom');

      doc.addTable(table);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedTable = loadedDoc.getTables()[0];

      expect(loadedTable?.getCell(0, 0)?.getFormatting().verticalAlignment).toBe('top');
      expect(loadedTable?.getCell(0, 1)?.getFormatting().verticalAlignment).toBe('center');
      expect(loadedTable?.getCell(0, 2)?.getFormatting().verticalAlignment).toBe('bottom');
    });
  });

  describe('Cell Width', () => {
    it('should round-trip cell with width', async () => {
      const doc = Document.create();
      const table = new Table(1, 2);

      table.getCell(0, 0)?.setWidth(2880).createParagraph('Wide cell');
      table.getCell(0, 1)?.setWidth(1440).createParagraph('Narrow cell');

      doc.addTable(table);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedTable = loadedDoc.getTables()[0];

      expect(loadedTable?.getCell(0, 0)?.getFormatting().width).toBe(2880);
      expect(loadedTable?.getCell(0, 1)?.getFormatting().width).toBe(1440);
    });
  });

  describe('Column Span', () => {
    it('should round-trip cell with column span', async () => {
      const doc = Document.create();
      const table = new Table(2, 3);

      // First row: merged cell spanning 3 columns
      table.getCell(0, 0)?.setColumnSpan(3).createParagraph('Merged cell');

      // Second row: 3 normal cells
      table.getCell(1, 0)?.createParagraph('Cell 1');
      table.getCell(1, 1)?.createParagraph('Cell 2');
      table.getCell(1, 2)?.createParagraph('Cell 3');

      doc.addTable(table);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedTable = loadedDoc.getTables()[0];

      expect(loadedTable?.getCell(0, 0)?.getFormatting().columnSpan).toBe(3);
      expect(loadedTable?.getCell(1, 0)?.getFormatting().columnSpan).toBeUndefined();
    });
  });

  describe('Combined Cell Properties', () => {
    it('should round-trip cell with all properties', async () => {
      const doc = Document.create();
      const table = new Table(1, 1);
      const cell = table.getCell(0, 0);

      cell?.setWidth(2880);
      cell?.setMargins({ top: 100, bottom: 100, left: 150, right: 150 });
      cell?.setBorders({
        top: { style: 'single', size: 4, color: '000000' },
        bottom: { style: 'single', size: 4, color: '000000' },
      });
      cell?.setShading({ fill: 'FFFF00' });
      cell?.setVerticalAlignment('center');
      cell?.createParagraph('Cell with all properties');

      doc.addTable(table);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedTable = loadedDoc.getTables()[0];
      const loadedCell = loadedTable?.getCell(0, 0);

      const formatting = loadedCell?.getFormatting();

      // Check all properties preserved
      expect(formatting?.width).toBe(2880);
      expect(formatting?.margins?.top).toBe(100);
      expect(formatting?.margins?.bottom).toBe(100);
      expect(formatting?.margins?.left).toBe(150);
      expect(formatting?.margins?.right).toBe(150);
      expect(formatting?.borders?.top).toBeDefined();
      expect(formatting?.borders?.bottom).toBeDefined();
      expect(formatting?.shading?.fill).toBe('FFFF00');
      expect(formatting?.verticalAlignment).toBe('center');
    });

    it('should save complete formatted table and load correctly', async () => {
      const doc = Document.create();
      const table = new Table(3, 2);

      // Header row with margins and shading
      const headerCell1 = table.getCell(0, 0);
      headerCell1?.setMargins({ top: 100, bottom: 100, left: 100, right: 100 });
      headerCell1?.setShading({ fill: 'DFDFDF' });
      headerCell1?.setVerticalAlignment('center');
      headerCell1?.createParagraph('Header 1');

      const headerCell2 = table.getCell(0, 1);
      headerCell2?.setMargins({ top: 100, bottom: 100, left: 100, right: 100 });
      headerCell2?.setShading({ fill: 'DFDFDF' });
      headerCell2?.setVerticalAlignment('center');
      headerCell2?.createParagraph('Header 2');

      // Data rows
      table.getCell(1, 0)?.setMargins({ left: 50, right: 50 }).createParagraph('Data 1-1');
      table.getCell(1, 1)?.setMargins({ left: 50, right: 50 }).createParagraph('Data 1-2');
      table.getCell(2, 0)?.setMargins({ left: 50, right: 50 }).createParagraph('Data 2-1');
      table.getCell(2, 1)?.setMargins({ left: 50, right: 50 }).createParagraph('Data 2-2');

      doc.addTable(table);

      const filePath = path.join(testOutputDir, 'table-combined-properties.docx');
      await doc.save(filePath);

      const loadedDoc = await Document.load(filePath);
      const loadedTable = loadedDoc.getTables()[0];

      // Verify header row
      const loadedHeaderCell1 = loadedTable?.getCell(0, 0);
      expect(loadedHeaderCell1?.getFormatting().margins?.top).toBe(100);
      expect(loadedHeaderCell1?.getFormatting().shading?.fill).toBe('DFDFDF');
      expect(loadedHeaderCell1?.getFormatting().verticalAlignment).toBe('center');

      // Verify data rows
      const loadedDataCell = loadedTable?.getCell(1, 0);
      expect(loadedDataCell?.getFormatting().margins?.left).toBe(50);
      expect(loadedDataCell?.getFormatting().margins?.right).toBe(50);

      // Cleanup
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });

  describe('Professional Table Example', () => {
    it('should create and load professional table with cell margins', async () => {
      const doc = Document.create();
      const table = new Table(4, 3);

      // Configure table
      table.setWidth(8640); // 6 inches
      table.setBorders({
        top: { style: 'single', size: 4, color: '000000' },
        bottom: { style: 'single', size: 4, color: '000000' },
        left: { style: 'single', size: 4, color: '000000' },
        right: { style: 'single', size: 4, color: '000000' },
        insideH: { style: 'single', size: 4, color: 'CCCCCC' },
        insideV: { style: 'single', size: 4, color: 'CCCCCC' },
      });

      // Header row
      for (let col = 0; col < 3; col++) {
        const cell = table.getCell(0, col);
        cell?.setMargins({ top: 80, bottom: 80, left: 100, right: 100 });
        cell?.setShading({ fill: 'D3D3D3' });
        cell?.setVerticalAlignment('center');
        cell?.createParagraph(`Column ${col + 1}`);
      }

      // Data rows
      for (let row = 1; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
          const cell = table.getCell(row, col);
          cell?.setMargins({ top: 60, bottom: 60, left: 80, right: 80 });
          cell?.createParagraph(`Row ${row}, Col ${col + 1}`);
        }
      }

      doc.addTable(table);

      const filePath = path.join(testOutputDir, 'professional-table.docx');
      await doc.save(filePath);

      const loadedDoc = await Document.load(filePath);
      const loadedTable = loadedDoc.getTables()[0];

      // Verify header formatting
      const headerCell = loadedTable?.getCell(0, 0);
      expect(headerCell?.getFormatting().margins?.top).toBe(80);
      expect(headerCell?.getFormatting().margins?.left).toBe(100);
      expect(headerCell?.getFormatting().shading?.fill).toBe('D3D3D3');

      // Verify data cell formatting
      const dataCell = loadedTable?.getCell(1, 0);
      expect(dataCell?.getFormatting().margins?.top).toBe(60);
      expect(dataCell?.getFormatting().margins?.left).toBe(80);

      // Cleanup
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  });
});
