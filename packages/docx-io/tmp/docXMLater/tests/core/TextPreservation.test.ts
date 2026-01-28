/**
 * Text Preservation Tests
 * Ensures that text content is never lost during load/save cycles
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import { setGlobalLogger, ConsoleLogger, LogLevel, SilentLogger } from '../../src/utils/logger';
import path from 'path';
import * as fs from 'fs';
import * as os from 'os';

describe('Text Preservation', () => {
  let tempDir: string;

  beforeAll(() => {
    // Create temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docxml-test-'));
  });

  afterAll(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should preserve text through save and load cycle', async () => {
    const testPath = path.join(tempDir, 'test-preserve.docx');

    // Create document with various text content
    const doc1 = Document.create();

    doc1.createParagraph('Simple paragraph text');

    doc1.createParagraph().addText('Multiple ', { bold: true })
      .addText('formatted ', { italic: true })
      .addText('runs', { color: 'FF0000' });

    doc1.createParagraph('Text with special chars: < > & " \' @  #');

    const paraWithMultipleRuns = new Paragraph();
    for (let i = 0; i < 10; i++) {
      paraWithMultipleRuns.addRun(new Run(`Run ${i + 1} `));
    }
    doc1.addParagraph(paraWithMultipleRuns);

    // Save the document
    await doc1.save(testPath);

    // Load it back
    const doc2 = await Document.load(testPath);

    // Verify all paragraphs are preserved
    const paragraphs = doc2.getParagraphs();
    expect(paragraphs.length).toBe(4);

    // Verify text content
    expect(paragraphs[0]?.getText()).toBe('Simple paragraph text');
    expect(paragraphs[1]?.getText()).toBe('Multiple formatted runs');
    expect(paragraphs[2]?.getText()).toBe('Text with special chars: < > & " \' @  #');
    expect(paragraphs[3]?.getText()).toBe('Run 1 Run 2 Run 3 Run 4 Run 5 Run 6 Run 7 Run 8 Run 9 Run 10 ');

    // Verify run count
    expect(paragraphs[1]?.getRuns().length).toBe(3);
    expect(paragraphs[3]?.getRuns().length).toBe(10);

    // Verify formatting is preserved
    const formattedRuns = paragraphs[1]?.getRuns() || [];
    expect(formattedRuns[0]?.getFormatting().bold).toBe(true);
    expect(formattedRuns[1]?.getFormatting().italic).toBe(true);
    expect(formattedRuns[2]?.getFormatting().color).toBe('FF0000');
  });

  it('should preserve text with XML entities', async () => {
    const testPath = path.join(tempDir, 'test-xml-entities.docx');

    const doc1 = Document.create();
    doc1.createParagraph('<HTML> & "quotes" and \'apostrophes\'');
    doc1.createParagraph('Math: 5 < 10 && 10 > 5');
    doc1.createParagraph('Code: if (x && y) { return "value"; }');

    await doc1.save(testPath);

    const doc2 = await Document.load(testPath);
    const paragraphs = doc2.getParagraphs();

    expect(paragraphs[0]?.getText()).toBe('<HTML> & "quotes" and \'apostrophes\'');
    expect(paragraphs[1]?.getText()).toBe('Math: 5 < 10 && 10 > 5');
    expect(paragraphs[2]?.getText()).toBe('Code: if (x && y) { return "value"; }');
  });

  it('should preserve unicode and special characters', async () => {
    const testPath = path.join(tempDir, 'test-unicode.docx');

    const doc1 = Document.create();
    doc1.createParagraph('Unicode: \u00A9 \u00AE \u2122'); // ©  ®  ™
    doc1.createParagraph('Emoji: \u{1F600} \u{1F389}'); // 😀 🎉
    doc1.createParagraph('Accents: café, naïve, Zürich');
    doc1.createParagraph('Math symbols: ∑ ∫ √ ∞');
    doc1.createParagraph('Arrows: → ← ↑ ↓');

    await doc1.save(testPath);

    const doc2 = await Document.load(testPath);
    const paragraphs = doc2.getParagraphs();

    expect(paragraphs[0]?.getText()).toContain('©');
    expect(paragraphs[1]?.getText()).toContain('😀');
    expect(paragraphs[2]?.getText()).toBe('Accents: café, naïve, Zürich');
    expect(paragraphs[3]?.getText()).toContain('∑');
    expect(paragraphs[4]?.getText()).toContain('→');
  });

  it('should preserve whitespace and newlines', async () => {
    const testPath = path.join(tempDir, 'test-whitespace.docx');

    const doc1 = Document.create();
    doc1.createParagraph('Text with    multiple   spaces');
    doc1.createParagraph('Leading and trailing spaces   ');
    doc1.createParagraph('  Leading spaces');
    doc1.createParagraph('\tTab character');

    await doc1.save(testPath);

    const doc2 = await Document.load(testPath);
    const paragraphs = doc2.getParagraphs();

    // Note: Word normalizes multiple spaces, but preserves leading/trailing with xml:space="preserve"
    expect(paragraphs[0]?.getText()).toContain('multiple');
    expect(paragraphs[1]?.getText()).toContain('trailing');
    expect(paragraphs[2]?.getText()).toContain('Leading');
    expect(paragraphs[3]?.getText()).toContain('Tab');
  });

  it('should handle empty paragraphs correctly', async () => {
    const testPath = path.join(tempDir, 'test-empty-paras.docx');

    const doc1 = Document.create();
    doc1.createParagraph('First paragraph');
    doc1.createParagraph(''); // Empty paragraph
    doc1.createParagraph('Third paragraph');

    await doc1.save(testPath);

    const doc2 = await Document.load(testPath);
    const paragraphs = doc2.getParagraphs();

    expect(paragraphs.length).toBe(3);
    expect(paragraphs[0]?.getText()).toBe('First paragraph');
    expect(paragraphs[1]?.getText()).toBe('');
    expect(paragraphs[2]?.getText()).toBe('Third paragraph');
  });

  it('should warn when loading corrupted documents', async () => {
    // Enable console logging for this test
    setGlobalLogger(new ConsoleLogger(LogLevel.WARN));
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      const errorDocPath = path.join(__dirname, '../../ErrorDoc.docx');

      if (fs.existsSync(errorDocPath)) {
        const doc = await Document.load(errorDocPath);

        // Verify the warning was logged
        expect(consoleWarnSpy).toHaveBeenCalled();
        const warnCalls = consoleWarnSpy.mock.calls;
        const hasCorruptionWarning = warnCalls.some(call =>
          call.some(arg =>
            typeof arg === 'string' && arg.includes('corrupted or empty')
          )
        );

        expect(hasCorruptionWarning).toBe(true);

        // Verify parse warnings are available
        const warnings = doc.getParseWarnings();
        expect(warnings.length).toBeGreaterThan(0);

        const hasValidationWarning = warnings.some(w =>
          w.element === 'document-validation'
        );
        expect(hasValidationWarning).toBe(true);
      }
    } finally {
      consoleWarnSpy.mockRestore();
      setGlobalLogger(new SilentLogger());
    }
  });

  it('should warn when saving documents with mostly empty content', async () => {
    // Enable console logging for this test
    setGlobalLogger(new ConsoleLogger(LogLevel.WARN));
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const testPath = path.join(tempDir, 'test-empty-save.docx');

    try {
      const doc = Document.create();

      // Create many empty runs
      for (let i = 0; i < 20; i++) {
        const para = new Paragraph();
        para.addRun(new Run(''));
        doc.addParagraph(para);
      }

      await doc.save(testPath);

      // Verify the warning was logged
      expect(consoleWarnSpy).toHaveBeenCalled();
      const warnCalls = consoleWarnSpy.mock.calls;
      const hasEmptyWarning = warnCalls.some(call =>
        call.some(arg =>
          typeof arg === 'string' && arg.includes('empty')
        )
      );

      expect(hasEmptyWarning).toBe(true);
    } finally {
      consoleWarnSpy.mockRestore();
      setGlobalLogger(new SilentLogger());
    }
  });

  it('should handle multiple save/load cycles without data loss', async () => {
    const testPath = path.join(tempDir, 'test-multiple-cycles.docx');

    const originalText = [
      'First paragraph with important data',
      'Second paragraph with more data',
      'Third paragraph with even more data'
    ];

    // Cycle 1: Create and save
    const doc1 = Document.create();
    originalText.forEach(text => doc1.createParagraph(text));
    await doc1.save(testPath);

    // Cycle 2: Load and save
    const doc2 = await Document.load(testPath);
    await doc2.save(testPath);

    // Cycle 3: Load and save again
    const doc3 = await Document.load(testPath);
    await doc3.save(testPath);

    // Final load and verify
    const docFinal = await Document.load(testPath);
    const paragraphs = docFinal.getParagraphs();

    expect(paragraphs.length).toBe(3);
    paragraphs.forEach((para, index) => {
      expect(para?.getText()).toBe(originalText[index]);
    });
  });
});
