/**
 * Tests for all new helper methods added to docxmlater
 * Tests Document, Paragraph, Table, and Image helper methods
 */

import { Document } from '../core/Document';
import { Paragraph } from '../elements/Paragraph';
import { Table } from '../elements/Table';
import { Image } from '../elements/Image';

describe('Document Helper Methods', () => {
  let doc: Document;

  beforeEach(() => {
    doc = Document.create();
  });

  describe('findText', () => {
    it('should find text in paragraphs', () => {
      const para = doc.createParagraph(
        'Hello world, this is a test document with some text.'
      );

      const results = doc.findText('test');
      expect(results).toHaveLength(1);
      expect(results[0]?.text).toBe('test');
      expect(results[0]?.paragraph).toBe(para);
    });

    it('should find text with case sensitivity', () => {
      doc.createParagraph('Hello World');

      const results1 = doc.findText('world', { caseSensitive: false });
      expect(results1).toHaveLength(1);

      const results2 = doc.findText('world', { caseSensitive: true });
      expect(results2).toHaveLength(0);

      const results3 = doc.findText('World', { caseSensitive: true });
      expect(results3).toHaveLength(1);
    });

    it('should find whole words only', () => {
      doc.createParagraph('This is testing a test case');

      const results1 = doc.findText('test', { wholeWord: false });
      expect(results1).toHaveLength(2); // "testing" and "test"

      const results2 = doc.findText('test', { wholeWord: true });
      expect(results2).toHaveLength(1); // only "test"
    });

    it('should find text in tables', () => {
      const table = doc.createTable(2, 2);
      table.getCell(0, 0)?.createParagraph('Cell with test text');

      const results = doc.findText('test');
      expect(results).toHaveLength(1);
    });
  });

  describe('replaceText', () => {
    it('should replace text in paragraphs', () => {
      const para = doc.createParagraph('Hello world');

      const count = doc.replaceText('world', 'universe');
      expect(count).toBe(1);
      expect(para.getText()).toBe('Hello universe');
    });

    it('should replace multiple occurrences', () => {
      const para = doc.createParagraph('test test test');

      const count = doc.replaceText('test', 'example');
      expect(count).toBe(3);
      expect(para.getText()).toBe('example example example');
    });

    it('should replace with case sensitivity', () => {
      const para = doc.createParagraph('Test test TEST');

      const count1 = doc.replaceText('test', 'example', {
        caseSensitive: true,
      });
      expect(count1).toBe(1);
      expect(para.getText()).toBe('Test example TEST');

      para.setText('Test test TEST');
      const count2 = doc.replaceText('test', 'example', {
        caseSensitive: false,
      });
      expect(count2).toBe(3);
      expect(para.getText()).toBe('example example example');
    });

    it('should replace whole words only', () => {
      const para = doc.createParagraph('testing test tested');

      const count = doc.replaceText('test', 'exam', { wholeWord: true });
      expect(count).toBe(1);
      expect(para.getText()).toBe('testing exam tested');
    });
  });

  describe('getWordCount', () => {
    it('should count words in paragraphs', () => {
      doc.createParagraph('Hello world');
      doc.createParagraph('This is a test');

      expect(doc.getWordCount()).toBe(6);
    });

    it('should count words in tables', () => {
      doc.createParagraph('Hello world');
      const table = doc.createTable(2, 2);
      table.getCell(0, 0)?.createParagraph('Table cell text');

      expect(doc.getWordCount()).toBe(5); // 2 + 3
    });

    it('should handle empty paragraphs', () => {
      doc.createParagraph('');
      doc.createParagraph('Hello');
      doc.createParagraph('');

      expect(doc.getWordCount()).toBe(1);
    });
  });

  describe('getCharacterCount', () => {
    it('should count characters with spaces', () => {
      doc.createParagraph('Hello world');

      expect(doc.getCharacterCount(true)).toBe(11);
    });

    it('should count characters without spaces', () => {
      doc.createParagraph('Hello world');

      expect(doc.getCharacterCount(false)).toBe(10);
    });

    it('should count characters in tables', () => {
      doc.createParagraph('Test');
      const table = doc.createTable(1, 1);
      table.getCell(0, 0)?.createParagraph('Cell');

      expect(doc.getCharacterCount(true)).toBe(8); // 4 + 4
    });
  });

  describe('removeParagraph', () => {
    it('should remove paragraph by object', () => {
      const para1 = doc.createParagraph('First');
      const para2 = doc.createParagraph('Second');
      const para3 = doc.createParagraph('Third');

      expect(doc.getParagraphCount()).toBe(3);

      const removed = doc.removeParagraph(para2);
      expect(removed).toBe(true);
      expect(doc.getParagraphCount()).toBe(2);
      expect(doc.getParagraphs()).toEqual([para1, para3]);
    });

    it('should remove paragraph by index', () => {
      doc.createParagraph('First');
      doc.createParagraph('Second');
      doc.createParagraph('Third');

      const removed = doc.removeParagraph(1);
      expect(removed).toBe(true);
      expect(doc.getParagraphCount()).toBe(2);
      expect(doc.getParagraphs()[1]?.getText()).toBe('Third');
    });

    it('should return false for invalid index', () => {
      doc.createParagraph('First');

      expect(doc.removeParagraph(-1)).toBe(false);
      expect(doc.removeParagraph(5)).toBe(false);
    });
  });

  describe('removeTable', () => {
    it('should remove table by object', () => {
      const table1 = doc.createTable(1, 1);
      const table2 = doc.createTable(2, 2);

      expect(doc.getTableCount()).toBe(2);

      const removed = doc.removeTable(table1);
      expect(removed).toBe(true);
      expect(doc.getTableCount()).toBe(1);
      expect(doc.getTables()[0]).toBe(table2);
    });

    it('should remove table by index', () => {
      doc.createTable(1, 1);
      doc.createTable(2, 2);

      const removed = doc.removeTable(0);
      expect(removed).toBe(true);
      expect(doc.getTableCount()).toBe(1);
    });
  });

  describe('insertParagraphAt', () => {
    it('should insert paragraph at specific position', () => {
      doc.createParagraph('First');
      doc.createParagraph('Third');

      const para2 = new Paragraph();
      para2.addText('Second');
      doc.insertParagraphAt(1, para2);

      expect(doc.getParagraphCount()).toBe(3);
      expect(doc.getParagraphs()[1]).toBe(para2);
    });

    it('should handle edge cases', () => {
      doc.createParagraph('First');

      const para0 = new Paragraph();
      para0.addText('Zero');
      doc.insertParagraphAt(-1, para0);
      expect(doc.getParagraphs()[0]).toBe(para0);

      const paraLast = new Paragraph();
      paraLast.addText('Last');
      doc.insertParagraphAt(100, paraLast);
      expect(doc.getParagraphs()[doc.getParagraphCount() - 1]).toBe(paraLast);
    });
  });

  describe('getHyperlinks', () => {
    it('should find hyperlinks in paragraphs', () => {
      doc.createParagraph();
      // We'd need to properly create a hyperlink through the document's relationship manager
      // For now, we'll just test that the method returns an empty array

      const links = doc.getHyperlinks();
      expect(links).toEqual([]);
    });
  });

  describe('getBookmarks', () => {
    it('should find bookmarks in paragraphs', () => {
      const para = doc.createParagraph('Text');
      const bookmark = doc.createBookmark('test-bookmark');
      para.addBookmark(bookmark);

      const bookmarks = doc.getBookmarks();
      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0]?.bookmark).toBe(bookmark);
      expect(bookmarks[0]?.paragraph).toBe(para);
    });
  });

  describe('getImages', () => {
    it('should return all images', async () => {
      // This would need actual image files to test properly
      const images = doc.getImages();
      expect(images).toEqual([]);
    });
  });

  describe('setLanguage/getLanguage', () => {
    it('should set and get document language', () => {
      expect(doc.getLanguage()).toBeUndefined();

      doc.setLanguage('en-US');
      expect(doc.getLanguage()).toBe('en-US');

      doc.setLanguage('es-ES');
      expect(doc.getLanguage()).toBe('es-ES');
    });
  });
});

