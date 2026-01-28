/**
 * Tests for Run language (Phase 4.1.10)
 * Tests language code and round-trip functionality
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import path from 'path';
import fs from 'fs';

describe('Run Language - Round Trip Tests', () => {
  const testOutputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('Language', () => {
    it('should set language code', () => {
      const run = new Run('English text');
      run.setLanguage('en-US');

      const formatting = run.getFormatting();
      expect(formatting.language).toBe('en-US');
    });

    it('should round-trip French language through buffer', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Texte français', {
        language: 'fr-FR',
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().language).toBe('fr-FR');
    });

    it('should round-trip Spanish language through file', async () => {
      const testFile = path.join(testOutputDir, 'test-language.docx');
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Texto español', {
        language: 'es-ES',
        bold: true,
      });
      para.addRun(run);

      doc.addParagraph(para);

      await doc.save(testFile);
      const loadedDoc = await Document.load(testFile);
      const paragraphs = loadedDoc.getParagraphs();

      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().language).toBe('es-ES');
      expect(loadedRun?.getFormatting().bold).toBe(true);
    });
  });
});
