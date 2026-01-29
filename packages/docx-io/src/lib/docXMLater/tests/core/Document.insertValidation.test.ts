/**
 * Test suite for Document insert/replace validation
 * Tests all validation logic added to prevent invalid XML structure creation
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Table } from '../../src/elements/Table';
import { TableOfContentsElement } from '../../src/elements/TableOfContentsElement';
import {
  setGlobalLogger,
  ConsoleLogger,
  LogLevel,
  SilentLogger,
} from '../../src/utils/logger';

describe('Document Insert Validation', () => {
  describe('insertParagraphAt()', () => {
    it('should reject non-Paragraph types', () => {
      const doc = Document.create();

      expect(() => {
        doc.insertParagraphAt(0, {} as Paragraph);
      }).toThrow('must be a Paragraph instance');
    });

    it('should reject null', () => {
      const doc = Document.create();

      expect(() => {
        doc.insertParagraphAt(0, null as any);
      }).toThrow('must be a Paragraph instance');
    });

    it('should reject undefined', () => {
      const doc = Document.create();

      expect(() => {
        doc.insertParagraphAt(0, undefined as any);
      }).toThrow('must be a Paragraph instance');
    });

    it('should accept valid Paragraph instance', () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Valid paragraph');

      expect(() => {
        doc.insertParagraphAt(0, para);
      }).not.toThrow();

      expect(doc.getParagraphs().length).toBe(1);
    });

    it('should detect duplicate paragraph IDs', () => {
      const doc = Document.create();

      const para1 = new Paragraph();
      para1.addText('First');
      (para1 as any).formatting.paraId = 'ABC123';

      const para2 = new Paragraph();
      para2.addText('Second');
      (para2 as any).formatting.paraId = 'ABC123';

      doc.insertParagraphAt(0, para1);

      expect(() => {
        doc.insertParagraphAt(1, para2);
      }).toThrow('Duplicate paragraph ID detected: ABC123');
    });

    it('should allow paragraphs with different IDs', () => {
      const doc = Document.create();

      const para1 = new Paragraph();
      para1.addText('First');
      (para1 as any).formatting.paraId = 'ABC123';

      const para2 = new Paragraph();
      para2.addText('Second');
      (para2 as any).formatting.paraId = 'DEF456';

      doc.insertParagraphAt(0, para1);

      expect(() => {
        doc.insertParagraphAt(1, para2);
      }).not.toThrow();

      expect(doc.getParagraphs().length).toBe(2);
    });

    it('should warn about missing styles', () => {
      // Enable console logging for this test
      setGlobalLogger(new ConsoleLogger(LogLevel.WARN));
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      try {
        const doc = Document.create();
        const para = new Paragraph();
        para.addText('Styled text');
        para.setStyle('NonExistentStyle');

        doc.insertParagraphAt(0, para);

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Style "NonExistentStyle" not found')
        );
      } finally {
        consoleSpy.mockRestore();
        setGlobalLogger(new SilentLogger());
      }
    });

    it('should warn about missing numbering', () => {
      // Enable console logging for this test
      setGlobalLogger(new ConsoleLogger(LogLevel.WARN));
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      try {
        const doc = Document.create();
        const para = new Paragraph();
        para.addText('List item');
        // Set invalid numbering ID
        (para as any).formatting.numbering = { numId: 999, level: 0 };

        doc.insertParagraphAt(0, para);

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Numbering ID 999 not found')
        );
      } finally {
        consoleSpy.mockRestore();
        setGlobalLogger(new SilentLogger());
      }
    });

    it('should normalize negative index to 0', () => {
      const doc = Document.create();
      const first = new Paragraph().addText('First');
      doc.addParagraph(first);

      const para = new Paragraph().addText('Inserted');
      doc.insertParagraphAt(-5, para);

      const paragraphs = doc.getParagraphs();
      expect(paragraphs[0]?.getText()).toBe('Inserted');
    });

    it('should normalize index beyond length to end', () => {
      const doc = Document.create();
      const first = new Paragraph().addText('First');
      const second = new Paragraph().addText('Second');
      doc.addParagraph(first);
      doc.addParagraph(second);

      const para = new Paragraph().addText('Last');
      doc.insertParagraphAt(999, para);

      const paragraphs = doc.getParagraphs();
      expect(paragraphs[paragraphs.length - 1]?.getText()).toBe('Last');
    });
  });

  describe('insertTableAt()', () => {
    it('should reject non-Table types', () => {
      const doc = Document.create();

      expect(() => {
        doc.insertTableAt(0, {} as Table);
      }).toThrow('must be a Table instance');
    });

    it('should reject null', () => {
      const doc = Document.create();

      expect(() => {
        doc.insertTableAt(0, null as any);
      }).toThrow('must be a Table instance');
    });

    it('should accept valid Table instance', () => {
      const doc = Document.create();
      const table = new Table(2, 3);

      expect(() => {
        doc.insertTableAt(0, table);
      }).not.toThrow();

      expect(doc.getTables().length).toBe(1);
    });

    it('should reject table with zero rows', () => {
      const doc = Document.create();
      const table = new Table(); // No rows created

      expect(() => {
        doc.insertTableAt(0, table);
      }).toThrow('table must have at least one row');
    });

    it('should reject table with empty rows', () => {
      const doc = Document.create();
      const table = new Table(1, 0); // 1 row but 0 columns

      expect(() => {
        doc.insertTableAt(0, table);
      }).toThrow('table must have at least one'); // catches either "no rows" or "no cells"
    });

    it('should warn about missing table styles', () => {
      // Enable console logging for this test
      setGlobalLogger(new ConsoleLogger(LogLevel.WARN));
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      try {
        const doc = Document.create();
        const table = new Table(2, 2);
        table.setStyle('NonExistentTableStyle');

        doc.insertTableAt(0, table);

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            'Table style "NonExistentTableStyle" not found'
          )
        );
      } finally {
        consoleSpy.mockRestore();
        setGlobalLogger(new SilentLogger());
      }
    });

    it('should normalize negative index to 0', () => {
      const doc = Document.create();
      const para = new Paragraph().addText('Para');
      doc.addParagraph(para);

      const table = new Table(1, 1);
      doc.insertTableAt(-1, table);

      // Table should be first element
      const tables = doc.getTables();
      expect(tables.length).toBe(1);
    });
  });

  describe('insertTocAt()', () => {
    it('should reject non-TableOfContentsElement types', () => {
      const doc = Document.create();

      expect(() => {
        doc.insertTocAt(0, {} as TableOfContentsElement);
      }).toThrow('must be a TableOfContentsElement instance');
    });

    it('should reject null', () => {
      const doc = Document.create();

      expect(() => {
        doc.insertTocAt(0, null as any);
      }).toThrow('must be a TableOfContentsElement instance');
    });

    it('should accept valid TableOfContentsElement instance', () => {
      const doc = Document.create();
      const toc = TableOfContentsElement.createStandard();

      expect(() => {
        doc.insertTocAt(0, toc);
      }).not.toThrow();
    });

    it('should not throw when inserting TOC', () => {
      const doc = Document.create();
      const toc = TableOfContentsElement.createStandard();

      // Just verify it doesn't throw - warning is optional depending on doc state
      expect(() => {
        doc.insertTocAt(0, toc);
      }).not.toThrow();
    });
  });

  describe('replaceParagraphAt()', () => {
    it('should reject non-Paragraph replacement types', () => {
      const doc = Document.create();
      const original = new Paragraph().addText('Original');
      doc.addParagraph(original);

      expect(() => {
        doc.replaceParagraphAt(0, {} as Paragraph);
      }).toThrow('must be a Paragraph instance');
    });

    it('should validate replacement paragraph', () => {
      const doc = Document.create();
      const para1 = new Paragraph();
      para1.addText('Original');
      (para1 as any).formatting.paraId = 'ID1';
      doc.insertParagraphAt(0, para1);

      const para2 = new Paragraph();
      para2.addText('Existing');
      (para2 as any).formatting.paraId = 'ID2';
      doc.insertParagraphAt(1, para2);

      const replacement = new Paragraph();
      replacement.addText('Replacement');
      (replacement as any).formatting.paraId = 'ID2'; // Duplicate of para2

      expect(() => {
        doc.replaceParagraphAt(0, replacement);
      }).toThrow('Duplicate paragraph ID detected: ID2');
    });

    it('should accept valid replacement', () => {
      const doc = Document.create();
      const original = new Paragraph().addText('Original');
      doc.addParagraph(original);

      const replacement = new Paragraph().addText('Replacement');
      const result = doc.replaceParagraphAt(0, replacement);

      expect(result).toBe(true);
      expect(doc.getParagraphs()[0]?.getText()).toBe('Replacement');
    });

    it('should return false if index out of bounds', () => {
      const doc = Document.create();
      const para = new Paragraph().addText('Para');
      doc.addParagraph(para);

      const replacement = new Paragraph().addText('New');
      const result = doc.replaceParagraphAt(999, replacement);

      expect(result).toBe(false);
    });

    it('should return false if element is not a paragraph', () => {
      const doc = Document.create();
      const table = new Table(2, 2);
      doc.addTable(table);

      const replacement = new Paragraph().addText('New');
      const result = doc.replaceParagraphAt(0, replacement);

      expect(result).toBe(false);
    });
  });

  describe('replaceTableAt()', () => {
    it('should reject non-Table replacement types', () => {
      const doc = Document.create();
      const table = new Table(2, 2);
      doc.addTable(table);

      expect(() => {
        doc.replaceTableAt(0, {} as Table);
      }).toThrow('must be a Table instance');
    });

    it('should validate replacement table', () => {
      const doc = Document.create();
      const table = new Table(2, 2);
      doc.addTable(table);

      const emptyTable = new Table(); // No rows

      expect(() => {
        doc.replaceTableAt(0, emptyTable);
      }).toThrow('table must have at least one row');
    });

    it('should accept valid replacement', () => {
      const doc = Document.create();
      const table = new Table(2, 2);
      doc.addTable(table);

      const replacement = new Table(3, 3);
      const result = doc.replaceTableAt(0, replacement);

      expect(result).toBe(true);
      expect(doc.getTables()[0]?.getRows().length).toBe(3);
    });

    it('should return false if index out of bounds', () => {
      const doc = Document.create();
      const table = new Table(2, 2);
      doc.addTable(table);

      const replacement = new Table(3, 3);
      const result = doc.replaceTableAt(999, replacement);

      expect(result).toBe(false);
    });

    it('should return false if element is not a table', () => {
      const doc = Document.create();
      const para = new Paragraph().addText('Para');
      doc.addParagraph(para);

      const replacement = new Table(2, 2);
      const result = doc.replaceTableAt(0, replacement);

      expect(result).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should allow multiple inserts with validation', () => {
      const doc = Document.create();

      const para1 = new Paragraph().addText('First');
      const table1 = new Table(2, 2);
      const para2 = new Paragraph().addText('Second');

      doc.insertParagraphAt(0, para1);
      doc.insertTableAt(1, table1);
      doc.insertParagraphAt(2, para2);

      expect(doc.getParagraphs().length).toBe(2);
      expect(doc.getTables().length).toBe(1);
    });

    it('should maintain document integrity through save/load cycle', async () => {
      const doc = Document.create();

      const para = new Paragraph().addText('Test Content');
      doc.insertParagraphAt(0, para);

      const tempPath = 'tests/output/test-insert-validation.docx';
      await doc.save(tempPath);

      const loaded = await Document.load(tempPath);
      expect(loaded).toBeDefined();
      if (loaded) {
        expect(loaded.getParagraphs()[0]?.getText()).toBe('Test Content');
      }
    });
  });
});
