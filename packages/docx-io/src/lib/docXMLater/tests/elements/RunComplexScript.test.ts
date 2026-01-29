/**
 * Tests for Run complex script variants (Phase 4.1.5)
 * Tests bold/italic for complex scripts (RTL languages) and round-trip functionality
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import path from 'path';
import fs from 'fs';

describe('Run Complex Script - Round Trip Tests', () => {
  const testOutputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('Complex Script Formatting', () => {
    it('should set complex script bold and italic', () => {
      const run = new Run('نص عربي');
      run.setComplexScriptBold(true);
      run.setComplexScriptItalic(true);

      const formatting = run.getFormatting();
      expect(formatting.complexScriptBold).toBe(true);
      expect(formatting.complexScriptItalic).toBe(true);
    });

    it('should round-trip complex script formatting through buffer', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('العربية', {
        complexScriptBold: true,
        complexScriptItalic: true,
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().complexScriptBold).toBe(true);
      expect(loadedRun?.getFormatting().complexScriptItalic).toBe(true);
    });

    it('should support mixed regular and complex script formatting', async () => {
      const testFile = path.join(testOutputDir, 'test-complex-script.docx');
      const doc = Document.create();
      const para = new Paragraph();

      // RTL text with both regular and complex script formatting
      const run = new Run('עברית', {
        bold: true,
        italic: true,
        complexScriptBold: true,
        complexScriptItalic: true,
      });
      para.addRun(run);

      doc.addParagraph(para);

      await doc.save(testFile);
      const loadedDoc = await Document.load(testFile);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().bold).toBe(true);
      expect(loadedRun?.getFormatting().italic).toBe(true);
      expect(loadedRun?.getFormatting().complexScriptBold).toBe(true);
      expect(loadedRun?.getFormatting().complexScriptItalic).toBe(true);
    });
  });
});
