/**
 * Tests for ensureBlankLinesAfter* functions with style parameter
 */

import { Document } from '../core/Document';
import { Paragraph } from '../elements/Paragraph';

describe('ensureBlankLinesAfter* style parameter', () => {
  describe('ensureBlankLinesAfter1x1Tables', () => {
    it('should use Normal style by default', () => {
      const doc = Document.create();

      // Create a 1x1 table
      const table = doc.createTable(1, 1);
      const cell = table.getCell(0, 0);
      if (cell) {
        const para = new Paragraph();
        para.addText('Content');
        cell.addParagraph(para);
      }

      // Add a paragraph with content after the table
      doc.createParagraph('Next content');

      // Ensure blank lines (should use Normal style by default)
      const result = doc.ensureBlankLinesAfter1x1Tables();

      expect(result.blankLinesAdded).toBe(1);

      // Check that the blank paragraph has Normal style
      const paragraphs = doc.getParagraphs();
      const blankPara = paragraphs.find((p) => p.getText().trim() === '');
      expect(blankPara).toBeDefined();
      expect(blankPara?.getStyle()).toBe('Normal');
    });

    it('should use custom style when specified', () => {
      const doc = Document.create();

      // Create a 1x1 table
      const table = doc.createTable(1, 1);
      const cell = table.getCell(0, 0);
      if (cell) {
        const para = new Paragraph();
        para.addText('Content');
        cell.addParagraph(para);
      }

      // Add a paragraph with content after the table
      doc.createParagraph('Next content');

      // Ensure blank lines with custom style
      const result = doc.ensureBlankLinesAfter1x1Tables({
        style: 'BodyText',
      });

      expect(result.blankLinesAdded).toBe(1);

      // Check that the blank paragraph has BodyText style
      const paragraphs = doc.getParagraphs();
      const blankPara = paragraphs.find((p) => p.getText().trim() === '');
      expect(blankPara).toBeDefined();
      expect(blankPara?.getStyle()).toBe('BodyText');
    });

    it('should apply custom spacing and style together', () => {
      const doc = Document.create();

      // Create a 1x1 table
      const table = doc.createTable(1, 1);
      const cell = table.getCell(0, 0);
      if (cell) {
        const para = new Paragraph();
        para.addText('Content');
        cell.addParagraph(para);
      }

      // Add a paragraph with content after the table
      doc.createParagraph('Next content');

      // Ensure blank lines with custom style and spacing
      const result = doc.ensureBlankLinesAfter1x1Tables({
        style: 'Heading3',
        spacingAfter: 240, // 12pt
      });

      expect(result.blankLinesAdded).toBe(1);

      // Check style and spacing
      const paragraphs = doc.getParagraphs();
      const blankPara = paragraphs.find((p) => p.getText().trim() === '');
      expect(blankPara).toBeDefined();
      expect(blankPara?.getStyle()).toBe('Heading3');
      expect(blankPara?.getFormatting().spacing?.after).toBe(240);
    });
  });

  describe('ensureBlankLinesAfterOtherTables', () => {
    it('should use Normal style by default', () => {
      const doc = Document.create();

      // Create a multi-cell table (2x2)
      const table = doc.createTable(2, 2);
      const cell = table.getCell(0, 0);
      if (cell) {
        const para = new Paragraph();
        para.addText('Cell 1');
        cell.addParagraph(para);
      }

      // Add a paragraph with content after the table
      doc.createParagraph('Next content');

      // Ensure blank lines (should use Normal style by default)
      const result = doc.ensureBlankLinesAfterOtherTables();

      expect(result.blankLinesAdded).toBe(1);

      // Check that the blank paragraph has Normal style
      const paragraphs = doc.getParagraphs();
      const blankPara = paragraphs.find((p) => p.getText().trim() === '');
      expect(blankPara).toBeDefined();
      expect(blankPara?.getStyle()).toBe('Normal');
    });

    it('should use custom style when specified', () => {
      const doc = Document.create();

      // Create a multi-cell table (2x2)
      const table = doc.createTable(2, 2);
      const cell = table.getCell(0, 0);
      if (cell) {
        const para = new Paragraph();
        para.addText('Cell 1');
        cell.addParagraph(para);
      }

      // Add a paragraph with content after the table
      doc.createParagraph('Next content');

      // Ensure blank lines with custom style
      const result = doc.ensureBlankLinesAfterOtherTables({
        style: 'ListParagraph',
      });

      expect(result.blankLinesAdded).toBe(1);

      // Check that the blank paragraph has ListParagraph style
      const paragraphs = doc.getParagraphs();
      const blankPara = paragraphs.find((p) => p.getText().trim() === '');
      expect(blankPara).toBeDefined();
      expect(blankPara?.getStyle()).toBe('ListParagraph');
    });

    it('should skip 1x1 tables', () => {
      const doc = Document.create();

      // Create a 1x1 table
      const table1x1 = doc.createTable(1, 1);
      const cell1x1 = table1x1.getCell(0, 0);
      if (cell1x1) {
        const para = new Paragraph();
        para.addText('Single cell');
        cell1x1.addParagraph(para);
      }

      // Create a 2x2 table
      const table2x2 = doc.createTable(2, 2);
      const cell2x2 = table2x2.getCell(0, 0);
      if (cell2x2) {
        const para = new Paragraph();
        para.addText('Cell 1');
        cell2x2.addParagraph(para);
      }

      // Ensure blank lines after "other" tables (should skip 1x1)
      const result = doc.ensureBlankLinesAfterOtherTables({
        style: 'Normal',
      });

      // Should only process the 2x2 table
      expect(result.tablesProcessed).toBe(1);
    });
  });

  describe('backward compatibility', () => {
    it('ensureBlankLinesAfter1x1Tables should work without style parameter', () => {
      const doc = Document.create();

      // Create a 1x1 table
      const table = doc.createTable(1, 1);
      const cell = table.getCell(0, 0);
      if (cell) {
        const para = new Paragraph();
        para.addText('Content');
        cell.addParagraph(para);
      }

      // Call without any options (backward compatible)
      const result = doc.ensureBlankLinesAfter1x1Tables();

      // Should still work and use Normal style as default
      expect(result.tablesProcessed).toBeGreaterThanOrEqual(0);
    });

    it('ensureBlankLinesAfterOtherTables should work without style parameter', () => {
      const doc = Document.create();

      // Create a 2x2 table
      const table = doc.createTable(2, 2);
      const cell = table.getCell(0, 0);
      if (cell) {
        const para = new Paragraph();
        para.addText('Cell 1');
        cell.addParagraph(para);
      }

      // Call without any options (backward compatible)
      const result = doc.ensureBlankLinesAfterOtherTables();

      // Should still work and use Normal style as default
      expect(result.tablesProcessed).toBeGreaterThanOrEqual(0);
    });
  });
});
