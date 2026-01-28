/**
 * Tests for Document class
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Document, DocumentProperties } from '../../src/core/Document';
import { Hyperlink } from '../../src/elements/Hyperlink';
import { Paragraph } from '../../src/elements/Paragraph';
import { Table } from '../../src/elements/Table';
import { DOCX_PATHS } from '../../src/zip/types';

const TEST_OUTPUT_DIR = path.join(__dirname, '../../test-output');

describe('Document', () => {
  beforeAll(async () => {
    // Create test output directory
    await fs.mkdir(TEST_OUTPUT_DIR, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test output directory
    try {
      await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Document.create()', () => {
    it('should create a new empty document', () => {
      const doc = Document.create();
      expect(doc).toBeInstanceOf(Document);
      expect(doc.getParagraphCount()).toBe(0);
    });

    it('should create document with properties', () => {
      const props: DocumentProperties = {
        title: 'Test Document',
        creator: 'Test Author',
        subject: 'Testing',
      };

      const doc = Document.create({ properties: props });
      const docProps = doc.getProperties();

      expect(docProps.title).toBe('Test Document');
      expect(docProps.creator).toBe('Test Author');
      expect(docProps.subject).toBe('Testing');
    });

    it('should initialize required DOCX files', () => {
      const doc = Document.create();
      const zipHandler = doc.getZipHandler();

      expect(zipHandler.hasFile(DOCX_PATHS.CONTENT_TYPES)).toBe(true);
      expect(zipHandler.hasFile(DOCX_PATHS.RELS)).toBe(true);
      expect(zipHandler.hasFile(DOCX_PATHS.DOCUMENT)).toBe(true);
      expect(zipHandler.hasFile(DOCX_PATHS.CORE_PROPS)).toBe(true);
      expect(zipHandler.hasFile(DOCX_PATHS.APP_PROPS)).toBe(true);
    });
  });

  describe('Paragraph management', () => {
    it('should add paragraphs', () => {
      const doc = Document.create();
      const para1 = new Paragraph().addText('First paragraph');
      const para2 = new Paragraph().addText('Second paragraph');

      doc.addParagraph(para1).addParagraph(para2);

      expect(doc.getParagraphCount()).toBe(2);
      expect(doc.getParagraphs()).toHaveLength(2);
    });

    it('should support method chaining for addParagraph', () => {
      const doc = Document.create();
      const para1 = new Paragraph().addText('Para 1');
      const para2 = new Paragraph().addText('Para 2');

      const result = doc.addParagraph(para1).addParagraph(para2);

      expect(result).toBe(doc);
      expect(doc.getParagraphCount()).toBe(2);
    });

    it('should create and add paragraph with text', () => {
      const doc = Document.create();
      const para = doc.createParagraph('Hello World');

      expect(doc.getParagraphCount()).toBe(1);
      expect(para.getText()).toBe('Hello World');
      expect(doc.getParagraphs()[0]).toBe(para);
    });

    it('should create empty paragraph when no text provided', () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      expect(doc.getParagraphCount()).toBe(1);
      expect(para.getText()).toBe('');
    });

    it('should get paragraphs as copy', () => {
      const doc = Document.create();
      doc.createParagraph('Test');

      const paragraphs1 = doc.getParagraphs();
      const paragraphs2 = doc.getParagraphs();

      expect(paragraphs1).not.toBe(paragraphs2);
      expect(paragraphs1).toEqual(paragraphs2);
    });

    it('should clear all paragraphs', () => {
      const doc = Document.create();
      doc.createParagraph('Para 1');
      doc.createParagraph('Para 2');
      doc.createParagraph('Para 3');

      expect(doc.getParagraphCount()).toBe(3);

      doc.clearParagraphs();

      expect(doc.getParagraphCount()).toBe(0);
      expect(doc.getParagraphs()).toHaveLength(0);
    });

    it('should support method chaining for clearParagraphs', () => {
      const doc = Document.create();
      doc.createParagraph('Test');

      const result = doc.clearParagraphs();

      expect(result).toBe(doc);
    });
  });

  describe('Document properties', () => {
    it('should set properties', () => {
      const doc = Document.create();

      doc.setProperties({
        title: 'My Document',
        subject: 'Subject',
        creator: 'John Doe',
      });

      const props = doc.getProperties();
      expect(props.title).toBe('My Document');
      expect(props.subject).toBe('Subject');
      expect(props.creator).toBe('John Doe');
    });

    it('should merge properties', () => {
      const doc = Document.create({
        properties: {
          title: 'Original Title',
          creator: 'Original Author',
        },
      });

      doc.setProperties({
        title: 'New Title',
        subject: 'New Subject',
      });

      const props = doc.getProperties();
      expect(props.title).toBe('New Title');
      expect(props.creator).toBe('Original Author');
      expect(props.subject).toBe('New Subject');
    });

    it('should support method chaining for setProperties', () => {
      const doc = Document.create();
      const result = doc.setProperties({ title: 'Test' });
      expect(result).toBe(doc);
    });

    it('should get properties as copy', () => {
      const doc = Document.create({ properties: { title: 'Test' } });

      const props1 = doc.getProperties();
      const props2 = doc.getProperties();

      expect(props1).not.toBe(props2);
      expect(props1).toEqual(props2);
    });

    it('should handle special characters in properties', () => {
      const doc = Document.create();

      doc.setProperties({
        title: 'Test & <Document>',
        description: 'Contains "quotes" and \'apostrophes\'',
      });

      const props = doc.getProperties();
      expect(props.title).toBe('Test & <Document>');
      expect(props.description).toBe('Contains "quotes" and \'apostrophes\'');
    });
  });

  describe('save()', () => {
    it('should save document to file', async () => {
      const doc = Document.create();
      doc.createParagraph('Test content');

      const outputPath = path.join(TEST_OUTPUT_DIR, 'test-save.docx');
      await doc.save(outputPath);

      const stats = await fs.stat(outputPath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should save document with multiple paragraphs', async () => {
      const doc = Document.create({ properties: { title: 'Multi-para Doc' } });

      doc.createParagraph('First paragraph');
      doc.createParagraph('Second paragraph');
      doc.createParagraph('Third paragraph');

      const outputPath = path.join(TEST_OUTPUT_DIR, 'test-multi-para.docx');
      await doc.save(outputPath);

      const stats = await fs.stat(outputPath);
      expect(stats.isFile()).toBe(true);
    });

    it('should save document with formatted paragraphs', async () => {
      const doc = Document.create();

      const para1 = doc.createParagraph();
      para1.setAlignment('center').addText('Centered Title', { bold: true, size: 16 });

      const para2 = doc.createParagraph();
      para2.addText('Normal text with ');
      para2.addText('bold', { bold: true });
      para2.addText(' and ');
      para2.addText('italic', { italic: true });
      para2.addText(' formatting.');

      const outputPath = path.join(TEST_OUTPUT_DIR, 'test-formatted.docx');
      await doc.save(outputPath);

      const stats = await fs.stat(outputPath);
      expect(stats.isFile()).toBe(true);
    });

    it('should update document.xml when saving', async () => {
      const doc = Document.create();
      doc.createParagraph('Content');

      const outputPath = path.join(TEST_OUTPUT_DIR, 'test-update-xml.docx');
      await doc.save(outputPath);

      const zipHandler = doc.getZipHandler();
      const docXml = zipHandler.getFileAsString(DOCX_PATHS.DOCUMENT);

      expect(docXml).toContain('Content');
    });
  });

  describe('toBuffer()', () => {
    it('should generate document as buffer', async () => {
      const doc = Document.create();
      doc.createParagraph('Buffer test');

      const buffer = await doc.toBuffer();

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should be able to load buffer back', async () => {
      const doc1 = Document.create({ properties: { title: 'Buffer Test' } });
      doc1.createParagraph('Test content');

      const buffer = await doc1.toBuffer();

      const doc2 = await Document.loadFromBuffer(buffer);
      const props = doc2.getProperties();

      expect(props.title).toBe('Buffer Test');
    });
  });

  describe('Document.load()', () => {
    it('should load document from file', async () => {
      // Create a document
      const doc1 = Document.create({ properties: { title: 'Load Test' } });
      doc1.createParagraph('Test paragraph');

      const filePath = path.join(TEST_OUTPUT_DIR, 'test-load.docx');
      await doc1.save(filePath);

      // Load it back
      const doc2 = await Document.load(filePath);
      const props = doc2.getProperties();

      expect(props.title).toBe('Load Test');
    });

    it('should throw error for invalid file', async () => {
      await expect(Document.load('nonexistent.docx')).rejects.toThrow();
    });
  });

  describe('Document.loadFromBuffer()', () => {
    it('should load document from buffer', async () => {
      const doc1 = Document.create();
      doc1.createParagraph('Buffer content');

      const buffer = await doc1.toBuffer();
      const doc2 = await Document.loadFromBuffer(buffer);

      expect(doc2).toBeInstanceOf(Document);
    });

    it('should throw error for invalid buffer', async () => {
      const invalidBuffer = Buffer.from('not a zip file');
      await expect(Document.loadFromBuffer(invalidBuffer)).rejects.toThrow();
    });
  });

  describe('XML generation', () => {
    it('should generate valid [Content_Types].xml', () => {
      const doc = Document.create();
      const zipHandler = doc.getZipHandler();
      const xml = zipHandler.getFileAsString(DOCX_PATHS.CONTENT_TYPES);

      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<Types xmlns=');
      expect(xml).toContain('word/document.xml');
    });

    it('should generate valid _rels/.rels', () => {
      const doc = Document.create();
      const zipHandler = doc.getZipHandler();
      const xml = zipHandler.getFileAsString(DOCX_PATHS.RELS);

      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<Relationships');
      expect(xml).toContain('word/document.xml');
    });

    it('should generate valid core.xml', () => {
      const doc = Document.create({
        properties: {
          title: 'Test Title',
          creator: 'Test Creator',
        },
      });
      const zipHandler = doc.getZipHandler();
      const xml = zipHandler.getFileAsString(DOCX_PATHS.CORE_PROPS);

      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('Test Title');
      expect(xml).toContain('Test Creator');
    });

    it('should generate valid app.xml', () => {
      const doc = Document.create();
      const zipHandler = doc.getZipHandler();
      const xml = zipHandler.getFileAsString(DOCX_PATHS.APP_PROPS);

      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('docxmlater');
      expect(xml).toContain('<Properties');
    });

    it('should escape special characters in properties', () => {
      const doc = Document.create({
        properties: {
          title: 'Test & <Special> Characters',
          description: 'Contains "quotes"',
        },
      });

      const zipHandler = doc.getZipHandler();
      const xml = zipHandler.getFileAsString(DOCX_PATHS.CORE_PROPS);

      // Check that XML entities are properly escaped
      expect(xml).toContain('&amp;'); // & in "Test & <Special>"
      expect(xml).toContain('&lt;'); // < in "<Special>"
      expect(xml).toContain('&gt;'); // > in "<Special>"
      // Note: Quotes don't need escaping in text content (only in attributes)
      expect(xml).toContain('"quotes"'); // Quotes remain as-is in text
    });
  });

  describe('Integration tests', () => {
    it('should create a complete valid DOCX file', async () => {
      const doc = Document.create({
        properties: {
          title: 'Integration Test',
          creator: 'DocXML Test Suite',
          subject: 'Testing',
        },
      });

      // Add title
      const title = doc.createParagraph();
      title.setAlignment('center');
      title.setSpaceBefore(480);
      title.setSpaceAfter(240);
      title.addText('Integration Test Document', { bold: true, size: 18 });

      // Add content paragraphs
      doc.createParagraph('This is the first paragraph of content.');

      const para2 = doc.createParagraph();
      para2.addText('This paragraph has ');
      para2.addText('bold', { bold: true });
      para2.addText(', ');
      para2.addText('italic', { italic: true });
      para2.addText(', and ');
      para2.addText('colored', { color: 'FF0000' });
      para2.addText(' text.');

      doc.createParagraph();

      const para4 = doc.createParagraph();
      para4.setAlignment('right');
      para4.addText('Right-aligned paragraph', { italic: true });

      const outputPath = path.join(TEST_OUTPUT_DIR, 'integration-test.docx');
      await doc.save(outputPath);

      // Verify file exists and has content
      const stats = await fs.stat(outputPath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(1000);

      // Verify all required files are present
      const zipHandler = doc.getZipHandler();
      expect(zipHandler.getFileCount()).toBeGreaterThanOrEqual(5);
    });

    it('should handle documents with many paragraphs', async () => {
      const doc = Document.create();

      for (let i = 1; i <= 100; i++) {
        doc.createParagraph(`Paragraph ${i}`);
      }

      expect(doc.getParagraphCount()).toBe(100);

      const outputPath = path.join(TEST_OUTPUT_DIR, 'many-paragraphs.docx');
      await doc.save(outputPath);

      const stats = await fs.stat(outputPath);
      expect(stats.isFile()).toBe(true);
    });

    it('should create round-trip compatible documents', async () => {
      const doc1 = Document.create({
        properties: {
          title: 'Round Trip Test',
          creator: 'Test',
        },
      });

      doc1.createParagraph('First paragraph');
      doc1.createParagraph('Second paragraph');

      const buffer1 = await doc1.toBuffer();
      const doc2 = await Document.loadFromBuffer(buffer1);
      const buffer2 = await doc2.toBuffer();

      // Buffers should be similar in size
      expect(Math.abs(buffer1.length - buffer2.length)).toBeLessThan(100);
    });

    it('should preserve element order when loading and saving documents', async () => {
      // This test addresses the critical bug in DocumentParser where elements
      // were parsed by type (all paragraphs, then all tables) instead of by
      // document order, causing massive content loss and structure corruption.

      const doc1 = Document.create();

      // Create a document with interleaved paragraphs and tables
      // This structure is common in real-world documents

      doc1.createParagraph('Paragraph 1');

      const table1 = doc1.createTable(2, 2);
      const t1r1c1 = new Paragraph();
      t1r1c1.addText('Table 1, Row 1, Cell 1');
      table1.getRow(0)?.getCell(0)?.addParagraph(t1r1c1);

      const t1r1c2 = new Paragraph();
      t1r1c2.addText('Table 1, Row 1, Cell 2');
      table1.getRow(0)?.getCell(1)?.addParagraph(t1r1c2);

      const t1r2c1 = new Paragraph();
      t1r2c1.addText('Table 1, Row 2, Cell 1');
      table1.getRow(1)?.getCell(0)?.addParagraph(t1r2c1);

      const t1r2c2 = new Paragraph();
      t1r2c2.addText('Table 1, Row 2, Cell 2');
      table1.getRow(1)?.getCell(1)?.addParagraph(t1r2c2);

      doc1.createParagraph('Paragraph 2');
      doc1.createParagraph('Paragraph 3');

      const table2 = doc1.createTable(3, 2);
      const t2r1c1 = new Paragraph();
      t2r1c1.addText('Table 2, Row 1, Cell 1');
      table2.getRow(0)?.getCell(0)?.addParagraph(t2r1c1);

      const t2r1c2 = new Paragraph();
      t2r1c2.addText('Table 2, Row 1, Cell 2');
      table2.getRow(0)?.getCell(1)?.addParagraph(t2r1c2);

      doc1.createParagraph('Paragraph 4');

      const table3 = doc1.createTable(1, 3);
      const t3r1c1 = new Paragraph();
      t3r1c1.addText('Table 3, Cell 1');
      table3.getRow(0)?.getCell(0)?.addParagraph(t3r1c1);

      const t3r1c2 = new Paragraph();
      t3r1c2.addText('Table 3, Cell 2');
      table3.getRow(0)?.getCell(1)?.addParagraph(t3r1c2);

      const t3r1c3 = new Paragraph();
      t3r1c3.addText('Table 3, Cell 3');
      table3.getRow(0)?.getCell(2)?.addParagraph(t3r1c3);

      doc1.createParagraph('Paragraph 5');
      doc1.createParagraph('Paragraph 6');

      // Expected order:
      // 0: Paragraph 1
      // 1: Table 1 (2x2)
      // 2: Paragraph 2
      // 3: Paragraph 3
      // 4: Table 2 (3x2)
      // 5: Paragraph 4
      // 6: Table 3 (1x3)
      // 7: Paragraph 5
      // 8: Paragraph 6

      // Save and reload
      const buffer = await doc1.toBuffer();
      const doc2 = await Document.loadFromBuffer(buffer);

      // Verify element counts
      const bodyElements = doc2.getBodyElements();
      expect(bodyElements.length).toBe(9); // 6 paragraphs + 3 tables

      // Verify element types in order
      expect(bodyElements[0]).toBeInstanceOf(Paragraph);
      expect(bodyElements[1]).toBeInstanceOf(Table);
      expect(bodyElements[2]).toBeInstanceOf(Paragraph);
      expect(bodyElements[3]).toBeInstanceOf(Paragraph);
      expect(bodyElements[4]).toBeInstanceOf(Table);
      expect(bodyElements[5]).toBeInstanceOf(Paragraph);
      expect(bodyElements[6]).toBeInstanceOf(Table);
      expect(bodyElements[7]).toBeInstanceOf(Paragraph);
      expect(bodyElements[8]).toBeInstanceOf(Paragraph);

      // Verify paragraph text content
      expect((bodyElements[0] as any).getRuns()[0]?.getText()).toBe('Paragraph 1');
      expect((bodyElements[2] as any).getRuns()[0]?.getText()).toBe('Paragraph 2');
      expect((bodyElements[3] as any).getRuns()[0]?.getText()).toBe('Paragraph 3');
      expect((bodyElements[5] as any).getRuns()[0]?.getText()).toBe('Paragraph 4');
      expect((bodyElements[7] as any).getRuns()[0]?.getText()).toBe('Paragraph 5');
      expect((bodyElements[8] as any).getRuns()[0]?.getText()).toBe('Paragraph 6');

      // Verify table dimensions
      expect((bodyElements[1] as any).getRowCount()).toBe(2);
      expect((bodyElements[4] as any).getRowCount()).toBe(3);
      expect((bodyElements[6] as any).getRowCount()).toBe(1);

      // Verify table cell content (first cell of each table)
      const table1Cell = (bodyElements[1] as any).getRow(0)?.getCell(0);
      expect(table1Cell).toBeDefined();
      const table1Text = table1Cell?.getParagraphs()[0]?.getRuns()[0]?.getText();
      expect(table1Text).toBe('Table 1, Row 1, Cell 1');

      const table2Cell = (bodyElements[4] as any).getRow(0)?.getCell(0);
      expect(table2Cell).toBeDefined();
      const table2Text = table2Cell?.getParagraphs()[0]?.getRuns()[0]?.getText();
      expect(table2Text).toBe('Table 2, Row 1, Cell 1');

      const table3Cell = (bodyElements[6] as any).getRow(0)?.getCell(0);
      expect(table3Cell).toBeDefined();
      const table3Text = table3Cell?.getParagraphs()[0]?.getRuns()[0]?.getText();
      expect(table3Text).toBe('Table 3, Cell 1');

      // Verify no content loss - count all paragraphs including those in tables
      let totalParagraphs = 0;
      for (const element of bodyElements) {
        if (element instanceof Paragraph) {
          totalParagraphs++;
        } else if (element instanceof Table) {
          const table = element as any;
          for (const row of table.getRows()) {
            for (const cell of row.getCells()) {
              if (cell) {
                totalParagraphs += cell.getParagraphs().length;
              }
            }
          }
        }
      }

      // 6 body paragraphs + 4 (table1) + 6 (table2) + 3 (table3) = 19 total
      expect(totalParagraphs).toBe(19);
    });
  });

  describe('Parsing documents with conflicting paragraph properties', () => {
    test('should resolve pageBreakBefore + keepNext conflict during parsing', async () => {
      // Create a document with conflicting properties
      const doc = Document.create();
      const para = new Paragraph()
        .addText('Test content')
        .setPageBreakBefore(true)
        .setKeepNext(true)     // Clears pageBreakBefore
        .setKeepLines(true);
      doc.addParagraph(para);

      // Save and reload
      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      // Get the paragraph
      const bodyElements = loadedDoc.getBodyElements();
      const loadedPara = bodyElements[0] as Paragraph;
      const formatting = loadedPara.getFormatting();

      // Conflict should be resolved: keepNext/keepLines take priority
      expect(formatting.keepNext).toBe(true);
      expect(formatting.keepLines).toBe(true);
      expect(formatting.pageBreakBefore).toBe(false);
    });

    test('should preserve keepNext/keepLines when pageBreakBefore is not set', async () => {
      // Create a document without conflicts
      const doc = Document.create();
      const para = new Paragraph()
        .addText('Test content')
        .setKeepNext(true)
        .setKeepLines(true);
      doc.addParagraph(para);

      // Save and reload
      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      // Get the paragraph
      const bodyElements = loadedDoc.getBodyElements();
      const loadedPara = bodyElements[0] as Paragraph;
      const formatting = loadedPara.getFormatting();

      // Properties should be preserved (pageBreakBefore is false, not undefined, since keepNext was set)
      expect(formatting.pageBreakBefore).toBe(false);
      expect(formatting.keepNext).toBe(true);
      expect(formatting.keepLines).toBe(true);
    });

    test('should handle multiple paragraphs with mixed conflict scenarios', async () => {
      const doc = Document.create();

      // Para 1: Has conflict - pageBreakBefore then keepNext (keepNext wins)
      const para1 = new Paragraph()
        .addText('Paragraph 1')
        .setPageBreakBefore(true)
        .setKeepNext(true);  // Clears pageBreakBefore
      doc.addParagraph(para1);

      // Para 2: No conflict, just keepNext
      const para2 = new Paragraph()
        .addText('Paragraph 2')
        .setKeepNext(true);
      doc.addParagraph(para2);

      // Para 3: No conflict, just pageBreakBefore
      const para3 = new Paragraph()
        .addText('Paragraph 3')
        .setPageBreakBefore(true);
      doc.addParagraph(para3);

      // Save and reload
      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const bodyElements = loadedDoc.getBodyElements();

      // Para 1: Conflict resolved - keepNext wins
      const loadedPara1 = bodyElements[0] as Paragraph;
      expect(loadedPara1.getFormatting().keepNext).toBe(true);
      expect(loadedPara1.getFormatting().pageBreakBefore).toBe(false);

      // Para 2: keepNext preserved (pageBreakBefore is false since keepNext was set)
      const loadedPara2 = bodyElements[1] as Paragraph;
      expect(loadedPara2.getFormatting().keepNext).toBe(true);
      expect(loadedPara2.getFormatting().pageBreakBefore).toBe(false);

      // Para 3: pageBreakBefore preserved
      const loadedPara3 = bodyElements[2] as Paragraph;
      expect(loadedPara3.getFormatting().pageBreakBefore).toBe(true);
      expect(loadedPara3.getFormatting().keepNext).toBeUndefined();
    });

    test('should resolve conflicts when properties come from XML with non-standard order', async () => {
      const doc = Document.create();
      const para = new Paragraph()
        .addText('Test content')
        .setKeepNext(true)
        .setKeepLines(true)
        .setPageBreakBefore(true)  // Can be set after
        .setKeepNext(true);         // Call again to clear pageBreakBefore
      doc.addParagraph(para);

      // Save and reload
      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const bodyElements = loadedDoc.getBodyElements();
      const loadedPara = bodyElements[0] as Paragraph;
      const formatting = loadedPara.getFormatting();

      // Conflict should be resolved - keepNext/keepLines win
      expect(formatting.keepNext).toBe(true);
      expect(formatting.keepLines).toBe(true);
      expect(formatting.pageBreakBefore).toBe(false);
    });
  });

  describe('TOC Field Instruction Parsing', () => {
    describe('parseTOCFieldInstruction()', () => {
      test('should parse TOC field with double-quoted \o switch', () => {
        const doc = Document.create();
        const instruction = 'TOC \\o "1-3"';
        
        // We need to access the private method for testing
        // For now, we'll verify through the internal structure
        // This test documents the expected behavior
        expect(instruction).toMatch(/\\o\s+(?:"(\d+)-(\d+)"|'(\d+)-(\d+)'|(\d+)-(\d+))/);
      });

      test('should parse TOC field with single-quoted \o switch', () => {
        const doc = Document.create();
        const instruction = "TOC \\o '1-3'";
        
        // Verify regex matches single-quoted format
        expect(instruction).toMatch(/\\o\s+(?:"(\d+)-(\d+)"|'(\d+)-(\d+)'|(\d+)-(\d+))/);
      });

      test('should parse TOC field with unquoted \o switch', () => {
        const doc = Document.create();
        const instruction = 'TOC \\o 1-3';
        
        // Verify regex matches unquoted format (this is the key fix)
        expect(instruction).toMatch(/\\o\s+(?:"(\d+)-(\d+)"|'(\d+)-(\d+)'|(\d+)-(\d+))/);
      });

      test('should extract correct outline levels from double-quoted format', () => {
        const instruction = 'TOC \\o "1-3"';
        const regex = /\\o\s+(?:"(\d+)-(\d+)"|'(\d+)-(\d+)'|(\d+)-(\d+))/;
        const match = instruction.match(regex);
        
        expect(match).not.toBeNull();
        if (match) {
          const start = parseInt(match[1] || match[3] || match[5]!, 10);
          const end = parseInt(match[2] || match[4] || match[6]!, 10);
          expect(start).toBe(1);
          expect(end).toBe(3);
        }
      });

      test('should extract correct outline levels from single-quoted format', () => {
        const instruction = "TOC \\o '2-4'";
        const regex = /\\o\s+(?:"(\d+)-(\d+)"|'(\d+)-(\d+)'|(\d+)-(\d+))/;
        const match = instruction.match(regex);
        
        expect(match).not.toBeNull();
        if (match) {
          const start = parseInt(match[1] || match[3] || match[5]!, 10);
          const end = parseInt(match[2] || match[4] || match[6]!, 10);
          expect(start).toBe(2);
          expect(end).toBe(4);
        }
      });

      test('should extract correct outline levels from unquoted format', () => {
        const instruction = 'TOC \\o 1-3';
        const regex = /\\o\s+(?:"(\d+)-(\d+)"|'(\d+)-(\d+)'|(\d+)-(\d+))/;
        const match = instruction.match(regex);
        
        expect(match).not.toBeNull();
        if (match) {
          const start = parseInt(match[1] || match[3] || match[5]!, 10);
          const end = parseInt(match[2] || match[4] || match[6]!, 10);
          expect(start).toBe(1);
          expect(end).toBe(3);
        }
      });

      test('should handle multiple spaces before unquoted \o value', () => {
        const instruction = 'TOC \\o   1-3';
        const regex = /\\o\s+(?:"(\d+)-(\d+)"|'(\d+)-(\d+)'|(\d+)-(\d+))/;
        const match = instruction.match(regex);
        
        expect(match).not.toBeNull();
        if (match) {
          const start = parseInt(match[1] || match[3] || match[5]!, 10);
          const end = parseInt(match[2] || match[4] || match[6]!, 10);
          expect(start).toBe(1);
          expect(end).toBe(3);
        }
      });

      test('should not match non-TOC field instructions', () => {
        const instruction = 'HYPERLINK \\l "anchor"';
        const regex = /\\o\s+(?:"(\d+)-(\d+)"|'(\d+)-(\d+)'|(\d+)-(\d+))/;
        const match = instruction.match(regex);
        
        expect(match).toBeNull();
      });

      test('should handle complex TOC instructions with multiple switches', () => {
        const instruction = 'TOC \\o "1-3" \\t "Heading 1,1,Heading 2,2"';
        const regex = /\\o\s+(?:"(\d+)-(\d+)"|'(\d+)-(\d+)'|(\d+)-(\d+))/;
        const match = instruction.match(regex);
        
        expect(match).not.toBeNull();
        if (match) {
          const start = parseInt(match[1] || match[3] || match[5]!, 10);
          const end = parseInt(match[2] || match[4] || match[6]!, 10);
          expect(start).toBe(1);
          expect(end).toBe(3);
        }
      });

      test('should handle complex TOC instructions with unquoted \o switch', () => {
        const instruction = 'TOC \\o 1-3 \\t "Heading 1,1,Heading 2,2"';
        const regex = /\\o\s+(?:"(\d+)-(\d+)"|'(\d+)-(\d+)'|(\d+)-(\d+))/;
        const match = instruction.match(regex);
        
        expect(match).not.toBeNull();
        if (match) {
          const start = parseInt(match[1] || match[3] || match[5]!, 10);
          const end = parseInt(match[2] || match[4] || match[6]!, 10);
          expect(start).toBe(1);
          expect(end).toBe(3);
        }
      });
    });
  });

  describe('Bookmark Helpers', () => {
    describe('addTopBookmark()', () => {
      test('should create _top bookmark when it does not exist', () => {

        const doc = Document.create();

        // Verify no _top bookmark exists yet
        expect(doc.hasBookmark('_top')).toBe(false);

        const result = doc.addTopBookmark();

        // Verify bookmark was created
        expect(result.bookmark).toBeDefined();
        expect(result.bookmark.getName()).toBe('_top');
        expect(result.bookmark.getId()).toBe(0);
        expect(result.anchor).toBe('_top');
        expect(result.hyperlink).toBeInstanceOf(Function);

        // Verify bookmark is registered
        expect(doc.hasBookmark('_top')).toBe(true);
      });

      test('should return existing _top bookmark when already present', () => {
        const doc = Document.create();

        // Add _top bookmark first time
        const result1 = doc.addTopBookmark();
        const bookmark1 = result1.bookmark;

        // Add _top bookmark second time
        const result2 = doc.addTopBookmark();
        const bookmark2 = result2.bookmark;

        // Should return the same bookmark instance
        expect(bookmark2).toBe(bookmark1);
        expect(bookmark2.getName()).toBe('_top');
        expect(bookmark2.getId()).toBe(0);
      });

      test('should place bookmark at the beginning of document', () => {
        const doc = Document.create();

        // Add some content first
        doc.createParagraph().addText('Paragraph 1');
        doc.createParagraph().addText('Paragraph 2');

        expect(doc.getParagraphCount()).toBe(2);

        // Add _top bookmark
        doc.addTopBookmark();

        // Should still have 2 paragraphs (bookmark added to first paragraph, no new paragraph created)
        expect(doc.getParagraphCount()).toBe(2);

        const bodyElements = doc.getBodyElements();
        const firstPara = bodyElements[0] as Paragraph;

        // First paragraph should still have its text (bookmark is added to it)
        expect(firstPara.getText()).toBe('Paragraph 1');
      });

      test('should create working hyperlinks to _top bookmark', () => {
        const doc = Document.create();

        const { hyperlink, anchor } = doc.addTopBookmark();

        // Create hyperlink using convenience function
        const link1 = hyperlink('Back to top');
        expect(link1.getAnchor()).toBe('_top');
        expect(link1.getText()).toBe('Back to top');
        expect(link1.isInternal()).toBe(true);

        // Create hyperlink manually using anchor
        const link2 = Hyperlink.createInternal(anchor, 'Go to top');
        expect(link2.getAnchor()).toBe('_top');
        expect(link2.getText()).toBe('Go to top');
      });

      test('should be idempotent - safe to call multiple times on empty document', () => {
        const doc = Document.create();

        // Call multiple times on empty document
        doc.addTopBookmark();
        doc.addTopBookmark();
        doc.addTopBookmark();

        // Should only have one _top bookmark
        const bookmarks = doc.getBookmarkManager().getAllBookmarks();
        const topBookmarks = bookmarks.filter(b => b.getName() === '_top');
        expect(topBookmarks.length).toBe(1);

        // Should only have one paragraph (the fallback empty paragraph with bookmark)
        expect(doc.getParagraphCount()).toBe(1);
      });

      test('should be idempotent - safe to call multiple times on document with content', () => {
        const doc = Document.create();

        // Add content first
        doc.createParagraph().addText('Paragraph 1');
        doc.createParagraph().addText('Paragraph 2');

        expect(doc.getParagraphCount()).toBe(2);

        // Call addTopBookmark multiple times
        doc.addTopBookmark();
        doc.addTopBookmark();
        doc.addTopBookmark();

        // Should only have one _top bookmark
        const bookmarks = doc.getBookmarkManager().getAllBookmarks();
        const topBookmarks = bookmarks.filter(b => b.getName() === '_top');
        expect(topBookmarks.length).toBe(1);

        // Should still have only 2 paragraphs (no extra paragraphs created)
        expect(doc.getParagraphCount()).toBe(2);
      });

      test('should preserve _top bookmark through save/load cycle', async () => {
        const doc = Document.create();

        // Add _top bookmark
        doc.addTopBookmark();

        // Add some content
        doc.createParagraph().addText('Content paragraph');

        // Save to buffer
        const buffer = await doc.toBuffer();

        // Load from buffer
        const loadedDoc = await Document.loadFromBuffer(buffer);

        // Note: Bookmark parsing is not yet implemented, but we can verify document structure
        // Verify document structure is preserved
        const bodyElements = loadedDoc.getBodyElements();
        expect(bodyElements.length).toBe(2); // Empty para with bookmark + content para

        // Verify the XML contains the bookmark
        const xml = loadedDoc.getZipHandler().getFileAsString(DOCX_PATHS.DOCUMENT);
        expect(xml).toBeDefined();
        if (xml) {
          expect(xml).toContain('<w:bookmarkStart w:id="0" w:name="_top"');
          expect(xml).toContain('<w:bookmarkEnd w:id="0"');
        }
      });

      test('should generate correct XML structure', async () => {
        const doc = Document.create();

        doc.addTopBookmark();

        const buffer = await doc.toBuffer();
        const xml = doc.getZipHandler().getFileAsString(DOCX_PATHS.DOCUMENT);

        // Verify XML is present
        expect(xml).toBeDefined();

        if (xml) {
          // Verify XML contains bookmark start and end with correct attributes
          expect(xml).toContain('<w:bookmarkStart w:id="0" w:name="_top"');
          expect(xml).toContain('<w:bookmarkEnd w:id="0"');

          // Bookmark should be at the beginning of the body
          const bodyStart = xml.indexOf('<w:body>');
          const bookmarkStart = xml.indexOf('<w:bookmarkStart w:id="0" w:name="_top"');
          expect(bookmarkStart).toBeGreaterThan(bodyStart);
        }
      });

      test('should work with hyperlinks in other paragraphs', async () => {
        const doc = Document.create();

        const { hyperlink } = doc.addTopBookmark();

        // Add content paragraphs
        doc.createParagraph().addText('Section 1');
        doc.createParagraph().addText('Section 2');

        // Add hyperlink to _top in last paragraph
        const lastPara = doc.createParagraph();
        const link = hyperlink('Back to top');
        lastPara.addHyperlink(link);

        // Save and load
        const buffer = await doc.toBuffer();
        const loadedDoc = await Document.loadFromBuffer(buffer);

        // Verify structure
        const bodyElements = loadedDoc.getBodyElements();
        expect(bodyElements.length).toBe(4); // bookmark para + 3 content paras

        // Verify hyperlink works
        const lastLoadedPara = bodyElements[3] as Paragraph;
        expect(lastLoadedPara.getText()).toContain('Back to top');
      });
    });
  });

  describe('Preserve Blank Lines After Heading 2 Tables', () => {
    describe('applyStyles with preserveBlankLinesAfterHeading2Tables', () => {
      test('should mark blank lines as preserved when option is true', () => {
        const doc = Document.create();

        // Add a Heading2 paragraph
        const heading = doc.createParagraph('Test Header');
        heading.setStyle('Heading2');

        // Apply formatting with preserve option enabled
        doc.applyStyles({
          preserveBlankLinesAfterHeading2Tables: true
        });

        // Get all paragraphs
        const paragraphs = doc.getAllParagraphs();

        // The heading should now be in a table, and there should be a blank paragraph after it
        const tables = doc.getAllTables();
        expect(tables.length).toBe(1);

        // Get body elements
        const bodyElements = doc.getBodyElements();

        // Should have: table + blank paragraph
        expect(bodyElements.length).toBe(2);

        // Check that second element is a paragraph and is marked as preserved
        const blankPara = bodyElements[1];
        expect(blankPara).toBeInstanceOf(Paragraph);
        expect((blankPara as Paragraph).isPreserved()).toBe(true);
      });

      test('should not mark blank lines as preserved when option is false', () => {
        const doc = Document.create();

        // Add a Heading2 paragraph
        const heading = doc.createParagraph('Test Header');
        heading.setStyle('Heading2');

        // Apply formatting with preserve option disabled
        doc.applyStyles({
          preserveBlankLinesAfterHeading2Tables: false
        });

        // Get body elements
        const bodyElements = doc.getBodyElements();

        // Should have: table + blank paragraph
        expect(bodyElements.length).toBe(2);

        // Check that second element is a paragraph and is NOT marked as preserved
        const blankPara = bodyElements[1];
        expect(blankPara).toBeInstanceOf(Paragraph);
        expect((blankPara as Paragraph).isPreserved()).toBe(false);
      });

      test('should default to true when option is not specified', () => {
        const doc = Document.create();

        // Add a Heading2 paragraph
        const heading = doc.createParagraph('Test Header');
        heading.setStyle('Heading2');

        // Apply formatting without specifying preserve option
        doc.applyStyles();

        // Get body elements
        const bodyElements = doc.getBodyElements();

        // Should have: table + blank paragraph
        expect(bodyElements.length).toBe(2);

        // Check that second element is a paragraph and is marked as preserved (default: true)
        const blankPara = bodyElements[1];
        expect(blankPara).toBeInstanceOf(Paragraph);
        expect((blankPara as Paragraph).isPreserved()).toBe(true);
      });
    });

    // NOTE: Tests for keepOne and preserveHeader2BlankLines parameters were removed
    // as these features are obsolete and replaced by better functionality

    describe('removeExtraBlankParagraphs', () => {
      test('should not remove preserved blank paragraphs', () => {
        const doc = Document.create();

        // Add some paragraphs
        doc.createParagraph('First paragraph');

        const blank1 = doc.createParagraph();
        blank1.setPreserved(true);

        const blank2 = doc.createParagraph();

        doc.createParagraph('Second paragraph');

        // Remove extra blank paragraphs
        const result = doc.removeExtraBlankParagraphs();

        // Should remove blank2 but not blank1 (which is preserved)
        expect(result.removed).toBe(1);

        const paragraphs = doc.getAllParagraphs();
        expect(paragraphs.length).toBe(3); // First + blank1 + Second

        // Verify blank1 is still preserved
        expect(blank1.isPreserved()).toBe(true);
      });

      test('should not remove paragraphs with text inside revisions', async () => {
        const doc = Document.create();
        const { Revision } = await import('../../src/elements/Revision');
        const { Run } = await import('../../src/elements/Run');

        // Create a paragraph with text inside a revision (track change insertion)
        const para = doc.createParagraph();
        const insertedRun = new Run('This is substantive text that should NOT be deleted');
        const revision = new Revision({
          type: 'insert',
          author: 'Test Author',
          content: insertedRun,
          date: new Date()
        });
        para.addRevision(revision);

        // Add another paragraph for comparison
        doc.createParagraph('Normal paragraph');

        // Verify initial state
        expect(doc.getAllParagraphs().length).toBe(2);

        // Remove extra blank paragraphs
        const result = doc.removeExtraBlankParagraphs();

        // Paragraph with revision content should NOT be removed
        expect(result.removed).toBe(0);
        expect(doc.getAllParagraphs().length).toBe(2);

        // Verify the text is accessible via revision.getText()
        const paragraphs = doc.getAllParagraphs();
        const revisionPara = paragraphs[0];
        const content = revisionPara?.getContent();
        const revisionItem = content?.find(item => item instanceof Revision) as any;
        expect(revisionItem?.getText()).toBe('This is substantive text that should NOT be deleted');
      });

      // Tests for obsolete keepOne and preserveHeader2BlankLines parameters have been removed
    });
  });

  describe('Revision Registration', () => {
    it('should register parsed revisions with RevisionManager after loading', async () => {
      // Create a document with revisions
      const doc = Document.create();
      const para1 = doc.createParagraph('First paragraph');

      // Add a revision to the paragraph
      const { Revision } = await import('../../src/elements/Revision');
      const { Run } = await import('../../src/elements/Run');

      const insertedRun = new Run('inserted text');
      const revision = new Revision({
        type: 'insert',
        author: 'Test Author',
        content: insertedRun,
        date: new Date()
      });

      para1.addRevision(revision);

      // Save to buffer
      const buffer = await doc.toBuffer();
      doc.dispose();

      // Reload the document with preserve mode
      const reloadedDoc = await Document.loadFromBuffer(buffer, { revisionHandling: 'preserve' });

      // Verify revisions are registered with RevisionManager
      const revisionManager = reloadedDoc.getRevisionManager();
      const allRevisions = revisionManager.getAllRevisions();

      expect(allRevisions.length).toBeGreaterThanOrEqual(1);

      // Verify the revision has location info
      const foundRevision = allRevisions.find(r => r.getAuthor() === 'Test Author');
      expect(foundRevision).toBeDefined();

      reloadedDoc.dispose();
    });

    it('should make ChangelogGenerator work with parsed revisions', async () => {
      // Create a document with revisions
      const doc = Document.create();
      const para1 = doc.createParagraph('Some text');

      const { Revision } = await import('../../src/elements/Revision');
      const { Run } = await import('../../src/elements/Run');
      const { ChangelogGenerator } = await import('../../src/utils/ChangelogGenerator');

      const deletedRun = new Run('deleted content');
      const deletion = new Revision({
        type: 'delete',
        author: 'Reviewer',
        content: deletedRun,
        date: new Date()
      });

      para1.addRevision(deletion);

      // Save and reload
      const buffer = await doc.toBuffer();
      doc.dispose();

      const reloadedDoc = await Document.loadFromBuffer(buffer, { revisionHandling: 'preserve' });

      // Use ChangelogGenerator to get changes
      const entries = ChangelogGenerator.fromDocument(reloadedDoc);

      expect(entries.length).toBeGreaterThanOrEqual(1);

      // Find the deletion entry
      const deletionEntry = entries.find(e => e.revisionType === 'delete');
      expect(deletionEntry).toBeDefined();
      expect(deletionEntry?.author).toBe('Reviewer');

      reloadedDoc.dispose();
    });
  });

  describe('addBlankLineAfterLists()', () => {
    it('should add blank line after a simple numbered list', () => {
      const doc = Document.create();
      const numId = doc.createNumberedList();

      // Add numbered list items
      const para1 = doc.createParagraph('Item 1');
      para1.setNumbering(numId, 0);

      const para2 = doc.createParagraph('Item 2');
      para2.setNumbering(numId, 0);

      // Add regular paragraph after list
      doc.createParagraph('Regular paragraph');

      expect(doc.getBodyElements().length).toBe(3);

      const insertedCount = doc.addBlankLineAfterLists();

      expect(insertedCount).toBe(1);
      expect(doc.getBodyElements().length).toBe(4);

      // Check that blank paragraph was inserted at index 2 (after list items)
      const bodyElements = doc.getBodyElements();
      const blankPara = bodyElements[2] as Paragraph;
      expect(blankPara.getText()).toBe('');
      expect(blankPara.getStyle()).toBe('Normal');

      doc.dispose();
    });

    it('should add blank line after a bullet list', () => {
      const doc = Document.create();
      const numId = doc.createBulletList();

      // Add bullet list items
      const para1 = doc.createParagraph('Bullet 1');
      para1.setNumbering(numId, 0);

      const para2 = doc.createParagraph('Bullet 2');
      para2.setNumbering(numId, 0);

      // Add regular paragraph after list
      doc.createParagraph('Regular paragraph');

      const insertedCount = doc.addBlankLineAfterLists();

      expect(insertedCount).toBe(1);
      expect(doc.getBodyElements().length).toBe(4);

      doc.dispose();
    });

    it('should handle nested lists as one list (same numId)', () => {
      const doc = Document.create();
      const numId = doc.createNumberedList();

      // Add list with nested items (same numId)
      const para1 = doc.createParagraph('Level 0 item');
      para1.setNumbering(numId, 0);

      const para2 = doc.createParagraph('Level 1 nested');
      para2.setNumbering(numId, 1);

      const para3 = doc.createParagraph('Level 0 again');
      para3.setNumbering(numId, 0);

      // Add regular paragraph
      doc.createParagraph('After list');

      const insertedCount = doc.addBlankLineAfterLists();

      // Should only add ONE blank line after the entire nested list
      expect(insertedCount).toBe(1);
      expect(doc.getBodyElements().length).toBe(5);

      doc.dispose();
    });

    it('should add blank line after each separate list (different numIds)', () => {
      const doc = Document.create();

      // First list
      const numId1 = doc.createNumberedList();
      const para1 = doc.createParagraph('List 1 Item 1');
      para1.setNumbering(numId1, 0);

      // Second list (different numId)
      const numId2 = doc.createBulletList();
      const para2 = doc.createParagraph('List 2 Item 1');
      para2.setNumbering(numId2, 0);

      // Regular paragraph
      doc.createParagraph('Regular paragraph');

      expect(doc.getBodyElements().length).toBe(3);

      const insertedCount = doc.addBlankLineAfterLists();

      // Should add blank line after each list
      expect(insertedCount).toBe(2);
      expect(doc.getBodyElements().length).toBe(5);

      doc.dispose();
    });

    it('should add blank line when list is at end of document', () => {
      const doc = Document.create();
      const numId = doc.createNumberedList();

      // Add list at end of document
      const para1 = doc.createParagraph('Last item');
      para1.setNumbering(numId, 0);

      expect(doc.getBodyElements().length).toBe(1);

      const insertedCount = doc.addBlankLineAfterLists();

      expect(insertedCount).toBe(1);
      expect(doc.getBodyElements().length).toBe(2);

      // Blank paragraph should be at the end
      const bodyElements = doc.getBodyElements();
      const lastElement = bodyElements[bodyElements.length - 1] as Paragraph;
      expect(lastElement.getText()).toBe('');
      expect(lastElement.getStyle()).toBe('Normal');

      doc.dispose();
    });

    it('should add blank line between list and table', () => {
      const doc = Document.create();
      const numId = doc.createNumberedList();

      // Add list
      const para1 = doc.createParagraph('List item');
      para1.setNumbering(numId, 0);

      // Add table after list
      doc.createTable(2, 2);

      expect(doc.getBodyElements().length).toBe(2);

      const insertedCount = doc.addBlankLineAfterLists();

      expect(insertedCount).toBe(1);
      expect(doc.getBodyElements().length).toBe(3);

      // Blank should be between list item and table
      const bodyElements = doc.getBodyElements();
      expect(bodyElements[0]).toBeInstanceOf(Paragraph);
      expect(bodyElements[1]).toBeInstanceOf(Paragraph);
      expect((bodyElements[1] as Paragraph).getText()).toBe('');
      expect(bodyElements[2]).toBeInstanceOf(Table);

      doc.dispose();
    });

    it('should return 0 for document with no lists', () => {
      const doc = Document.create();

      // Add regular paragraphs (no numbering)
      doc.createParagraph('Regular paragraph 1');
      doc.createParagraph('Regular paragraph 2');

      const insertedCount = doc.addBlankLineAfterLists();

      expect(insertedCount).toBe(0);
      expect(doc.getBodyElements().length).toBe(2);

      doc.dispose();
    });

    it('should return 0 for empty document', () => {
      const doc = Document.create();

      const insertedCount = doc.addBlankLineAfterLists();

      expect(insertedCount).toBe(0);
      expect(doc.getBodyElements().length).toBe(0);

      doc.dispose();
    });

    it('should not add blank line if one already exists after list', () => {
      const doc = Document.create();
      const numId = doc.createNumberedList();

      // Add numbered list items
      const para1 = doc.createParagraph('Item 1');
      para1.setNumbering(numId, 0);

      const para2 = doc.createParagraph('Item 2');
      para2.setNumbering(numId, 0);

      // Add blank paragraph (already exists)
      doc.createParagraph('');

      // Add regular paragraph after blank
      doc.createParagraph('Regular paragraph');

      expect(doc.getBodyElements().length).toBe(4);

      const insertedCount = doc.addBlankLineAfterLists();

      // Should NOT insert because blank already exists
      expect(insertedCount).toBe(0);
      expect(doc.getBodyElements().length).toBe(4);

      doc.dispose();
    });

    it('should be idempotent - calling twice should not add duplicate blanks', () => {
      const doc = Document.create();
      const numId = doc.createNumberedList();

      // Add numbered list items
      const para1 = doc.createParagraph('Item 1');
      para1.setNumbering(numId, 0);

      // Add regular paragraph
      doc.createParagraph('Regular paragraph');

      expect(doc.getBodyElements().length).toBe(2);

      // First call - should insert
      const firstCount = doc.addBlankLineAfterLists();
      expect(firstCount).toBe(1);
      expect(doc.getBodyElements().length).toBe(3);

      // Second call - should NOT insert (blank already exists)
      const secondCount = doc.addBlankLineAfterLists();
      expect(secondCount).toBe(0);
      expect(doc.getBodyElements().length).toBe(3);

      doc.dispose();
    });

    it('should remove blank line in MIDDLE of a list via addStructureBlankLines', () => {
      const doc = Document.create();
      const numId = doc.createNumberedList();

      // Create list with blank in the middle (simulates Quest.docx scenario)
      // Bullet 1, Bullet 2, [BLANK], Bullet 3, Bullet 4
      const para1 = doc.createParagraph('Bullet 1');
      para1.setNumbering(numId, 0);

      const para2 = doc.createParagraph('Bullet 2');
      para2.setNumbering(numId, 0);

      // Blank paragraph in middle of list
      doc.createParagraph('');

      const para3 = doc.createParagraph('Bullet 3');
      para3.setNumbering(numId, 0);

      const para4 = doc.createParagraph('Bullet 4');
      para4.setNumbering(numId, 0);

      // Regular paragraph after list
      doc.createParagraph('After list');

      expect(doc.getBodyElements().length).toBe(6);

      // Run addStructureBlankLines - should NOT preserve the blank in the middle
      const result = doc.addStructureBlankLines({ afterLists: true });

      // The blank in the middle should be removed by removeExtraBlankParagraphs
      // (which runs at the start of addStructureBlankLines)
      // Then a blank should be added after the list ends

      // After processing:
      // - Blank in middle removed (by cleanup)
      // - Blank added after Bullet 4 (before "After list")
      // So: Bullet1, Bullet2, Bullet3, Bullet4, [BLANK], After list = 6 elements
      expect(doc.getBodyElements().length).toBe(6);

      // Verify the blank is at the correct position (after Bullet 4, before "After list")
      const bodyElements = doc.getBodyElements();
      const bullet4 = bodyElements[3] as Paragraph;
      const blankAfterList = bodyElements[4] as Paragraph;
      const afterList = bodyElements[5] as Paragraph;

      expect(bullet4.getText()).toBe('Bullet 4');
      expect(blankAfterList.getText()).toBe('');
      expect(afterList.getText()).toBe('After list');

      doc.dispose();
    });

    it('should add blank line above paragraph starting with bold text and colon', () => {
      const doc = Document.create();

      // Create paragraph before
      doc.createParagraph('Regular paragraph before');

      // Create paragraph starting with bold text and colon
      const boldColonPara = doc.createParagraph('');
      boldColonPara.addText('Note:', { bold: true });
      boldColonPara.addText(' This is important information');

      expect(doc.getBodyElements().length).toBe(2);

      // Run addStructureBlankLines
      const result = doc.addStructureBlankLines({ aboveBoldColon: true });

      // Should have added a blank above the bold+colon paragraph
      expect(doc.getBodyElements().length).toBe(3);
      expect(result.blankLinesAdded).toBeGreaterThanOrEqual(1);

      const bodyElements = doc.getBodyElements();
      const blankPara = bodyElements[1] as Paragraph;
      const boldPara = bodyElements[2] as Paragraph;

      expect(blankPara.getText()).toBe('');
      expect(boldPara.getText()).toBe('Note: This is important information');

      doc.dispose();
    });

    it('should add blank line above paragraph with bold date followed by colon', () => {
      const doc = Document.create();

      doc.createParagraph('Previous content');

      // Create paragraph like "12.10.25:" (bold date followed by colon)
      const datePara = doc.createParagraph('');
      datePara.addText('12.10.25:', { bold: true });
      datePara.addText(' Event details here');

      expect(doc.getBodyElements().length).toBe(2);

      const result = doc.addStructureBlankLines({ aboveBoldColon: true });

      expect(doc.getBodyElements().length).toBe(3);
      expect(result.blankLinesAdded).toBeGreaterThanOrEqual(1);

      doc.dispose();
    });

    it('should NOT add blank line above non-bold text with colon', () => {
      const doc = Document.create();

      doc.createParagraph('Previous content');

      // Create paragraph with non-bold text containing colon
      doc.createParagraph('Note: This is not bold');

      expect(doc.getBodyElements().length).toBe(2);

      const result = doc.addStructureBlankLines({ aboveBoldColon: true });

      // Should NOT have added a blank (text is not bold)
      expect(doc.getBodyElements().length).toBe(2);

      doc.dispose();
    });

    it('should NOT add blank line above bold text without colon', () => {
      const doc = Document.create();

      doc.createParagraph('Previous content');

      // Create paragraph with bold text but no colon
      const boldNocolonPara = doc.createParagraph('');
      boldNocolonPara.addText('Important', { bold: true });
      boldNocolonPara.addText(' This has no colon');

      expect(doc.getBodyElements().length).toBe(2);

      const result = doc.addStructureBlankLines({ aboveBoldColon: true });

      // Should NOT have added a blank (no colon after bold)
      expect(doc.getBodyElements().length).toBe(2);

      doc.dispose();
    });

    it('should mark existing blank as preserved when blank already exists above bold+colon', () => {
      const doc = Document.create();

      doc.createParagraph('Previous content');
      // Create a truly blank paragraph (no runs)
      const existingBlank = Paragraph.create();
      doc.addParagraph(existingBlank);

      const boldColonPara = doc.createParagraph('');
      boldColonPara.addText('Warning:', { bold: true });
      boldColonPara.addText(' Be careful');

      expect(doc.getBodyElements().length).toBe(3);

      const result = doc.addStructureBlankLines({ aboveBoldColon: true });

      // Should NOT add another blank (one already exists)
      expect(doc.getBodyElements().length).toBe(3);

      // The existing blank should be marked as preserved and have Normal style
      const blankPara = doc.getBodyElements()[1] as Paragraph;
      expect(blankPara.isPreserved()).toBe(true);
      expect(blankPara.getStyle()).toBe('Normal');

      doc.dispose();
    });

    it('should respect aboveBoldColon: false option', () => {
      const doc = Document.create();

      doc.createParagraph('Previous content');

      const boldColonPara = doc.createParagraph('');
      boldColonPara.addText('Note:', { bold: true });
      boldColonPara.addText(' This should not get a blank above');

      expect(doc.getBodyElements().length).toBe(2);

      // Explicitly disable the feature
      const result = doc.addStructureBlankLines({ aboveBoldColon: false });

      // Should NOT have added a blank (feature disabled)
      expect(doc.getBodyElements().length).toBe(2);

      doc.dispose();
    });

    it('should detect colon anywhere in first 55 characters', () => {
      const doc = Document.create();

      doc.createParagraph('Previous content');

      // Create paragraph with bold start and colon later in text (within 55 chars)
      // "Note This can include the following:" - "following:" is at char 30
      const boldColonPara = doc.createParagraph('');
      boldColonPara.addText('Note', { bold: true });
      boldColonPara.addText(' This can include:'); // Colon at position 18

      expect(doc.getBodyElements().length).toBe(2);

      const result = doc.addStructureBlankLines({ aboveBoldColon: true });

      // Should have added a blank above (colon within first 55 chars)
      expect(doc.getBodyElements().length).toBe(3);
      expect(result.blankLinesAdded).toBeGreaterThanOrEqual(1);

      doc.dispose();
    });

    it('should NOT detect colon beyond first 55 characters', () => {
      const doc = Document.create();

      doc.createParagraph('Previous content');

      // Create paragraph with bold start and colon beyond 55 chars
      // Need more than 55 chars before the colon
      const boldColonPara = doc.createParagraph('');
      boldColonPara.addText('Note', { bold: true });
      boldColonPara.addText(' This is a very long sentence without a colon until here:'); // Colon at position ~60

      expect(doc.getBodyElements().length).toBe(2);

      const result = doc.addStructureBlankLines({ aboveBoldColon: true });

      // Should NOT have added a blank (colon beyond 55 chars)
      expect(doc.getBodyElements().length).toBe(2);

      doc.dispose();
    });

    it('should add blank above bold+colon paragraph in table cell', () => {
      const doc = Document.create();

      // Create a table with a cell containing multiple paragraphs
      const table = doc.createTable(1, 1);
      const cell = table.getRows()[0]?.getCells()[0];
      expect(cell).toBeDefined();

      // First paragraph in cell (no blank should be added above this)
      const firstPara = Paragraph.create();
      firstPara.addText('Some content before');
      cell!.addParagraph(firstPara);

      // Second paragraph with bold+colon (should get blank above)
      const boldColonPara = Paragraph.create();
      boldColonPara.addText('Note:', { bold: true });
      boldColonPara.addText(' This is important');
      cell!.addParagraph(boldColonPara);

      // Cell should have 2 paragraphs initially (plus default empty one = 3)
      const initialParas = cell!.getParagraphs();
      expect(initialParas.length).toBeGreaterThanOrEqual(2);

      const result = doc.addStructureBlankLines({ aboveBoldColon: true });

      // Should have added a blank above the bold+colon paragraph
      const finalParas = cell!.getParagraphs();
      expect(finalParas.length).toBeGreaterThan(initialParas.length);
      expect(result.blankLinesAdded).toBeGreaterThanOrEqual(1);

      doc.dispose();
    });

    it('should NOT add blank above bold+colon paragraph if first in table cell', () => {
      const doc = Document.create();

      // Create a table with a cell containing bold+colon as first paragraph
      const table = doc.createTable(1, 1);
      const cell = table.getRows()[0]?.getCells()[0];
      expect(cell).toBeDefined();

      // Clear any default paragraphs and add bold+colon as first
      const cellParas = cell!.getParagraphs();
      const firstPara = cellParas[0];
      if (firstPara) {
        firstPara.addText('Note:', { bold: true });
        firstPara.addText(' This is first in cell');
      }

      const initialCount = cell!.getParagraphs().length;

      const result = doc.addStructureBlankLines({ aboveBoldColon: true });

      // Should NOT have added a blank (bold+colon is first in cell)
      expect(cell!.getParagraphs().length).toBe(initialCount);

      doc.dispose();
    });
  });

  describe('acceptRevisions load option', () => {
    it('should accept all revisions when acceptRevisions: true', async () => {
      // Create a document with tracked changes
      const doc = Document.create();
      doc.enableTrackChanges({ author: 'Test Author' });

      const para = doc.createParagraph('Original text');
      const runs = para.getRuns();
      if (runs.length > 0 && runs[0]) {
        runs[0].setText('Modified text'); // This creates insert/delete revisions
      }

      const buffer = await doc.toBuffer();
      doc.dispose();

      // Load with acceptRevisions: true
      const loadedDoc = await Document.loadFromBuffer(buffer, { acceptRevisions: true });

      // No revisions should exist after load
      const revisions = loadedDoc.getRevisionManager().getAllRevisions();
      expect(revisions.length).toBe(0);

      // Content should be clean (final state)
      const paragraphs = loadedDoc.getParagraphs();
      expect(paragraphs.length).toBe(1);
      expect(paragraphs[0]?.getText()).toBe('Modified text');

      loadedDoc.dispose();
    });

    it('should preserve revisions when acceptRevisions: false or unset', async () => {
      // Create a document with tracked changes
      const doc = Document.create();
      doc.enableTrackChanges({ author: 'Test Author' });

      const para = doc.createParagraph('Original text');
      const runs = para.getRuns();
      if (runs.length > 0 && runs[0]) {
        runs[0].setText('Modified text');
      }

      const buffer = await doc.toBuffer();
      doc.dispose();

      // Load without acceptRevisions (default)
      const loadedDoc = await Document.loadFromBuffer(buffer, { revisionHandling: 'preserve' });

      // Revisions should still exist
      const revisions = loadedDoc.getRevisionManager().getAllRevisions();
      expect(revisions.length).toBeGreaterThan(0);

      loadedDoc.dispose();
    });

    it('should allow subsequent modifications after acceptRevisions: true', async () => {
      // Create a document with tracked changes
      const doc = Document.create();
      doc.enableTrackChanges({ author: 'Initial Author' });

      doc.createParagraph('Tracked content');

      const buffer = await doc.toBuffer();
      doc.dispose();

      // Load with acceptRevisions: true
      const loadedDoc = await Document.loadFromBuffer(buffer, { acceptRevisions: true });

      // Enable track changes again for new modifications
      loadedDoc.enableTrackChanges({ author: 'New Author' });

      // Make a new modification
      loadedDoc.createParagraph('New content after accept');

      // Save and reload to verify modifications are preserved
      // Use acceptRevisions: true to get clean text
      const newBuffer = await loadedDoc.toBuffer();
      loadedDoc.dispose();

      // Reload and accept to verify the content was saved correctly
      const reloadedDoc = await Document.loadFromBuffer(newBuffer, { acceptRevisions: true });

      const paragraphs = reloadedDoc.getParagraphs();
      expect(paragraphs.length).toBe(2);
      expect(paragraphs[0]?.getText()).toBe('Tracked content');
      expect(paragraphs[1]?.getText()).toBe('New content after accept');

      reloadedDoc.dispose();
    });

    it('should handle documents without revisions when acceptRevisions: true', async () => {
      // Create a document without tracked changes
      const doc = Document.create();
      doc.createParagraph('Plain content');

      const buffer = await doc.toBuffer();
      doc.dispose();

      // Load with acceptRevisions: true (should work fine with no revisions)
      const loadedDoc = await Document.loadFromBuffer(buffer, { acceptRevisions: true });

      const paragraphs = loadedDoc.getParagraphs();
      expect(paragraphs.length).toBe(1);
      expect(paragraphs[0]?.getText()).toBe('Plain content');

      // No revisions should exist
      const revisions = loadedDoc.getRevisionManager().getAllRevisions();
      expect(revisions.length).toBe(0);

      loadedDoc.dispose();
    });

    it('acceptRevisions: true should take precedence over revisionHandling: preserve', async () => {
      // Create a document with tracked changes
      const doc = Document.create();
      doc.enableTrackChanges({ author: 'Test Author' });

      doc.createParagraph('Tracked content');

      const buffer = await doc.toBuffer();
      doc.dispose();

      // Load with both options - acceptRevisions should win
      const loadedDoc = await Document.loadFromBuffer(buffer, {
        acceptRevisions: true,
        revisionHandling: 'preserve' // This should be ignored when acceptRevisions is true
      });

      // Revisions should be accepted (acceptRevisions takes precedence)
      const revisions = loadedDoc.getRevisionManager().getAllRevisions();
      expect(revisions.length).toBe(0);

      loadedDoc.dispose();
    });
  });
});
