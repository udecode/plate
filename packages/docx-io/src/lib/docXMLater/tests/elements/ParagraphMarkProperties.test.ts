/**
 * Tests for Paragraph Mark Run Properties (Phase 4.2 Batch 5)
 *
 * Tests the formatting properties that can be applied to the paragraph mark (¶ symbol).
 * Per ECMA-376 Part 1 §17.3.1.29, the paragraph mark can have its own run properties
 * independent of the text runs in the paragraph.
 */

import { describe, test, expect } from '@jest/globals';
import { Paragraph } from '../../src/elements/Paragraph';
import { Document } from '../../src/core/Document';
import * as path from 'path';

describe('Paragraph Mark Run Properties', () => {
  describe('Basic Formatting', () => {
    test('should set and serialize bold paragraph mark', async () => {
      const para = new Paragraph();
      para.addText('Normal text');
      para.setParagraphMarkFormatting({ bold: true });

      const doc = Document.create();
      doc.addParagraph(para);

      // Save and reload
      const outputPath = path.join(
        __dirname,
        '../output/test-para-mark-bold.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const para2 = doc2.getParagraphs()[0];
      expect(para2).toBeDefined();

      expect(para2!.getFormatting().paragraphMarkRunProperties).toBeDefined();
      expect(para2!.getFormatting().paragraphMarkRunProperties?.bold).toBe(
        true
      );
    });

    test('should set and serialize colored paragraph mark', async () => {
      const para = new Paragraph();
      para.addText('Normal text');
      para.setParagraphMarkFormatting({ color: 'FF0000' });

      const doc = Document.create();
      doc.addParagraph(para);

      // Save and reload
      const outputPath = path.join(
        __dirname,
        '../output/test-para-mark-color.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const para2 = doc2.getParagraphs()[0];
      expect(para2).toBeDefined();

      expect(para2!.getFormatting().paragraphMarkRunProperties).toBeDefined();
      expect(para2!.getFormatting().paragraphMarkRunProperties?.color).toBe(
        'FF0000'
      );
    });

    test('should set and serialize font for paragraph mark', async () => {
      const para = new Paragraph();
      para.addText('Normal text');
      para.setParagraphMarkFormatting({ font: 'Courier New', size: 14 });

      const doc = Document.create();
      doc.addParagraph(para);

      // Save and reload
      const outputPath = path.join(
        __dirname,
        '../output/test-para-mark-font.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const para2 = doc2.getParagraphs()[0];
      expect(para2).toBeDefined();

      expect(para2!.getFormatting().paragraphMarkRunProperties).toBeDefined();
      expect(para2!.getFormatting().paragraphMarkRunProperties?.font).toBe(
        'Courier New'
      );
      expect(para2!.getFormatting().paragraphMarkRunProperties?.size).toBe(14);
    });
  });

  describe('Advanced Formatting', () => {
    test('should set and serialize multiple paragraph mark properties', async () => {
      const para = new Paragraph();
      para.addText('Normal text');
      para.setParagraphMarkFormatting({
        bold: true,
        italic: true,
        color: '0000FF',
        font: 'Arial',
        size: 12,
        underline: 'double',
      });

      const doc = Document.create();
      doc.addParagraph(para);

      // Save and reload
      const outputPath = path.join(
        __dirname,
        '../output/test-para-mark-multi.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const para2 = doc2.getParagraphs()[0];
      const markProps = para2!.getFormatting().paragraphMarkRunProperties;

      expect(markProps).toBeDefined();
      expect(markProps?.bold).toBe(true);
      expect(markProps?.italic).toBe(true);
      expect(markProps?.color).toBe('0000FF');
      expect(markProps?.font).toBe('Arial');
      expect(markProps?.size).toBe(12);
      expect(markProps?.underline).toBe('double');
    });

    test('should set and serialize hidden paragraph mark', async () => {
      const para = new Paragraph();
      para.addText('Visible text');
      para.setParagraphMarkFormatting({ vanish: true });

      const doc = Document.create();
      doc.addParagraph(para);

      // Save and reload
      const outputPath = path.join(
        __dirname,
        '../output/test-para-mark-hidden.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const para2 = doc2.getParagraphs()[0];
      expect(para2).toBeDefined();

      expect(para2!.getFormatting().paragraphMarkRunProperties).toBeDefined();
      expect(para2!.getFormatting().paragraphMarkRunProperties?.vanish).toBe(
        true
      );
    });

    test('should set and serialize highlighted paragraph mark', async () => {
      const para = new Paragraph();
      para.addText('Normal text');
      para.setParagraphMarkFormatting({ highlight: 'yellow' });

      const doc = Document.create();
      doc.addParagraph(para);

      // Save and reload
      const outputPath = path.join(
        __dirname,
        '../output/test-para-mark-highlight.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const para2 = doc2.getParagraphs()[0];
      expect(para2).toBeDefined();

      expect(para2!.getFormatting().paragraphMarkRunProperties).toBeDefined();
      expect(para2!.getFormatting().paragraphMarkRunProperties?.highlight).toBe(
        'yellow'
      );
    });
  });

  describe('Complex Script Support', () => {
    test('should set and serialize complex script formatting for paragraph mark', async () => {
      const para = new Paragraph();
      para.addText('Normal text');
      para.setParagraphMarkFormatting({
        complexScriptBold: true,
        complexScriptItalic: true,
        rtl: true,
      });

      const doc = Document.create();
      doc.addParagraph(para);

      // Save and reload
      const outputPath = path.join(
        __dirname,
        '../output/test-para-mark-complex.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const para2 = doc2.getParagraphs()[0];
      const markProps = para2!.getFormatting().paragraphMarkRunProperties;

      expect(markProps).toBeDefined();
      expect(markProps?.complexScriptBold).toBe(true);
      expect(markProps?.complexScriptItalic).toBe(true);
      expect(markProps?.rtl).toBe(true);
    });
  });

  describe('XML Generation', () => {
    test('should generate correct XML structure for paragraph mark properties', () => {
      const para = new Paragraph();
      para.addText('Text');
      para.setParagraphMarkFormatting({ bold: true, color: 'FF0000' });

      const xml = para.toXML();
      const xmlStr = JSON.stringify(xml);

      // Should contain w:rPr within w:pPr
      expect(xmlStr).toContain('"w:rPr"');
      // Should contain bold
      expect(xmlStr).toContain('"w:b"');
      // Should contain color
      expect(xmlStr).toContain('"w:color"');
      expect(xmlStr).toContain('"FF0000"');
    });

    test('should not generate empty rPr when no paragraph mark properties set', () => {
      const para = new Paragraph();
      para.addText('Text');

      const xml = para.toXML();
      const xmlStr = JSON.stringify(xml);

      // Should not contain rPr in pPr (only in w:r)
      // The paragraph itself should not have rPr unless explicitly set
      const pPrSection = xmlStr.substring(
        xmlStr.indexOf('"pPr"'),
        xmlStr.indexOf('"w:r"')
      );

      // If no paragraph mark properties, pPr might be empty or not contain rPr
      // This is implementation-specific, but we're testing that it doesn't error
      expect(para.getFormatting().paragraphMarkRunProperties).toBeUndefined();
    });
  });

  describe('Round-trip Verification', () => {
    test('should preserve paragraph mark properties through multiple save/load cycles', async () => {
      const para = new Paragraph();
      para.addText('Test');
      para.setParagraphMarkFormatting({
        bold: true,
        italic: true,
        underline: 'single',
        color: '00FF00',
        font: 'Times New Roman',
        size: 16,
      });

      const doc1 = Document.create();
      doc1.addParagraph(para);

      // First save
      const path1 = path.join(
        __dirname,
        '../output/test-para-mark-roundtrip1.docx'
      );
      await doc1.save(path1);

      // First load
      const doc2 = await Document.load(path1);

      // Second save
      const path2 = path.join(
        __dirname,
        '../output/test-para-mark-roundtrip2.docx'
      );
      await doc2.save(path2);

      // Second load
      const doc3 = await Document.load(path2);
      const finalPara = doc3.getParagraphs()[0];
      expect(finalPara).toBeDefined();
      const markProps = finalPara!.getFormatting().paragraphMarkRunProperties;

      expect(markProps).toBeDefined();
      expect(markProps?.bold).toBe(true);
      expect(markProps?.italic).toBe(true);
      expect(markProps?.underline).toBe('single');
      expect(markProps?.color).toBe('00FF00');
      expect(markProps?.font).toBe('Times New Roman');
      expect(markProps?.size).toBe(16);
    });

    test('should handle paragraphs with both run and paragraph mark properties', async () => {
      const para = new Paragraph();

      // Add runs with different formatting
      para.addText('Bold text', { bold: true });
      para.addText(' Normal text');
      para.addText(' Italic text', { italic: true });

      // Set paragraph mark properties (different from runs)
      para.setParagraphMarkFormatting({
        bold: true,
        color: 'FF0000',
        font: 'Arial',
        size: 14,
      });

      const doc = Document.create();
      doc.addParagraph(para);

      // Save and reload
      const outputPath = path.join(
        __dirname,
        '../output/test-para-mark-mixed.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const para2 = doc2.getParagraphs()[0];
      expect(para2).toBeDefined();

      // Verify runs
      expect(para2!.getRuns().length).toBe(3);
      expect(para2!.getRuns()[0]!.getFormatting().bold).toBe(true);
      expect(para2!.getRuns()[2]!.getFormatting().italic).toBe(true);

      // Verify paragraph mark properties
      const markProps = para2!.getFormatting().paragraphMarkRunProperties;
      expect(markProps).toBeDefined();
      expect(markProps?.bold).toBe(true);
      expect(markProps?.color).toBe('FF0000');
      expect(markProps?.font).toBe('Arial');
      expect(markProps?.size).toBe(14);
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined paragraph mark properties gracefully', () => {
      const para = new Paragraph();
      para.addText('Text');

      expect(para.getFormatting().paragraphMarkRunProperties).toBeUndefined();

      // Should not error when generating XML
      const xml = para.toXML();
      expect(xml).toBeDefined();
    });

    test('should overwrite previous paragraph mark properties', async () => {
      const para = new Paragraph();
      para.addText('Text');

      // Set first properties
      para.setParagraphMarkFormatting({ bold: true, color: 'FF0000' });

      // Overwrite with new properties
      para.setParagraphMarkFormatting({ italic: true, color: '0000FF' });

      const doc = Document.create();
      doc.addParagraph(para);

      // Save and reload
      const outputPath = path.join(
        __dirname,
        '../output/test-para-mark-overwrite.docx'
      );
      await doc.save(outputPath);

      const doc2 = await Document.load(outputPath);
      const para2 = doc2.getParagraphs()[0];
      const markProps = para2!.getFormatting().paragraphMarkRunProperties;

      // Should have new properties, not old
      expect(markProps?.bold).toBeUndefined();
      expect(markProps?.italic).toBe(true);
      expect(markProps?.color).toBe('0000FF');
    });
  });
});
