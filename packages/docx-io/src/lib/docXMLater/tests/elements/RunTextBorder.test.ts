/**
 * Tests for Run text border (Phase 4.1.2)
 * Tests text border and round-trip functionality
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import path from 'path';
import fs from 'fs';

describe('Run Text Border - Round Trip Tests', () => {
  const testOutputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('Text Border', () => {
    it('should set text border with all properties', () => {
      const run = new Run('Bordered text');
      run.setBorder({
        style: 'single',
        size: 4,
        color: 'FF0000',
        space: 1,
      });

      const formatting = run.getFormatting();
      expect(formatting.border).toEqual({
        style: 'single',
        size: 4,
        color: 'FF0000',
        space: 1,
      });
    });

    it('should round-trip text border with single style', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Single border', {
        border: { style: 'single', size: 4, color: '000000' },
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().border?.style).toBe('single');
      expect(loadedRun?.getFormatting().border?.size).toBe(4);
      expect(loadedRun?.getFormatting().border?.color).toBe('000000');
    });

    it('should round-trip text border with double style', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Double border');
      run.setBorder({ style: 'double', size: 6, color: '0000FF', space: 2 });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedRun = loadedDoc.getParagraphs()[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().border?.style).toBe('double');
      expect(loadedRun?.getFormatting().border?.size).toBe(6);
      expect(loadedRun?.getFormatting().border?.color).toBe('0000FF');
      expect(loadedRun?.getFormatting().border?.space).toBe(2);
    });

    it('should round-trip text border with dashed style', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Dashed border', {
        border: { style: 'dashed', size: 8, color: 'FF0000' },
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedRun = loadedDoc.getParagraphs()[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().border?.style).toBe('dashed');
      expect(loadedRun?.getFormatting().border?.size).toBe(8);
    });

    it('should round-trip text border with thick style', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Thick border', {
        border: { style: 'thick', size: 12, color: '00FF00' },
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedRun = loadedDoc.getParagraphs()[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().border?.style).toBe('thick');
      expect(loadedRun?.getFormatting().border?.size).toBe(12);
      expect(loadedRun?.getFormatting().border?.color).toBe('00FF00');
    });

    it('should save text border to file and load correctly', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('File test');
      run.setBorder({ style: 'double', size: 6, color: 'FF0000', space: 1 });
      para.addRun(run);

      doc.addParagraph(para);

      const filePath = path.join(testOutputDir, 'run-text-border.docx');
      await doc.save(filePath);

      const loadedDoc = await Document.load(filePath);
      const paragraphs = loadedDoc.getParagraphs();
      const loadedRun = paragraphs[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().border?.style).toBe('double');
      expect(loadedRun?.getFormatting().border?.size).toBe(6);
      expect(loadedRun?.getFormatting().border?.color).toBe('FF0000');
      expect(loadedRun?.getFormatting().border?.space).toBe(1);

      // Cleanup
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    it('should support method chaining with border', () => {
      const run = new Run('Chained')
        .setBorder({ style: 'single', size: 4, color: '000000' })
        .setBold()
        .setItalic();

      const formatting = run.getFormatting();
      expect(formatting.border?.style).toBe('single');
      expect(formatting.bold).toBe(true);
      expect(formatting.italic).toBe(true);
    });

    it('should work with multiple runs with different borders', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      para.addRun(new Run('Normal '));
      para.addRun(
        new Run('Single', {
          border: { style: 'single', size: 4, color: '000000' },
        })
      );
      para.addRun(new Run(' and '));
      para.addRun(
        new Run('Double', {
          border: { style: 'double', size: 6, color: 'FF0000' },
        })
      );

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const runs = loadedDoc.getParagraphs()[0]?.getRuns();

      expect(runs).toHaveLength(4);
      expect(runs?.[0]?.getFormatting().border).toBeUndefined();
      expect(runs?.[1]?.getFormatting().border?.style).toBe('single');
      expect(runs?.[2]?.getFormatting().border).toBeUndefined();
      expect(runs?.[3]?.getFormatting().border?.style).toBe('double');
    });
  });
});