describe('Paragraph Helper Methods', () => {
  let para: Paragraph;

  beforeEach(() => {
    para = new Paragraph();
  });

  describe('getWordCount', () => {
    it('should count words in paragraph', () => {
      para.addText('Hello world, this is a test');
      expect(para.getWordCount()).toBe(6);
    });

    it('should handle empty paragraph', () => {
      expect(para.getWordCount()).toBe(0);
    });

    it('should handle multiple runs', () => {
      para.addText('Hello ');
      para.addText('world');
      expect(para.getWordCount()).toBe(2);
    });
  });

  describe('getLength', () => {
    it('should count characters with spaces', () => {
      para.addText('Hello world');
      expect(para.getLength(true)).toBe(11);
    });

    it('should count characters without spaces', () => {
      para.addText('Hello world');
      expect(para.getLength(false)).toBe(10);
    });
  });

  describe('clone', () => {
    it('should create a deep copy of paragraph', () => {
      para.addText('Hello', { bold: true });
      para.addText(' world', { italic: true });
      para.setAlignment('center');
      para.setSpaceBefore(240);

      const cloned = para.clone();

      expect(cloned).not.toBe(para);
      expect(cloned.getText()).toBe('Hello world');
      expect(cloned.getFormatting().alignment).toBe('center');
      expect(cloned.getFormatting().spacing?.before).toBe(240);
      expect(cloned.getRuns()).toHaveLength(2);
      expect(cloned.getRuns()[0]?.getFormatting().bold).toBe(true);
      expect(cloned.getRuns()[1]?.getFormatting().italic).toBe(true);
    });
  });

  describe('setBorder', () => {
    it('should set paragraph borders', () => {
      para.setBorder({
        top: { style: 'single', size: 4, color: '000000' },
        bottom: { style: 'double', size: 8, color: 'FF0000' },
      });

      const formatting = para.getFormatting() as any;
      expect(formatting.borders).toBeDefined();
      expect(formatting.borders.top.style).toBe('single');
      expect(formatting.borders.bottom.color).toBe('FF0000');
    });
  });

  describe('setShading', () => {
    it('should set paragraph shading', () => {
      para.setShading({
        fill: 'FFFF00',
        val: 'solid',
      });

      const formatting = para.getFormatting() as any;
      expect(formatting.shading).toBeDefined();
      expect(formatting.shading.fill).toBe('FFFF00');
      expect(formatting.shading.val).toBe('solid');
    });
  });

  describe('setTabs', () => {
    it('should set tab stops', () => {
      para.setTabs([
        { position: 720, val: 'left' },
        { position: 1440, val: 'center', leader: 'dot' },
      ]);

      const formatting = para.getFormatting() as any;
      expect(formatting.tabs).toBeDefined();
      expect(formatting.tabs).toHaveLength(2);
      expect(formatting.tabs[0].position).toBe(720);
      expect(formatting.tabs[1].leader).toBe('dot');
    });
  });
});

