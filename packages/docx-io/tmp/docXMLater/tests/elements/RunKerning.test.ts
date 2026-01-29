/**
 * Tests for Run kerning (Phase 4.1.9)
 * Tests kerning threshold and round-trip functionality
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import path from 'path';
import fs from 'fs';

describe('Run Kerning - Round Trip Tests', () => {
  const testOutputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('Kerning', () => {
    it('should set kerning threshold', () => {
      const run = new Run('Kerned text');
      run.setKerning(12); // 12 half-points = 6pt threshold

      const formatting = run.getFormatting();
      expect(formatting.kerning).toBe(12);
    });

    it('should round-trip kerning through buffer', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Text with kerning', {
        kerning: 24, // 24 half-points = 12pt threshold
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().kerning).toBe(24);
    });

    it('should round-trip large kerning threshold through file', async () => {
      const testFile = path.join(testOutputDir, 'test-kerning.docx');
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Large threshold', {
        kerning: 48, // 48 half-points = 24pt threshold
        bold: true,
      });
      para.addRun(run);

      doc.addParagraph(para);

      await doc.save(testFile);
      const loadedDoc = await Document.load(testFile);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().kerning).toBe(48);
      expect(loadedRun?.getFormatting().bold).toBe(true);
    });
  });
});
