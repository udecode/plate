/**
 * Tests for special character handling in runs
 * Ensures tabs, line breaks, symbols etc. are properly preserved
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import { ZipHandler } from '../../src/zip/ZipHandler';

describe('Special Characters in Runs', () => {
  describe('Tab Characters', () => {
    it('should preserve tab characters in text', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('Column1\tColumn2\tColumn3');

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const paragraphs = loadedDoc.getParagraphs();
      expect(paragraphs).toHaveLength(1);

      const text = paragraphs[0]!.getText();
      expect(text).toContain('\t');

      // Count tabs
      const tabCount = (text.match(/\t/g) || []).length;
      expect(tabCount).toBe(2);
    });

    it('should serialize tabs as w:tab elements', async () => {
      const doc = Document.create();
      doc.createParagraph('Before\tAfter');

      const buffer = await doc.toBuffer();
      const zipHandler = new ZipHandler();
      await zipHandler.loadFromBuffer(buffer);

      const docXml = zipHandler.getFileAsString('word/document.xml');
      expect(docXml).toBeDefined();
      expect(docXml).toContain('<w:tab/>');
    });

    it('should handle multiple consecutive tabs', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('Start\t\t\tEnd');

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const text = loadedDoc.getParagraphs()[0]!.getText();
      const tabCount = (text.match(/\t/g) || []).length;
      expect(tabCount).toBe(3);
    });
  });

  describe('Line Break Characters', () => {
    it('should preserve line breaks in text', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('Line1\nLine2\nLine3');

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const text = loadedDoc.getParagraphs()[0]!.getText();
      expect(text).toContain('\n');

      // Count line breaks
      const breakCount = (text.match(/\n/g) || []).length;
      expect(breakCount).toBe(2);
    });

    it('should serialize line breaks as w:br elements', async () => {
      const doc = Document.create();
      doc.createParagraph('First\nSecond');

      const buffer = await doc.toBuffer();
      const zipHandler = new ZipHandler();
      await zipHandler.loadFromBuffer(buffer);

      const docXml = zipHandler.getFileAsString('word/document.xml');
      expect(docXml).toBeDefined();
      expect(docXml).toContain('<w:br/>');
    });

    it('should handle Windows-style line breaks', async () => {
      const doc = Document.create();
      // Windows uses \r\n but we normalize to \n
      const para = doc.createParagraph('Line1\r\nLine2');

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const text = loadedDoc.getParagraphs()[0]!.getText();
      // Should normalize to just \n
      expect(text).toContain('Line1');
      expect(text).toContain('Line2');
    });
  });

  describe('Mixed Special Characters', () => {
    it('should handle tabs and line breaks together', async () => {
      const doc = Document.create();
      const para = doc.createParagraph(
        'Name:\tJohn Doe\nAddress:\t123 Main St\nCity:\tNew York'
      );

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const text = loadedDoc.getParagraphs()[0]!.getText();

      // Check content preserved
      expect(text).toContain('Name:');
      expect(text).toContain('John Doe');
      expect(text).toContain('Address:');
      expect(text).toContain('123 Main St');

      // Count special chars
      const tabCount = (text.match(/\t/g) || []).length;
      const breakCount = (text.match(/\n/g) || []).length;
      expect(tabCount).toBe(3);
      expect(breakCount).toBe(2);
    });

    it('should preserve order of text and special characters', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('A\tB\nC\tD');

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const text = loadedDoc.getParagraphs()[0]!.getText();

      // Verify exact sequence
      expect(text).toBe('A\tB\nC\tD');
    });

    it('should handle special characters in formatted runs', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      para.addRun(new Run('Bold\tText', { bold: true }));
      para.addRun(new Run('\n'));
      para.addRun(new Run('Italic\tText', { italic: true }));

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const loadedPara = loadedDoc.getParagraphs()[0];
      expect(loadedPara).toBeDefined();
      const text = loadedPara!.getText();

      expect(text).toContain('Bold\tText');
      expect(text).toContain('Italic\tText');
      expect(text).toContain('\n');
    });
  });

  describe('Non-Breaking Characters', () => {
    it('should handle non-breaking hyphens', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('non\u2011breaking\u2011hyphen');

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const text = loadedDoc.getParagraphs()[0]!.getText();
      expect(text).toContain('\u2011');
    });

    it('should serialize non-breaking hyphens correctly', async () => {
      const doc = Document.create();
      doc.createParagraph('test\u2011hyphen');

      const buffer = await doc.toBuffer();
      const zipHandler = new ZipHandler();
      await zipHandler.loadFromBuffer(buffer);

      const docXml = zipHandler.getFileAsString('word/document.xml');
      expect(docXml).toBeDefined();
      expect(docXml).toContain('<w:noBreakHyphen/>');
    });

    it('should handle soft hyphens', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('soft\u00ADhyphen');

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const text = loadedDoc.getParagraphs()[0]!.getText();
      expect(text).toContain('\u00AD');
    });
  });

  describe('Symbol Characters', () => {
    it('should preserve Unicode symbols', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('Math: α + β = γ');

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const text = loadedDoc.getParagraphs()[0]!.getText();
      expect(text).toContain('α');
      expect(text).toContain('β');
      expect(text).toContain('γ');
    });

    it('should handle emoji characters', async () => {
      const doc = Document.create();
      const para = doc.createParagraph('Hello 😀 World 🎉');

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const text = loadedDoc.getParagraphs()[0]!.getText();
      expect(text).toContain('😀');
      expect(text).toContain('🎉');
    });

    it('should preserve special punctuation', async () => {
      const doc = Document.create();
      const para = doc.createParagraph(
        'Quote: "Hello" — em-dash – en-dash … ellipsis'
      );

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const text = loadedDoc.getParagraphs()[0]!.getText();
      expect(text).toContain('"');
      expect(text).toContain('"');
      expect(text).toContain('—');
      expect(text).toContain('–');
      expect(text).toContain('…');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty runs with only special characters', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addRun(new Run('\t'));
      para.addRun(new Run('\n'));
      para.addRun(new Run('\t\n'));

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const text = loadedDoc.getParagraphs()[0]!.getText();
      expect(text).toBe('\t\n\t\n');
    });

    it('should handle very long strings with special characters', async () => {
      const doc = Document.create();

      // Create a long string with pattern
      let longText = '';
      for (let i = 0; i < 100; i++) {
        longText += `Row${i}\tValue${i}\n`;
      }

      const para = doc.createParagraph(longText);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const text = loadedDoc.getParagraphs()[0]!.getText();
      const tabCount = (text.match(/\t/g) || []).length;
      const breakCount = (text.match(/\n/g) || []).length;

      expect(tabCount).toBe(100);
      expect(breakCount).toBe(100);
    });

    it('should handle special characters at boundaries', async () => {
      const doc = Document.create();

      // Special char at start
      const para1 = doc.createParagraph('\tStarting with tab');
      // Special char at end
      const para2 = doc.createParagraph('Ending with newline\n');
      // Only special chars
      const para3 = doc.createParagraph('\t\n\t\n');

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const paragraphs = loadedDoc.getParagraphs();
      expect(paragraphs[0]).toBeDefined();
      expect(paragraphs[1]).toBeDefined();
      expect(paragraphs[2]).toBeDefined();
      expect(paragraphs[0]!.getText().startsWith('\t')).toBe(true);
      expect(paragraphs[1]!.getText().endsWith('\n')).toBe(true);
      expect(paragraphs[2]!.getText()).toBe('\t\n\t\n');
    });

    it('should round-trip complex documents without loss', async () => {
      const doc = Document.create();

      // Create complex content
      const para = new Paragraph();
      para.addText('Regular text ');
      para.addText('with\ttabs\t', { bold: true });
      para.addText('and\nline\nbreaks\n', { italic: true });
      para.addText('plus symbols: α β γ 😀 ', { underline: true });
      para.addText('non\u2011breaking\u2011hyphens');

      doc.addParagraph(para);

      // First round-trip
      const buffer1 = await doc.toBuffer();
      const doc2 = await Document.loadFromBuffer(buffer1);

      // Second round-trip
      const buffer2 = await doc2.toBuffer();
      const doc3 = await Document.loadFromBuffer(buffer2);

      // Text should be identical after multiple round-trips
      const originalPara = doc.getParagraphs()[0];
      const finalPara = doc3.getParagraphs()[0];
      expect(originalPara).toBeDefined();
      expect(finalPara).toBeDefined();
      const originalText = originalPara!.getText();
      const finalText = finalPara!.getText();

      expect(finalText).toBe(originalText);
    });
  });
});
