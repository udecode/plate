/**
 * Tests for Run theme color properties
 * Tests theme color, tint, and shade functionality including round-trip
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run, ThemeColorValue } from '../../src/elements/Run';
import path from 'path';
import fs from 'fs';

describe('Run Theme Color - Round Trip Tests', () => {
  const testOutputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('Theme Color', () => {
    it('should set theme color', () => {
      const run = new Run('Themed text');
      run.setThemeColor('accent1');

      const formatting = run.getFormatting();
      expect(formatting.themeColor).toBe('accent1');
    });

    it('should set theme color via constructor', () => {
      const run = new Run('Themed text', { themeColor: 'dark1' });
      expect(run.getFormatting().themeColor).toBe('dark1');
    });

    it('should round-trip theme color through buffer', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Accent colored text', {
        themeColor: 'accent1',
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().themeColor).toBe('accent1');
    });

    it('should round-trip theme color through file', async () => {
      const testFile = path.join(testOutputDir, 'test-theme-color.docx');
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Hyperlink colored text', {
        themeColor: 'hyperlink',
      });
      para.addRun(run);

      doc.addParagraph(para);

      await doc.save(testFile);
      const loadedDoc = await Document.load(testFile);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().themeColor).toBe('hyperlink');
    });
  });

  describe('Theme Tint', () => {
    it('should set theme tint', () => {
      const run = new Run('Tinted text');
      run.setThemeColor('accent1').setThemeTint(128);

      const formatting = run.getFormatting();
      expect(formatting.themeColor).toBe('accent1');
      expect(formatting.themeTint).toBe(128);
    });

    it('should round-trip theme tint through buffer', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Tinted accent color', {
        themeColor: 'accent2',
        themeTint: 191, // BF in hex
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().themeColor).toBe('accent2');
      expect(loadedRun?.getFormatting().themeTint).toBe(191);
    });
  });

  describe('Theme Shade', () => {
    it('should set theme shade', () => {
      const run = new Run('Shaded text');
      run.setThemeColor('accent1').setThemeShade(128);

      const formatting = run.getFormatting();
      expect(formatting.themeColor).toBe('accent1');
      expect(formatting.themeShade).toBe(128);
    });

    it('should round-trip theme shade through buffer', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Shaded accent color', {
        themeColor: 'accent3',
        themeShade: 64, // 40 in hex
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().themeColor).toBe('accent3');
      expect(loadedRun?.getFormatting().themeShade).toBe(64);
    });
  });

  describe('Combined Theme Color with Hex Color', () => {
    it('should preserve both hex color and theme color', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      // Per OOXML spec, both can be present - hex is fallback for apps
      // that don't support theme colors
      const run = new Run('Theme with fallback', {
        color: '4472C4', // Fallback hex color
        themeColor: 'accent1',
        themeTint: 128,
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      const formatting = loadedRun?.getFormatting();
      expect(formatting?.color).toBe('4472C4');
      expect(formatting?.themeColor).toBe('accent1');
      expect(formatting?.themeTint).toBe(128);
    });
  });

  describe('All Theme Color Values', () => {
    const themeColors: ThemeColorValue[] = [
      'dark1',
      'light1',
      'dark2',
      'light2',
      'accent1',
      'accent2',
      'accent3',
      'accent4',
      'accent5',
      'accent6',
      'hyperlink',
      'followedHyperlink',
      'background1',
      'text1',
      'background2',
      'text2',
    ];

    it.each(
      themeColors
    )('should round-trip theme color: %s', async (themeColor) => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run(`Text with ${themeColor}`, { themeColor });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().themeColor).toBe(themeColor);
    });
  });

  describe('XML Generation', () => {
    it('should generate correct XML for theme color only', () => {
      const run = new Run('Test', { themeColor: 'accent1' });
      const xml = run.toXML();
      const xmlString = JSON.stringify(xml);

      expect(xmlString).toContain('w:themeColor');
      expect(xmlString).toContain('accent1');
    });

    it('should generate correct XML for theme color with tint', () => {
      const run = new Run('Test', { themeColor: 'accent1', themeTint: 191 });
      const xml = run.toXML();
      const xmlString = JSON.stringify(xml);

      expect(xmlString).toContain('w:themeColor');
      expect(xmlString).toContain('w:themeTint');
      expect(xmlString).toContain('BF'); // 191 in hex
    });

    it('should generate correct XML for theme color with shade', () => {
      const run = new Run('Test', { themeColor: 'accent1', themeShade: 128 });
      const xml = run.toXML();
      const xmlString = JSON.stringify(xml);

      expect(xmlString).toContain('w:themeColor');
      expect(xmlString).toContain('w:themeShade');
      expect(xmlString).toContain('80'); // 128 in hex
    });
  });
});
