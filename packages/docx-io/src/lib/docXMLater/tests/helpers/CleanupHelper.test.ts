/**
 * Tests for CleanupHelper
 */

import { Document } from '../../src/core/Document';
import { CleanupHelper } from '../../src/helpers/CleanupHelper';
import { Hyperlink } from '../../src/elements/Hyperlink';
import { Paragraph } from '../../src/elements/Paragraph';
import { Field, ComplexField } from '../../src/elements/Field';

describe('CleanupHelper', () => {
  describe('formatAllHyperlinks', () => {
    it('should format internal hyperlinks', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      // Add internal hyperlink with non-standard formatting
      const hyperlink = Hyperlink.createInternal('bookmark1', 'Link Text', {
        font: 'Arial',
        size: 10,
        color: 'FF0000', // Red
        underline: false,
      });
      para.addHyperlink(hyperlink);
      doc.addParagraph(para);

      const cleanup = new CleanupHelper(doc);
      const report = cleanup.run({ formatAllHyperlinks: true });

      expect(report.allHyperlinksFormatted).toBe(1);

      // Verify formatting was applied
      const formatting = hyperlink.getRawFormatting();
      expect(formatting.font).toBe('Verdana');
      expect(formatting.size).toBe(12);
      expect(formatting.color).toBe('0000FF');
      expect(formatting.underline).toBe('single');
    });

    it('should format external hyperlinks', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      // Add external hyperlink with non-standard formatting
      const hyperlink = Hyperlink.createExternal(
        'https://example.com',
        'Example',
        {
          font: 'Times New Roman',
          size: 14,
          color: '00FF00', // Green
          underline: 'double',
        }
      );
      para.addHyperlink(hyperlink);
      doc.addParagraph(para);

      const cleanup = new CleanupHelper(doc);
      const report = cleanup.run({ formatAllHyperlinks: true });

      expect(report.allHyperlinksFormatted).toBe(1);

      // Verify formatting was applied
      const formatting = hyperlink.getRawFormatting();
      expect(formatting.font).toBe('Verdana');
      expect(formatting.size).toBe(12);
      expect(formatting.color).toBe('0000FF');
      expect(formatting.underline).toBe('single');
    });

    it('should format simple HYPERLINK fields', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      // Add HYPERLINK field with non-standard formatting
      const field = new Field({
        type: 'HYPERLINK',
        instruction: 'HYPERLINK "https://example.com"',
        formatting: {
          font: 'Courier',
          size: 16,
          color: 'AABBCC',
        },
      });
      para.addField(field);
      doc.addParagraph(para);

      const cleanup = new CleanupHelper(doc);
      const report = cleanup.run({ formatAllHyperlinks: true });

      expect(report.allHyperlinksFormatted).toBe(1);

      // Verify formatting was applied
      const formatting = field.getFormatting();
      expect(formatting?.font).toBe('Verdana');
      expect(formatting?.size).toBe(12);
      expect(formatting?.color).toBe('0000FF');
      expect(formatting?.underline).toBe('single');
    });

    it('should format complex HYPERLINK fields', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      // Add complex HYPERLINK field
      const complexField = new ComplexField({
        instruction: 'HYPERLINK "https://example.com" \\h',
        result: 'Click here',
        resultFormatting: {
          font: 'Georgia',
          size: 18,
          color: '112233',
        },
      });
      para.addField(complexField);
      doc.addParagraph(para);

      const cleanup = new CleanupHelper(doc);
      const report = cleanup.run({ formatAllHyperlinks: true });

      expect(report.allHyperlinksFormatted).toBe(1);
    });

    it('should format mixed hyperlink types', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      // Add internal hyperlink
      const internalLink = Hyperlink.createInternal('toc1', 'Section 1', {
        color: 'FF0000',
      });
      para.addHyperlink(internalLink);

      // Add external hyperlink
      const externalLink = Hyperlink.createExternal(
        'https://google.com',
        'Google',
        {
          color: '00FF00',
        }
      );
      para.addHyperlink(externalLink);

      // Add HYPERLINK field
      const field = new Field({
        type: 'HYPERLINK',
        instruction: 'HYPERLINK "https://example.com"',
      });
      para.addField(field);
      doc.addParagraph(para);

      const cleanup = new CleanupHelper(doc);
      const report = cleanup.run({ formatAllHyperlinks: true });

      expect(report.allHyperlinksFormatted).toBe(3);

      // Verify all are now blue
      expect(internalLink.getRawFormatting().color).toBe('0000FF');
      expect(externalLink.getRawFormatting().color).toBe('0000FF');
      expect(field.getFormatting()?.color).toBe('0000FF');
    });

    it('should process hyperlinks in tables', async () => {
      const doc = Document.create();
      const table = doc.createTable(2, 2);
      const row = table.getRow(0);
      expect(row).toBeDefined();
      const cell = row!.getCell(0);
      expect(cell).toBeDefined();

      // Create paragraph with hyperlink and add to cell
      const para = new Paragraph();
      const hyperlink = Hyperlink.createExternal(
        'https://example.com',
        'Link',
        {
          color: 'FF0000',
        }
      );
      para.addHyperlink(hyperlink);
      cell!.addParagraph(para);

      const cleanup = new CleanupHelper(doc);
      const report = cleanup.run({ formatAllHyperlinks: true });

      // Should format at least our hyperlink (may be more if table has default content)
      expect(report.allHyperlinksFormatted).toBeGreaterThanOrEqual(1);
      expect(hyperlink.getRawFormatting().color).toBe('0000FF');
    });

    it('should be included in all() method', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const hyperlink = Hyperlink.createExternal(
        'https://example.com',
        'Link',
        {
          color: 'FF0000',
        }
      );
      para.addHyperlink(hyperlink);
      doc.addParagraph(para);

      const cleanup = new CleanupHelper(doc);
      const report = cleanup.all();

      expect(report.allHyperlinksFormatted).toBeGreaterThanOrEqual(1);
      expect(hyperlink.getRawFormatting().color).toBe('0000FF');
    });
  });

  describe('Field.isHyperlinkField', () => {
    it('should return true for HYPERLINK type', () => {
      const field = new Field({
        type: 'HYPERLINK',
        instruction: 'HYPERLINK "https://example.com"',
      });
      expect(field.isHyperlinkField()).toBe(true);
    });

    it('should return true for instruction starting with HYPERLINK', () => {
      const field = new Field({
        type: 'CUSTOM',
        instruction: 'HYPERLINK "https://example.com" \\h',
      });
      expect(field.isHyperlinkField()).toBe(true);
    });

    it('should return false for non-HYPERLINK fields', () => {
      const field = new Field({
        type: 'PAGE',
      });
      expect(field.isHyperlinkField()).toBe(false);
    });
  });

  describe('Field.setColor', () => {
    it('should set color on field', () => {
      const field = new Field({
        type: 'HYPERLINK',
        instruction: 'HYPERLINK "https://example.com"',
      });

      field.setColor('0000FF');

      expect(field.getFormatting()?.color).toBe('0000FF');
    });

    it('should strip # from color', () => {
      const field = new Field({
        type: 'HYPERLINK',
        instruction: 'HYPERLINK "https://example.com"',
      });

      field.setColor('#FF0000');

      expect(field.getFormatting()?.color).toBe('FF0000');
    });

    it('should create formatting object if not exists', () => {
      const field = new Field({
        type: 'HYPERLINK',
        instruction: 'HYPERLINK "https://example.com"',
      });

      expect(field.getFormatting()).toBeUndefined();

      field.setColor('0000FF');

      expect(field.getFormatting()).toBeDefined();
      expect(field.getFormatting()?.color).toBe('0000FF');
    });
  });
});
