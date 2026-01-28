/**
 * Tests for Run horizontal scaling (Phase 4.1.7)
 * Tests text width scaling and round-trip functionality
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import path from 'path';
import fs from 'fs';

describe('Run Scaling - Round Trip Tests', () => {
  const testOutputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('Horizontal Scaling', () => {
    it('should set horizontal scaling', () => {
      const run = new Run('Scaled text');
      run.setScaling(200); // 200% width

      const formatting = run.getFormatting();
      expect(formatting.scaling).toBe(200);
    });

    it('should round-trip expanded scaling through buffer', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Wide text', {
        scaling: 200, // 200% = double width
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().scaling).toBe(200);
    });

    it('should round-trip condensed scaling through file', async () => {
      const testFile = path.join(testOutputDir, 'test-scaling.docx');
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Narrow text', {
        scaling: 50, // 50% = half width
        bold: true,
      });
      para.addRun(run);

      doc.addParagraph(para);

      await doc.save(testFile);
      const loadedDoc = await Document.load(testFile);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().scaling).toBe(50);
      expect(loadedRun?.getFormatting().bold).toBe(true);
    });
  });
});
