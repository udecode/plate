/**
 * Tests for Run advanced properties (RTL, vanish, noProof, snapToGrid)
 * Tests creation, XML generation, and round-trip through document save/load
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import * as path from 'path';
import * as fs from 'fs/promises';

describe('Run Advanced Properties - Round Trip Tests', () => {
  const TEMP_DIR = path.join(__dirname, '..', '..', 'temp-test-output');

  beforeAll(async () => {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  });

  afterAll(async () => {
    try {
      const files = await fs.readdir(TEMP_DIR);
      for (const file of files) {
        await fs.unlink(path.join(TEMP_DIR, file));
      }
      await fs.rmdir(TEMP_DIR);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('RTL (Right-to-Left)', () => {
    it('should set RTL text direction', () => {
      const run = new Run('مرحبا');  // Arabic text
      run.setRTL();

      expect(run.getFormatting().rtl).toBe(true);
    });

    it('should round-trip RTL property', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('مرحبا', { rtl: true });
      doc.addParagraph(para);

      const tempFile = path.join(TEMP_DIR, 'rtl-test.docx');
      await doc.save(tempFile);

      const loadedDoc = await Document.load(tempFile);
      const loadedRun = loadedDoc.getParagraphs()[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().rtl).toBe(true);
    });
  });

  describe('Vanish (Hidden Text)', () => {
    it('should set vanish property', () => {
      const run = new Run('Hidden Text');
      run.setVanish();

      expect(run.getFormatting().vanish).toBe(true);
    });

    it('should round-trip vanish property', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Hidden Text', { vanish: true });
      doc.addParagraph(para);

      const tempFile = path.join(TEMP_DIR, 'vanish-test.docx');
      await doc.save(tempFile);

      const loadedDoc = await Document.load(tempFile);
      const loadedRun = loadedDoc.getParagraphs()[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().vanish).toBe(true);
    });
  });

  describe('NoProof (Skip Spellcheck)', () => {
    it('should set noProof property', () => {
      const run = new Run('CodeVariable');
      run.setNoProof();

      expect(run.getFormatting().noProof).toBe(true);
    });

    it('should round-trip noProof property', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('CodeVariable', { noProof: true });
      doc.addParagraph(para);

      const tempFile = path.join(TEMP_DIR, 'noproof-test.docx');
      await doc.save(tempFile);

      const loadedDoc = await Document.load(tempFile);
      const loadedRun = loadedDoc.getParagraphs()[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().noProof).toBe(true);
    });
  });

  describe('SnapToGrid', () => {
    it('should set snapToGrid property', () => {
      const run = new Run('Grid Text');
      run.setSnapToGrid();

      expect(run.getFormatting().snapToGrid).toBe(true);
    });

    it('should round-trip snapToGrid property', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Grid Text', { snapToGrid: true });
      doc.addParagraph(para);

      const tempFile = path.join(TEMP_DIR, 'snaptogrid-test.docx');
      await doc.save(tempFile);

      const loadedDoc = await Document.load(tempFile);
      const loadedRun = loadedDoc.getParagraphs()[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().snapToGrid).toBe(true);
    });
  });

  describe('SpecVanish (Special Hidden)', () => {
    it('should set specVanish property', () => {
      const run = new Run('TOC Entry');
      run.setSpecVanish();

      expect(run.getFormatting().specVanish).toBe(true);
    });

    it('should round-trip specVanish property', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('TOC Entry', { specVanish: true });
      doc.addParagraph(para);

      const tempFile = path.join(TEMP_DIR, 'specvanish-test.docx');
      await doc.save(tempFile);

      const loadedDoc = await Document.load(tempFile);
      const loadedRun = loadedDoc.getParagraphs()[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().specVanish).toBe(true);
    });
  });

  describe('Text Effect', () => {
    it('should set text effect', () => {
      const run = new Run('Animated Text');
      run.setEffect('shimmer');

      expect(run.getFormatting().effect).toBe('shimmer');
    });

    it('should round-trip text effect', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Shimmer Text', { effect: 'shimmer' });
      doc.addParagraph(para);

      const tempFile = path.join(TEMP_DIR, 'effect-test.docx');
      await doc.save(tempFile);

      const loadedDoc = await Document.load(tempFile);
      const loadedRun = loadedDoc.getParagraphs()[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().effect).toBe('shimmer');
    });
  });

  describe('FitText', () => {
    it('should set fitText width', () => {
      const run = new Run('Fit Text');
      run.setFitText(1440); // 1 inch in twips

      expect(run.getFormatting().fitText).toBe(1440);
    });

    it('should round-trip fitText property', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Fit Text', { fitText: 1440 });
      doc.addParagraph(para);

      const tempFile = path.join(TEMP_DIR, 'fittext-test.docx');
      await doc.save(tempFile);

      const loadedDoc = await Document.load(tempFile);
      const loadedRun = loadedDoc.getParagraphs()[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().fitText).toBe(1440);
    });
  });

  describe('EastAsianLayout', () => {
    it('should set East Asian layout with vertical text', () => {
      const run = new Run('日本語');
      run.setEastAsianLayout({ vert: true, vertCompress: true });

      const formatting = run.getFormatting();
      expect(formatting.eastAsianLayout?.vert).toBe(true);
      expect(formatting.eastAsianLayout?.vertCompress).toBe(true);
    });

    it('should set East Asian layout with combine', () => {
      const run = new Run('中文');
      run.setEastAsianLayout({
        combine: true,
        combineBrackets: 'round'
      });

      const formatting = run.getFormatting();
      expect(formatting.eastAsianLayout?.combine).toBe(true);
      expect(formatting.eastAsianLayout?.combineBrackets).toBe('round');
    });

    it('should round-trip East Asian layout', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('日本語', {
        eastAsianLayout: {
          id: 1,
          vert: true,
          vertCompress: true,
          combine: true,
          combineBrackets: 'square'
        }
      });
      doc.addParagraph(para);

      const tempFile = path.join(TEMP_DIR, 'eastasian-test.docx');
      await doc.save(tempFile);

      const loadedDoc = await Document.load(tempFile);
      const loadedRun = loadedDoc.getParagraphs()[0]?.getRuns()[0];
      const layout = loadedRun?.getFormatting().eastAsianLayout;

      expect(layout).toBeDefined();
      expect(layout?.id).toBe(1);
      expect(layout?.vert).toBe(true);
      expect(layout?.vertCompress).toBe(true);
      expect(layout?.combine).toBe(true);
      expect(layout?.combineBrackets).toBe('square');
    });
  });

  describe('Combined Properties', () => {
    it('should support method chaining with all properties', () => {
      const run = new Run('Text')
        .setRTL()
        .setNoProof()
        .setSnapToGrid()
        .setSpecVanish()
        .setEffect('shimmer')
        .setFitText(1440)
        .setEastAsianLayout({ vert: true });

      expect(run.getFormatting().rtl).toBe(true);
      expect(run.getFormatting().noProof).toBe(true);
      expect(run.getFormatting().snapToGrid).toBe(true);
      expect(run.getFormatting().specVanish).toBe(true);
      expect(run.getFormatting().effect).toBe('shimmer');
      expect(run.getFormatting().fitText).toBe(1440);
      expect(run.getFormatting().eastAsianLayout?.vert).toBe(true);
    });
  });
});
