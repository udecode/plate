/**
 * Tests for table cell revision markers (w:cellIns, w:cellDel, w:cellMerge)
 * Per ECMA-376 Part 1 Section 17.13.5.4-5.6
 */

import { Document } from '../../src/core/Document';
import { Table } from '../../src/elements/Table';
import { TableCell } from '../../src/elements/TableCell';
import { Revision } from '../../src/elements/Revision';
import path from 'path';
import fs from 'fs';

describe('Table Cell Revisions (w:cellIns, w:cellDel, w:cellMerge)', () => {
  const testOutputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('Setting Cell Revisions', () => {
    it('should set cell revision via setter method', () => {
      const cell = new TableCell();
      const revision = new Revision({
        id: 1,
        author: 'Alice',
        date: new Date('2025-01-15T10:00:00Z'),
        type: 'tableCellInsert',
        content: [],
      });

      cell.setCellRevision(revision);

      const retrieved = cell.getCellRevision();
      expect(retrieved).toBeDefined();
      expect(retrieved?.getType()).toBe('tableCellInsert');
      expect(retrieved?.getAuthor()).toBe('Alice');
      expect(retrieved?.getId()).toBe(1);
    });

    it('should support method chaining', () => {
      const cell = new TableCell();
      const revision = new Revision({
        id: 2,
        author: 'Bob',
        date: new Date(),
        type: 'tableCellDelete',
        content: [],
      });

      const result = cell.setCellRevision(revision).setWidth(1440);

      expect(result).toBe(cell);
      expect(cell.getCellRevision()).toBe(revision);
    });

    it('should report hasCellRevision correctly', () => {
      const cell = new TableCell();
      expect(cell.hasCellRevision()).toBe(false);

      cell.setCellRevision(new Revision({
        id: 3,
        author: 'Charlie',
        date: new Date(),
        type: 'tableCellMerge',
        content: [],
      }));

      expect(cell.hasCellRevision()).toBe(true);
    });

    it('should clear cell revision', () => {
      const cell = new TableCell();
      cell.setCellRevision(new Revision({
        id: 4,
        author: 'Diana',
        date: new Date(),
        type: 'tableCellInsert',
        content: [],
      }));

      expect(cell.hasCellRevision()).toBe(true);

      cell.clearCellRevision();

      expect(cell.hasCellRevision()).toBe(false);
      expect(cell.getCellRevision()).toBeUndefined();
    });
  });

  describe('XML Generation', () => {
    it('should generate w:cellIns element for tableCellInsert', () => {
      const cell = new TableCell();
      cell.createParagraph('Test content');
      cell.setCellRevision(new Revision({
        id: 10,
        author: 'TestAuthor',
        date: new Date('2025-01-20T12:00:00Z'),
        type: 'tableCellInsert',
        content: [],
      }));

      const xml = cell.toXML();
      const xmlString = JSON.stringify(xml);

      expect(xmlString).toContain('cellIns');
      expect(xmlString).toContain('"w:id":10');
      expect(xmlString).toContain('"w:author":"TestAuthor"');
    });

    it('should generate w:cellDel element for tableCellDelete', () => {
      const cell = new TableCell();
      cell.createParagraph('Deleted content');
      cell.setCellRevision(new Revision({
        id: 11,
        author: 'TestAuthor',
        date: new Date('2025-01-20T12:00:00Z'),
        type: 'tableCellDelete',
        content: [],
      }));

      const xml = cell.toXML();
      const xmlString = JSON.stringify(xml);

      expect(xmlString).toContain('cellDel');
      expect(xmlString).toContain('"w:id":11');
    });

    it('should generate w:cellMerge element with vMerge attributes', () => {
      const cell = new TableCell();
      cell.createParagraph('Merged content');
      cell.setCellRevision(new Revision({
        id: 12,
        author: 'MergeAuthor',
        date: new Date('2025-01-20T12:00:00Z'),
        type: 'tableCellMerge',
        content: [],
        previousProperties: {
          vMerge: 'restart',
          vMergeOrig: 'continue',
        },
      }));

      const xml = cell.toXML();
      const xmlString = JSON.stringify(xml);

      expect(xmlString).toContain('cellMerge');
      expect(xmlString).toContain('"w:id":12');
      expect(xmlString).toContain('"w:vMerge":"restart"');
      expect(xmlString).toContain('"w:vMergeOrig":"continue"');
    });

    it('should not generate cell revision element when none set', () => {
      const cell = new TableCell();
      cell.createParagraph('No revision');

      const xml = cell.toXML();
      const xmlString = JSON.stringify(xml);

      expect(xmlString).not.toContain('cellIns');
      expect(xmlString).not.toContain('cellDel');
      expect(xmlString).not.toContain('cellMerge');
    });
  });

  describe('Round-Trip Tests', () => {
    it('should round-trip tableCellInsert through buffer', async () => {
      const doc = Document.create();
      const table = new Table(2, 2);
      const cell = table.getCell(0, 0);

      cell?.createParagraph('Inserted cell content');
      cell?.setCellRevision(new Revision({
        id: 100,
        author: 'RoundTripAuthor',
        date: new Date('2025-01-15T09:30:00Z'),
        type: 'tableCellInsert',
        content: [],
      }));

      doc.addTable(table);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedTable = loadedDoc.getTables()[0];
      const loadedCell = loadedTable?.getCell(0, 0);

      const revision = loadedCell?.getCellRevision();
      expect(revision).toBeDefined();
      expect(revision?.getType()).toBe('tableCellInsert');
      expect(revision?.getAuthor()).toBe('RoundTripAuthor');
      expect(revision?.getId()).toBe(100);
    });

    it('should round-trip tableCellDelete through buffer', async () => {
      const doc = Document.create();
      const table = new Table(2, 2);
      const cell = table.getCell(1, 1);

      cell?.createParagraph('Deleted cell content');
      cell?.setCellRevision(new Revision({
        id: 101,
        author: 'DeleteAuthor',
        date: new Date('2025-01-15T10:00:00Z'),
        type: 'tableCellDelete',
        content: [],
      }));

      doc.addTable(table);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedTable = loadedDoc.getTables()[0];
      const loadedCell = loadedTable?.getCell(1, 1);

      const revision = loadedCell?.getCellRevision();
      expect(revision).toBeDefined();
      expect(revision?.getType()).toBe('tableCellDelete');
      expect(revision?.getAuthor()).toBe('DeleteAuthor');
    });

    it('should round-trip tableCellMerge with attributes through buffer', async () => {
      const doc = Document.create();
      const table = new Table(3, 3);
      const cell = table.getCell(0, 0);

      cell?.createParagraph('Merged cell content');
      cell?.setCellRevision(new Revision({
        id: 102,
        author: 'MergeTestAuthor',
        date: new Date('2025-01-15T11:00:00Z'),
        type: 'tableCellMerge',
        content: [],
        previousProperties: {
          vMerge: 'restart',
          vMergeOrig: 'continue',
        },
      }));

      doc.addTable(table);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedTable = loadedDoc.getTables()[0];
      const loadedCell = loadedTable?.getCell(0, 0);

      const revision = loadedCell?.getCellRevision();
      expect(revision).toBeDefined();
      expect(revision?.getType()).toBe('tableCellMerge');
      expect(revision?.getAuthor()).toBe('MergeTestAuthor');

      const prevProps = revision?.getPreviousProperties();
      expect(prevProps?.vMerge).toBe('restart');
      expect(prevProps?.vMergeOrig).toBe('continue');
    });

    it('should round-trip through file', async () => {
      const testFile = path.join(testOutputDir, 'test-cell-revision.docx');
      const doc = Document.create();
      const table = new Table(2, 2);

      // Cell with insert revision
      const cell00 = table.getCell(0, 0);
      cell00?.createParagraph('Cell 00');
      cell00?.setCellRevision(new Revision({
        id: 200,
        author: 'FileTestAuthor',
        date: new Date('2025-01-20T08:00:00Z'),
        type: 'tableCellInsert',
        content: [],
      }));

      // Cell with delete revision
      const cell11 = table.getCell(1, 1);
      cell11?.createParagraph('Cell 11');
      cell11?.setCellRevision(new Revision({
        id: 201,
        author: 'FileTestAuthor',
        date: new Date('2025-01-20T09:00:00Z'),
        type: 'tableCellDelete',
        content: [],
      }));

      doc.addTable(table);

      await doc.save(testFile);
      const loadedDoc = await Document.load(testFile);
      const loadedTable = loadedDoc.getTables()[0];

      // Verify cell 00
      const loadedCell00 = loadedTable?.getCell(0, 0);
      expect(loadedCell00?.getCellRevision()?.getType()).toBe('tableCellInsert');
      expect(loadedCell00?.getCellRevision()?.getId()).toBe(200);

      // Verify cell 11
      const loadedCell11 = loadedTable?.getCell(1, 1);
      expect(loadedCell11?.getCellRevision()?.getType()).toBe('tableCellDelete');
      expect(loadedCell11?.getCellRevision()?.getId()).toBe(201);
    });
  });

  describe('Cell Revision with Other Formatting', () => {
    it('should preserve cell revision with margins', async () => {
      const doc = Document.create();
      const table = new Table(1, 1);
      const cell = table.getCell(0, 0);

      cell?.setMargins({ top: 100, bottom: 100, left: 100, right: 100 });
      cell?.createParagraph('Cell with margins and revision');
      cell?.setCellRevision(new Revision({
        id: 300,
        author: 'FormattingAuthor',
        date: new Date(),
        type: 'tableCellInsert',
        content: [],
      }));

      doc.addTable(table);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedCell = loadedDoc.getTables()[0]?.getCell(0, 0);

      // Check revision preserved
      expect(loadedCell?.getCellRevision()?.getType()).toBe('tableCellInsert');

      // Check margins preserved
      const formatting = loadedCell?.getFormatting();
      expect(formatting?.margins?.top).toBe(100);
    });

    it('should preserve cell revision with vertical merge', async () => {
      const doc = Document.create();
      const table = new Table(2, 1);
      const cell = table.getCell(0, 0);

      cell?.setVerticalMerge('restart');
      cell?.createParagraph('Merged start cell');
      cell?.setCellRevision(new Revision({
        id: 301,
        author: 'VMergeAuthor',
        date: new Date(),
        type: 'tableCellInsert',
        content: [],
      }));

      doc.addTable(table);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedCell = loadedDoc.getTables()[0]?.getCell(0, 0);

      // Check revision preserved
      expect(loadedCell?.getCellRevision()?.getType()).toBe('tableCellInsert');

      // Check vertical merge preserved
      expect(loadedCell?.getFormatting().vMerge).toBe('restart');
    });
  });
});
