/**
 * Tests for Run text effects (outline, shadow, emboss, imprint)
 * Tests creation, XML generation, and round-trip through document save/load
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import * as path from 'path';
import * as fs from 'fs/promises';

describe('Run Text Effects - Round Trip Tests', () => {
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

  describe('Outline Text Effect', () => {
    it('should set outline text effect', () => {
      const run = new Run('Outlined Text');
      run.setOutline();

      const formatting = run.getFormatting();
      expect(formatting.outline).toBe(true);
    });

    it('should round-trip outline text effect', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Outlined Text', { outline: true });
      doc.addParagraph(para);

      const tempFile = path.join(TEMP_DIR, 'outline-test.docx');
      await doc.save(tempFile);

      const loadedDoc = await Document.load(tempFile);
      const loadedPara = loadedDoc.getParagraphs()[0];
      const loadedRun = loadedPara?.getRuns()[0];

      expect(loadedRun).toBeDefined();
      expect(loadedRun?.getFormatting().outline).toBe(true);
    });

    it('should support method chaining with outline', () => {
      const run = new Run('Text')
        .setOutline()
        .setBold()
        .setItalic();

      expect(run.getFormatting().outline).toBe(true);
      expect(run.getFormatting().bold).toBe(true);
      expect(run.getFormatting().italic).toBe(true);
    });
  });

  describe('Shadow Text Effect', () => {
    it('should set shadow text effect', () => {
      const run = new Run('Shadow Text');
      run.setShadow();

      const formatting = run.getFormatting();
      expect(formatting.shadow).toBe(true);
    });

    it('should round-trip shadow text effect', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Shadow Text', { shadow: true });
      doc.addParagraph(para);

      const tempFile = path.join(TEMP_DIR, 'shadow-test.docx');
      await doc.save(tempFile);

      const loadedDoc = await Document.load(tempFile);
      const loadedPara = loadedDoc.getParagraphs()[0];
      const loadedRun = loadedPara?.getRuns()[0];

      expect(loadedRun).toBeDefined();
      expect(loadedRun?.getFormatting().shadow).toBe(true);
    });

    it('should support method chaining with shadow', () => {
      const run = new Run('Text')
        .setShadow()
        .setOutline()
        .setBold();

      expect(run.getFormatting().shadow).toBe(true);
      expect(run.getFormatting().outline).toBe(true);
      expect(run.getFormatting().bold).toBe(true);
    });
  });

  describe('Emboss Text Effect', () => {
    it('should set emboss text effect', () => {
      const run = new Run('Embossed Text');
      run.setEmboss();

      expect(run.getFormatting().emboss).toBe(true);
    });

    it('should round-trip emboss text effect', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Embossed Text', { emboss: true });
      doc.addParagraph(para);

      const tempFile = path.join(TEMP_DIR, 'emboss-test.docx');
      await doc.save(tempFile);

      const loadedDoc = await Document.load(tempFile);
      const loadedRun = loadedDoc.getParagraphs()[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().emboss).toBe(true);
    });
  });

  describe('Imprint Text Effect', () => {
    it('should set imprint text effect', () => {
      const run = new Run('Imprinted Text');
      run.setImprint();

      expect(run.getFormatting().imprint).toBe(true);
    });

    it('should round-trip imprint text effect', async () => {
      const doc = Document.create();
      const para = new Paragraph();
      para.addText('Imprinted Text', { imprint: true });
      doc.addParagraph(para);

      const tempFile = path.join(TEMP_DIR, 'imprint-test.docx');
      await doc.save(tempFile);

      const loadedDoc = await Document.load(tempFile);
      const loadedRun = loadedDoc.getParagraphs()[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().imprint).toBe(true);
    });

    it('should work with multiple effects combined', () => {
      const run = new Run('Text')
        .setOutline()
        .setShadow()
        .setEmboss();

      expect(run.getFormatting().outline).toBe(true);
      expect(run.getFormatting().shadow).toBe(true);
      expect(run.getFormatting().emboss).toBe(true);
    });
  });
});
