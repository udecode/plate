/**
 * Tests for Run emphasis marks (Phase 4.1.4)
 * Tests emphasis mark decorations and round-trip functionality
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import path from 'path';
import fs from 'fs';

describe('Run Emphasis Marks - Round Trip Tests', () => {
  const testOutputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('Emphasis Marks', () => {
    it('should set emphasis mark', () => {
      const run = new Run('Emphasized text');
      run.setEmphasis('dot');

      const formatting = run.getFormatting();
      expect(formatting.emphasis).toBe('dot');
    });

    it('should round-trip emphasis mark through buffer', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Text with dot emphasis', {
        emphasis: 'dot',
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().emphasis).toBe('dot');
    });

    it('should round-trip emphasis mark through file', async () => {
      const testFile = path.join(testOutputDir, 'test-emphasis-marks.docx');
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Circle emphasis', {
        emphasis: 'circle',
        bold: true,
      });
      para.addRun(run);

      doc.addParagraph(para);

      await doc.save(testFile);
      const loadedDoc = await Document.load(testFile);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().emphasis).toBe('circle');
      expect(loadedRun?.getFormatting().bold).toBe(true);
    });

    it('should support all emphasis mark types', async () => {
      const doc = Document.create();

      // Test all 4 emphasis mark types
      const emphasisTypes: Array<'dot' | 'comma' | 'circle' | 'underDot'> = [
        'dot',
        'comma',
        'circle',
        'underDot',
      ];

      for (const type of emphasisTypes) {
        const para = new Paragraph();
        const run = new Run(`Text with ${type} emphasis`, { emphasis: type });
        para.addRun(run);
        doc.addParagraph(para);
      }

      // Round-trip
      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      expect(paragraphs.length).toBe(4);
      expect(paragraphs[0]?.getRuns()[0]?.getFormatting().emphasis).toBe('dot');
      expect(paragraphs[1]?.getRuns()[0]?.getFormatting().emphasis).toBe(
        'comma'
      );
      expect(paragraphs[2]?.getRuns()[0]?.getFormatting().emphasis).toBe(
        'circle'
      );
      expect(paragraphs[3]?.getRuns()[0]?.getFormatting().emphasis).toBe(
        'underDot'
      );
    });
  });
});
