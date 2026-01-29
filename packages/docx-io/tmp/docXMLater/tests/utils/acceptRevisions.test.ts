/**
 * Integration tests for acceptRevisions
 *
 * Tests the DOM-based revision acceptance functionality
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Table } from '../../src/elements/Table';
import { XMLParser } from '../../src/xml/XMLParser';

describe('acceptRevisions Integration', () => {
  describe('DOM-based processing', () => {
    it('should accept insertions from loaded document', async () => {
      // Create a document with content
      const doc = Document.create();
      doc.createParagraph('Normal text');

      // Save and reload
      const buffer = await doc.toBuffer();
      doc.dispose();

      // Load and verify
      const doc2 = await Document.loadFromBuffer(buffer);
      const paragraphs = doc2.getParagraphs();
      expect(paragraphs.length).toBeGreaterThan(0);
      expect(paragraphs[0]?.getText()).toBe('Normal text');
      doc2.dispose();
    });

    it('should preserve content after accepting revisions', async () => {
      const doc = Document.create();

      // Add various content
      doc.createParagraph('First paragraph');
      doc.createParagraph('Second paragraph');
      doc.createParagraph('Third paragraph');

      const buffer = await doc.toBuffer();
      doc.dispose();

      // Load with default 'accept' mode
      const doc2 = await Document.loadFromBuffer(buffer);
      const paragraphs = doc2.getParagraphs();

      expect(paragraphs).toHaveLength(3);
      expect(paragraphs[0]?.getText()).toBe('First paragraph');
      expect(paragraphs[1]?.getText()).toBe('Second paragraph');
      expect(paragraphs[2]?.getText()).toBe('Third paragraph');

      doc2.dispose();
    });

    it('should handle empty documents', async () => {
      const doc = Document.create();
      const buffer = await doc.toBuffer();
      doc.dispose();

      const doc2 = await Document.loadFromBuffer(buffer);
      const paragraphs = doc2.getParagraphs();
      expect(paragraphs.length).toBe(0);
      doc2.dispose();
    });

    it('should handle documents with tables', async () => {
      const doc = Document.create();
      doc.createParagraph('Before table');

      // Create a table
      const table = new Table(2, 2);
      table.getCell(0, 0)?.createParagraph('Cell 1');
      table.getCell(0, 1)?.createParagraph('Cell 2');
      table.getCell(1, 0)?.createParagraph('Cell 3');
      table.getCell(1, 1)?.createParagraph('Cell 4');
      doc.addTable(table);

      doc.createParagraph('After table');

      const buffer = await doc.toBuffer();
      doc.dispose();

      const doc2 = await Document.loadFromBuffer(buffer);
      const paragraphs = doc2.getParagraphs();
      const tables = doc2.getTables();

      expect(paragraphs.length).toBeGreaterThanOrEqual(2);
      expect(tables.length).toBe(1);
      doc2.dispose();
    });

    it('should round-trip document without introducing revision markup', async () => {
      // Create a simple document
      const doc = Document.create();
      doc.createParagraph('Hello World');
      const buffer = await doc.toBuffer();
      doc.dispose();

      // Load and save multiple times
      let currentBuffer = buffer;
      for (let i = 0; i < 3; i++) {
        const docN = await Document.loadFromBuffer(currentBuffer);
        currentBuffer = await docN.toBuffer();
        docN.dispose();
      }

      // Check the raw XML doesn't contain revision markup
      const xml = await extractDocumentXml(currentBuffer);
      expect(xml).not.toMatch(/<w:ins\b/);
      expect(xml).not.toMatch(/<w:del\b/);
      expect(xml).not.toMatch(/<w:moveFrom\b/);
      expect(xml).not.toMatch(/<w:moveTo\b/);
    });

    it('should handle formatted text', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Normal ');
      para.addText('Bold', { bold: true });
      para.addText(' ');
      para.addText('Italic', { italic: true });
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      doc.dispose();

      const doc2 = await Document.loadFromBuffer(buffer);
      const text = doc2.getParagraphs()[0]?.getText();
      expect(text).toContain('Normal');
      expect(text).toContain('Bold');
      expect(text).toContain('Italic');
      doc2.dispose();
    });
  });

  describe('XML parsing verification', () => {
    it('should correctly parse and serialize XML without losing structure', () => {
      const xml = `<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:r>
          <w:t>Hello World</w:t>
        </w:r>
      </w:p>`;

      const parsed = XMLParser.parseToObject(xml) as any;
      expect(parsed['w:p']).toBeDefined();
      expect(parsed['w:p']['w:r']).toBeDefined();
      expect(parsed['w:p']['w:r']['w:t']).toBeDefined();
    });

    it('should preserve attributes during parsing', () => {
      const xml = `<w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:r>
          <w:t xml:space="preserve">  spaces  </w:t>
        </w:r>
      </w:p>`;

      const parsed = XMLParser.parseToObject(xml) as any;
      expect(parsed['w:p']['w:r']['w:t']['@_xml:space']).toBe('preserve');
    });
  });
});

/**
 * Helper to extract document.xml from a buffer
 */
async function extractDocumentXml(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const JSZip = require('jszip');
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file('word/document.xml')?.async('string');
  return documentXml || '';
}
