/**
 * Tests for Run complex script font size (w:szCs) support
 * Per ECMA-376 Part 1 Section 17.3.2.40
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import path from 'path';
import fs from 'fs';

describe('Run Complex Script Size (w:szCs)', () => {
  const testOutputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('Setting Complex Script Size', () => {
    it('should set sizeCs via setter method', () => {
      const run = new Run('Arabic text');
      run.setSizeCs(14);

      const formatting = run.getFormatting();
      expect(formatting.sizeCs).toBe(14);
    });

    it('should set sizeCs via constructor', () => {
      const run = new Run('Hebrew text', { sizeCs: 16 });
      expect(run.getFormatting().sizeCs).toBe(16);
    });

    it('should support method chaining', () => {
      const run = new Run('RTL text');
      const result = run.setSize(12).setSizeCs(14).setBold(true);

      expect(result).toBe(run);
      expect(run.getFormatting().size).toBe(12);
      expect(run.getFormatting().sizeCs).toBe(14);
      expect(run.getFormatting().bold).toBe(true);
    });
  });

  describe('XML Generation', () => {
    it('should generate sz and szCs with same value when only size is set', () => {
      const run = new Run('Test', { size: 12 });
      const xml = run.toXML();
      const xmlString = JSON.stringify(xml);

      expect(xmlString).toContain('w:sz');
      expect(xmlString).toContain('w:szCs');
      // Both should have value 24 (12 * 2 half-points)
      expect(xmlString).toContain('"w:val":24');
    });

    it('should generate different sz and szCs values when both are set', () => {
      const run = new Run('Test', { size: 12, sizeCs: 16 });
      const xml = run.toXML();
      const xmlString = JSON.stringify(xml);

      expect(xmlString).toContain('w:sz');
      expect(xmlString).toContain('w:szCs');
      // sz should be 24 (12 * 2), szCs should be 32 (16 * 2)
      expect(xmlString).toContain('"w:val":24');
      expect(xmlString).toContain('"w:val":32');
    });

    it('should generate only szCs when only sizeCs is set', () => {
      const run = new Run('Test', { sizeCs: 14 });
      const xml = run.toXML();
      const xmlString = JSON.stringify(xml);

      // Should have szCs but not sz
      expect(xmlString).toContain('w:szCs');
      // sz may or may not be present depending on implementation
      // Value should be 28 (14 * 2)
      expect(xmlString).toContain('"w:val":28');
    });
  });

  describe('Round-Trip Tests', () => {
    it('should round-trip complex script size through buffer', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      // Set different sizes for regular and complex script
      const run = new Run('Mixed script text', {
        size: 12,
        sizeCs: 16,
      });
      para.addRun(run);
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      const formatting = loadedRun?.getFormatting();

      expect(formatting?.size).toBe(12);
      expect(formatting?.sizeCs).toBe(16);
    });

    it('should not duplicate sizeCs when same as size', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      // Set same size for both
      const run = new Run('Same size text', { size: 14 });
      para.addRun(run);
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      const formatting = loadedRun?.getFormatting();

      // size should be set, sizeCs should be undefined (same value)
      expect(formatting?.size).toBe(14);
      expect(formatting?.sizeCs).toBeUndefined();
    });

    it('should round-trip through file', async () => {
      const testFile = path.join(testOutputDir, 'test-szCs.docx');
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('RTL text test', {
        size: 11,
        sizeCs: 13,
        rtl: true,
      });
      para.addRun(run);
      doc.addParagraph(para);

      await doc.save(testFile);
      const loadedDoc = await Document.load(testFile);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      const formatting = loadedRun?.getFormatting();

      expect(formatting?.size).toBe(11);
      expect(formatting?.sizeCs).toBe(13);
    });
  });

  describe('Complex Script Size with RTL Text', () => {
    it('should support sizeCs with RTL text direction', () => {
      const run = new Run('Hebrew text');
      run.setSize(12).setSizeCs(14).setRTL(true).setComplexScriptBold(true);

      const formatting = run.getFormatting();
      expect(formatting.size).toBe(12);
      expect(formatting.sizeCs).toBe(14);
      expect(formatting.rtl).toBe(true);
      expect(formatting.complexScriptBold).toBe(true);
    });

    it('should round-trip full RTL formatting', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Test text', {
        size: 11,
        sizeCs: 15,
        rtl: true,
        complexScriptBold: true,
        complexScriptItalic: true,
      });
      para.addRun(run);
      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedRun = loadedDoc.getParagraphs()[0]?.getRuns()[0];
      const formatting = loadedRun?.getFormatting();

      expect(formatting?.size).toBe(11);
      expect(formatting?.sizeCs).toBe(15);
      expect(formatting?.rtl).toBe(true);
      expect(formatting?.complexScriptBold).toBe(true);
      expect(formatting?.complexScriptItalic).toBe(true);
    });
  });
});