describe('Table Helper Methods', () => {
  let table: Table;

  beforeEach(() => {
    table = new Table(3, 3);
  });

  describe('removeRow', () => {
    it('should remove row at index', () => {
      expect(table.getRowCount()).toBe(3);

      const removed = table.removeRow(1);
      expect(removed).toBe(true);
      expect(table.getRowCount()).toBe(2);
    });

    it('should return false for invalid index', () => {
      expect(table.removeRow(-1)).toBe(false);
      expect(table.removeRow(10)).toBe(false);
    });
  });

  describe('insertRow', () => {
    it('should insert row at position', () => {
      const row = table.insertRow(1);

      expect(table.getRowCount()).toBe(4);
      expect(table.getRow(1)).toBe(row);
    });

    it('should create row with correct column count', () => {
      const row = table.insertRow(0);

      expect(row.getCellCount()).toBe(3);
    });
  });

  describe('addColumn', () => {
    it('should add column to all rows', () => {
      table.addColumn();

      expect(table.getColumnCount()).toBe(4);
      for (const row of table.getRows()) {
        expect(row.getCellCount()).toBe(4);
      }
    });

    it('should add column at specific position', () => {
      table.getCell(0, 1)?.createParagraph('Middle');

      table.addColumn(1);

      expect(table.getColumnCount()).toBe(4);
      expect(table.getCell(0, 2)?.getText()).toBe('Middle');
    });
  });

  describe('removeColumn', () => {
    it('should remove column from all rows', () => {
      const removed = table.removeColumn(1);

      expect(removed).toBe(true);
      expect(table.getColumnCount()).toBe(2);
      for (const row of table.getRows()) {
        expect(row.getCellCount()).toBe(2);
      }
    });

    it('should return false for invalid index', () => {
      expect(table.removeColumn(-1)).toBe(false);
      expect(table.removeColumn(10)).toBe(false);
    });
  });

  describe('getColumnCount', () => {
    it('should return maximum column count', () => {
      expect(table.getColumnCount()).toBe(3);
    });

    it('should return 0 for empty table', () => {
      const emptyTable = new Table();
      expect(emptyTable.getColumnCount()).toBe(0);
    });
  });

  describe('setColumnWidths', () => {
    it('should set column widths', () => {
      table.setColumnWidths([2880, 1440, null]);

      const formatting = table.getFormatting() as any;
      expect(formatting.columnWidths).toEqual([2880, 1440, null]);
    });
  });
});

describe('Image Helper Methods', () => {
  describe('setAltText/getAltText', () => {
    it('should set and get alt text', async () => {
      // Create a simple test image buffer
      const imageBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG header
      const image = await Image.fromBuffer(imageBuffer);

      expect(image.getAltText()).toBe('Image');

      image.setAltText('A test image');
      expect(image.getAltText()).toBe('A test image');
    });
  });

  describe('rotate/getRotation', () => {
    it('should set and get rotation', async () => {
      const imageBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      const image = await Image.fromBuffer(imageBuffer);

      expect(image.getRotation()).toBe(0);

      image.rotate(90);
      expect(image.getRotation()).toBe(90);

      image.rotate(450); // Should normalize to 90
      expect(image.getRotation()).toBe(90);

      image.rotate(-90); // Should normalize to 270
      expect(image.getRotation()).toBe(270);
    });

    it('should swap dimensions on 90/270 degree rotation', async () => {
      const imageBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      const image = await Image.fromBuffer(imageBuffer, {
        width: 1000,
        height: 2000,
      });

      const originalWidth = image.getWidth();
      const originalHeight = image.getHeight();

      image.rotate(90);
      expect(image.getWidth()).toBe(originalHeight);
      expect(image.getHeight()).toBe(originalWidth);
    });
  });
});
