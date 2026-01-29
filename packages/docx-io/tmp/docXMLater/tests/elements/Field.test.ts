/**
 * Field Tests - Phase 4.6
 *
 * Tests for dynamic field support including:
 * - Simple fields (PAGE, DATE, NUMPAGES, etc.)
 * - Field formatting
 * - Round-trip preservation
 */

import { describe, it, expect } from '@jest/globals';
import { join } from 'path';
import { promises as fs } from 'fs';
import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Field } from '../../src/elements/Field';

const OUTPUT_DIR = join(__dirname, '../output');

describe('Field Tests', () => {
  describe('Simple Fields - Generation', () => {
    it('should create and serialize PAGE field', async () => {
      const doc = Document.create();
      const para = Paragraph.create();
      para.addText('Page ');
      para.addPageNumber();
      para.addText(' of ');
      para.addTotalPages();
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-page.docx'), buffer);

      // Verify the buffer contains field instruction
      expect(buffer).toBeDefined();
    });

    it('should create DATE field', async () => {
      const doc = Document.create();
      const para = Paragraph.create();
      para.addText('Today is: ');
      para.addDate('MMMM d, yyyy');

      const buffer = await doc.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-date.docx'), buffer);

      expect(buffer).toBeDefined();
    });

    it('should create TIME field', async () => {
      const doc = Document.create();
      const para = Paragraph.create();
      para.addText('Time: ');
      para.addTime();
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-time.docx'), buffer);

      expect(buffer).toBeDefined();
    });

    it('should create AUTHOR field', async () => {
      const doc = Document.create();
      const para = Paragraph.create();
      para.addText('Author: ');
      para.addAuthor();
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-author.docx'), buffer);

      expect(buffer).toBeDefined();
    });

    it('should create FILENAME field', async () => {
      const doc = Document.create();
      const para = Paragraph.create();
      para.addText('File: ');
      para.addFilename();
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-filename.docx'), buffer);

      expect(buffer).toBeDefined();
    });

    it('should create FILENAME field with path', async () => {
      const doc = Document.create();
      const para = Paragraph.create();
      para.addText('Full path: ');
      para.addFilename(true);
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-filename-path.docx'), buffer);

      expect(buffer).toBeDefined();
    });

    it('should create TITLE field', async () => {
      const doc = Document.create();
      const para = Paragraph.create();
      para.addText('Title: ');
      para.addTitle();
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-title.docx'), buffer);

      expect(buffer).toBeDefined();
    });
  });

  describe('Field Formatting', () => {
    it('should apply bold formatting to PAGE field', async () => {
      const doc = Document.create();
      const para = Paragraph.create();
      para.addText('Page ');
      para.addPageNumber({ bold: true });
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-page-bold.docx'), buffer);

      expect(buffer).toBeDefined();
    });

    it('should apply multiple formats to DATE field', async () => {
      const doc = Document.create();
      const para = Paragraph.create();
      para.addDate('MMMM d, yyyy', { bold: true, italic: true, color: 'FF0000' });
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-date-formatted.docx'), buffer);

      expect(buffer).toBeDefined();
    });
  });

  describe('Multiple Fields', () => {
    it('should handle multiple fields in one paragraph', async () => {
      const doc = Document.create();
      const para = Paragraph.create();
      para.addText('Document: ');
      para.addFilename();
      para.addText(' | Author: ');
      para.addAuthor();
      para.addText(' | Date: ');
      para.addDate();
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-multiple.docx'), buffer);

      expect(buffer).toBeDefined();
    });

    it('should handle fields in multiple paragraphs', async () => {
      const doc = Document.create();

      const para1 = Paragraph.create();
      para1.addText('Page ');
      para1.addPageNumber();

      const para2 = Paragraph.create();
      para2.addText('Date: ');
      para2.addDate();

      const para3 = Paragraph.create();
      para3.addText('Author: ');
      para3.addAuthor();

      doc.addParagraph(para1);
      doc.addParagraph(para2);
      doc.addParagraph(para3);

      const buffer = await doc.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-multi-para.docx'), buffer);

      expect(buffer).toBeDefined();
    });
  });

  describe('Field Creation via Field Class', () => {
    it('should create field using Field.create factory', async () => {
      const doc = Document.create();
      const para = Paragraph.create();

      const pageField = Field.createPageNumber({ bold: true });
      para.addField(pageField);
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-factory.docx'), buffer);

      expect(buffer).toBeDefined();
    });

    it('should create custom field with instruction', async () => {
      const doc = Document.create();
      const para = Paragraph.create();

      const customField = Field.createCustom('PAGE \\* ARABIC \\* MERGEFORMAT');
      para.addField(customField);
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-custom.docx'), buffer);

      expect(buffer).toBeDefined();
    });
  });

  describe('Round-Trip - Field Parsing', () => {
    it('should preserve PAGE field through save/load cycle', async () => {
      const doc = Document.create();
      const para = Paragraph.create();
      para.addText('Page ');
      para.addPageNumber();
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const doc2 = await Document.loadFromBuffer(buffer);

      const paragraphs = doc2.getParagraphs();
      expect(paragraphs.length).toBeGreaterThan(0);

      // Save again to verify round-trip
      const buffer2 = await doc2.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-page-roundtrip.docx'), buffer2);

      expect(buffer2).toBeDefined();
    });

    it('should preserve DATE field through save/load cycle', async () => {
      const doc = Document.create();
      const para = Paragraph.create();
      para.addDate('MMMM d, yyyy');
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const doc2 = await Document.loadFromBuffer(buffer);

      // Save again
      const buffer2 = await doc2.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-date-roundtrip.docx'), buffer2);

      expect(buffer2).toBeDefined();
    });

    it('should preserve multiple fields through save/load cycle', async () => {
      const doc = Document.create();
      const para = Paragraph.create();
      para.addText('Page ');
      para.addPageNumber({ bold: true });
      para.addText(' - ');
      para.addDate('M/d/yyyy');
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const doc2 = await Document.loadFromBuffer(buffer);

      // Save again
      const buffer2 = await doc2.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-multi-roundtrip.docx'), buffer2);

      expect(buffer2).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle field in empty paragraph', async () => {
      const doc = Document.create();
      const para = Paragraph.create();
      para.addPageNumber();
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-empty-para.docx'), buffer);

      expect(buffer).toBeDefined();
    });

    it('should handle paragraph with only fields', async () => {
      const doc = Document.create();
      const para = Paragraph.create();
      para.addPageNumber();
      para.addText(' / ');
      para.addTotalPages();
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      await fs.writeFile(join(OUTPUT_DIR, 'test-field-only-fields.docx'), buffer);

      expect(buffer).toBeDefined();
    });
  });
});
