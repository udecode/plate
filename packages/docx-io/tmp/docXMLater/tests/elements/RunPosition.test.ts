/**
 * Tests for Run vertical position (Phase 4.1.8)
 * Tests vertical text positioning and round-trip functionality
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import path from 'path';
import fs from 'fs';

describe('Run Position - Round Trip Tests', () => {
  const testOutputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('Vertical Position', () => {
    it('should set vertical position', () => {
      const run = new Run('Raised text');
      run.setPosition(10); // 10 half-points raised

      const formatting = run.getFormatting();
      expect(formatting.position).toBe(10);
    });

    it('should round-trip raised position through buffer', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Superscript alternative', {
        position: 10, // Positive = raised
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().position).toBe(10);
    });

    it('should round-trip lowered position through file', async () => {
      const testFile = path.join(testOutputDir, 'test-position.docx');
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Subscript alternative', {
        position: -10, // Negative = lowered
        bold: true,
      });
      para.addRun(run);

      doc.addParagraph(para);

      await doc.save(testFile);
      const loadedDoc = await Document.load(testFile);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().position).toBe(-10);
      expect(loadedRun?.getFormatting().bold).toBe(true);
    });
  });
});
