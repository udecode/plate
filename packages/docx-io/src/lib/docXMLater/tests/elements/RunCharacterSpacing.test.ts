/**
 * Tests for Run character spacing (Phase 4.1.6)
 * Tests letter spacing and round-trip functionality
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import path from 'path';
import fs from 'fs';

describe('Run Character Spacing - Round Trip Tests', () => {
  const testOutputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('Character Spacing', () => {
    it('should set character spacing', () => {
      const run = new Run('Spaced text');
      run.setCharacterSpacing(100); // 100 twips expansion

      const formatting = run.getFormatting();
      expect(formatting.characterSpacing).toBe(100);
    });

    it('should round-trip positive character spacing through buffer', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Expanded text', {
        characterSpacing: 100, // Positive = expanded
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().characterSpacing).toBe(100);
    });

    it('should round-trip negative character spacing (condensed) through file', async () => {
      const testFile = path.join(testOutputDir, 'test-character-spacing.docx');
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Condensed text', {
        characterSpacing: -50, // Negative = condensed
        bold: true,
      });
      para.addRun(run);

      doc.addParagraph(para);

      await doc.save(testFile);
      const loadedDoc = await Document.load(testFile);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().characterSpacing).toBe(-50);
      expect(loadedRun?.getFormatting().bold).toBe(true);
    });
  });
});
