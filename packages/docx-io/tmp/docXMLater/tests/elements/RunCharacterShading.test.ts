/**
 * Tests for Run character shading (Phase 4.1.3)
 * Tests character shading/background and round-trip functionality
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import path from 'path';
import fs from 'fs';

describe('Run Character Shading - Round Trip Tests', () => {
  const testOutputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('Character Shading', () => {
    it('should set character shading with solid fill', () => {
      const run = new Run('Shaded text');
      run.setShading({ fill: 'FFFF00', val: 'solid' });

      const formatting = run.getFormatting();
      expect(formatting.shading).toEqual({
        fill: 'FFFF00',
        val: 'solid',
      });
    });

    it('should round-trip solid shading', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Yellow background', {
        shading: { fill: 'FFFF00', val: 'solid' },
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().shading?.fill).toBe('FFFF00');
      expect(loadedRun?.getFormatting().shading?.val).toBe('solid');
    });

    it('should round-trip pattern shading', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Pattern background');
      run.setShading({
        fill: 'FFFF00',
        color: '000000',
        val: 'diagStripe',
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedRun = loadedDoc.getParagraphs()[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().shading?.fill).toBe('FFFF00');
      expect(loadedRun?.getFormatting().shading?.color).toBe('000000');
      expect(loadedRun?.getFormatting().shading?.val).toBe('diagStripe');
    });

    it('should round-trip cross pattern shading', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Cross pattern', {
        shading: {
          fill: '00FF00',
          color: '0000FF',
          val: 'horzCross',
        },
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedRun = loadedDoc.getParagraphs()[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().shading?.fill).toBe('00FF00');
      expect(loadedRun?.getFormatting().shading?.color).toBe('0000FF');
      expect(loadedRun?.getFormatting().shading?.val).toBe('horzCross');
    });

    it('should save shading to file and load correctly', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('File test');
      run.setShading({ fill: 'FF00FF', val: 'solid' });
      para.addRun(run);

      doc.addParagraph(para);

      const filePath = path.join(testOutputDir, 'run-character-shading.docx');
      await doc.save(filePath);

      const loadedDoc = await Document.load(filePath);
      const paragraphs = loadedDoc.getParagraphs();
      const loadedRun = paragraphs[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().shading?.fill).toBe('FF00FF');
      expect(loadedRun?.getFormatting().shading?.val).toBe('solid');

      // Cleanup
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    it('should support method chaining with shading', () => {
      const run = new Run('Chained')
        .setShading({ fill: 'FFFF00', val: 'solid' })
        .setBold()
        .setItalic();

      const formatting = run.getFormatting();
      expect(formatting.shading?.fill).toBe('FFFF00');
      expect(formatting.bold).toBe(true);
      expect(formatting.italic).toBe(true);
    });

    it('should work with multiple runs with different shading', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      para.addRun(new Run('Normal '));
      para.addRun(new Run('Yellow', { shading: { fill: 'FFFF00', val: 'solid' } }));
      para.addRun(new Run(' and '));
      para.addRun(new Run('Green', { shading: { fill: '00FF00', val: 'solid' } }));

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const runs = loadedDoc.getParagraphs()[0]?.getRuns();

      expect(runs).toHaveLength(4);
      expect(runs?.[0]?.getFormatting().shading).toBeUndefined();
      expect(runs?.[1]?.getFormatting().shading?.fill).toBe('FFFF00');
      expect(runs?.[2]?.getFormatting().shading).toBeUndefined();
      expect(runs?.[3]?.getFormatting().shading?.fill).toBe('00FF00');
    });
  });
});
