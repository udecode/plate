/**
 * Tests for Run character style reference (Phase 4.1.1)
 * Tests character style linking and round-trip functionality
 */

import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';
import { XMLBuilder } from '../../src/xml/XMLBuilder';
import path from 'path';
import fs from 'fs';

/**
 * Helper to convert Run's XMLElement to string for testing
 */
function runToXmlString(run: Run): string {
  const xml = run.toXML();
  const builder = new XMLBuilder();
  builder.element(xml.name, xml.attributes, xml.children);
  return builder.build();
}

describe('Run Character Style Reference - Round Trip Tests', () => {
  const testOutputDir = path.join(__dirname, '../output');

  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  describe('Character Style Reference', () => {
    it('should set character style reference', () => {
      const run = new Run('Styled text');
      run.setCharacterStyle('Emphasis');

      const formatting = run.getFormatting();
      expect(formatting.characterStyle).toBe('Emphasis');
    });

    it('should round-trip character style reference', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Text with character style', { characterStyle: 'Emphasis' });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const paragraphs = loadedDoc.getParagraphs();

      expect(paragraphs).toHaveLength(1);
      const loadedRun = paragraphs[0]?.getRuns()[0];
      expect(loadedRun?.getFormatting().characterStyle).toBe('Emphasis');
    });

    it('should save character style to file and load correctly', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Formatted text');
      run.setCharacterStyle('Strong');
      para.addRun(run);

      doc.addParagraph(para);

      const filePath = path.join(testOutputDir, 'run-character-style.docx');
      await doc.save(filePath);

      const loadedDoc = await Document.load(filePath);
      const paragraphs = loadedDoc.getParagraphs();
      const loadedRun = paragraphs[0]?.getRuns()[0];

      expect(loadedRun?.getFormatting().characterStyle).toBe('Strong');

      // Cleanup
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    it('should support method chaining', () => {
      const run = new Run('Chained')
        .setCharacterStyle('Emphasis')
        .setBold()
        .setItalic();

      const formatting = run.getFormatting();
      expect(formatting.characterStyle).toBe('Emphasis');
      expect(formatting.bold).toBe(true);
      expect(formatting.italic).toBe(true);
    });

    it('should work with multiple runs with different styles', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      para.addRun(new Run('Normal text '));
      para.addRun(new Run('Emphasized', { characterStyle: 'Emphasis' }));
      para.addRun(new Run(' and '));
      para.addRun(new Run('Strong', { characterStyle: 'Strong' }));

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const runs = loadedDoc.getParagraphs()[0]?.getRuns();

      expect(runs).toHaveLength(4);
      expect(runs?.[0]?.getFormatting().characterStyle).toBeUndefined();
      expect(runs?.[1]?.getFormatting().characterStyle).toBe('Emphasis');
      expect(runs?.[2]?.getFormatting().characterStyle).toBeUndefined();
      expect(runs?.[3]?.getFormatting().characterStyle).toBe('Strong');
    });
  });

  describe('Underline with Character Style', () => {
    it('should output w:u val=none when underline is false and characterStyle is set', () => {
      // When a character style (like Hyperlink) has underline defined,
      // setting underline=false should output <w:u w:val="none"/> to override the style
      const run = new Run('Not underlined', {
        characterStyle: 'Hyperlink',
        underline: false,
      });

      const xmlStr = runToXmlString(run);

      // Should have rStyle
      expect(xmlStr).toContain('w:rStyle');
      expect(xmlStr).toContain('Hyperlink');

      // Should have w:u with val="none" to override style's underline
      expect(xmlStr).toContain('<w:u w:val="none"/>');
    });

    it('should not output w:u when underline is false and no characterStyle', () => {
      // Without a character style, no need for explicit "none" override
      const run = new Run('Normal text', {
        underline: false,
      });

      const xmlStr = runToXmlString(run);

      // Should NOT have w:u at all
      expect(xmlStr).not.toContain('w:u');
    });

    it('should output w:u with style value when underline is set to a style', () => {
      const run = new Run('Underlined text', {
        characterStyle: 'Hyperlink',
        underline: 'single',
      });

      const xmlStr = runToXmlString(run);

      // Should have rStyle
      expect(xmlStr).toContain('w:rStyle');
      expect(xmlStr).toContain('Hyperlink');

      // Should have w:u with val="single"
      expect(xmlStr).toContain('<w:u w:val="single"/>');
    });

    it('should output w:u val=none when underline is explicitly "none"', () => {
      const run = new Run('Not underlined', {
        characterStyle: 'Hyperlink',
        underline: 'none',
      });

      const xmlStr = runToXmlString(run);

      // Should have w:u with val="none"
      expect(xmlStr).toContain('<w:u w:val="none"/>');
    });

    it('should preserve underline=false with characterStyle through round-trip', async () => {
      const doc = Document.create();
      const para = new Paragraph();

      const run = new Run('Text after hyperlink', {
        characterStyle: 'Hyperlink',
        underline: false,
        color: '000000',
      });
      para.addRun(run);

      doc.addParagraph(para);

      const buffer = await doc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);
      const loadedRuns = loadedDoc.getParagraphs()[0]?.getRuns();

      expect(loadedRuns).toHaveLength(1);
      const loadedRun = loadedRuns?.[0];
      expect(loadedRun?.getFormatting().characterStyle).toBe('Hyperlink');
      // After round-trip, underline should be "none" (parsed from w:u val="none")
      expect(loadedRun?.getFormatting().underline).toBe('none');
    });
  });

  describe('isHyperlinkStyled() Helper Method', () => {
    it('should return true for runs with Hyperlink character style', () => {
      const run = new Run('Click here', { characterStyle: 'Hyperlink' });
      expect(run.isHyperlinkStyled()).toBe(true);
    });

    it('should return false for runs without Hyperlink character style', () => {
      const run = new Run('Normal text');
      expect(run.isHyperlinkStyled()).toBe(false);
    });

    it('should return false for runs with other character styles', () => {
      const run = new Run('Emphasized text', { characterStyle: 'Emphasis' });
      expect(run.isHyperlinkStyled()).toBe(false);
    });

    it('should return false for runs with Strong character style', () => {
      const run = new Run('Strong text', { characterStyle: 'Strong' });
      expect(run.isHyperlinkStyled()).toBe(false);
    });

    it('should allow skipping hyperlink-styled runs when applying bulk styles', () => {
      const doc = Document.create();
      const para = new Paragraph();

      // Add normal run and hyperlink-styled run
      para.addRun(new Run('Normal text', { color: 'FF0000' }));
      para.addRun(new Run('Hyperlink text', { characterStyle: 'Hyperlink', color: '0000FF' }));
      para.addRun(new Run('More normal text', { color: 'FF0000' }));

      doc.addParagraph(para);

      // Apply black color to all runs EXCEPT hyperlink-styled ones
      const runs = para.getRuns();
      for (const run of runs) {
        if (run.isHyperlinkStyled()) {
          continue; // Skip hyperlink runs
        }
        run.setColor('000000');
      }

      // Verify: normal runs changed to black, hyperlink run unchanged
      expect(runs[0]?.getFormatting().color).toBe('000000');
      expect(runs[1]?.getFormatting().color).toBe('0000FF'); // Preserved
      expect(runs[2]?.getFormatting().color).toBe('000000');
    });

    it('should work with setCharacterStyle method', () => {
      const run = new Run('Text');
      expect(run.isHyperlinkStyled()).toBe(false);

      run.setCharacterStyle('Hyperlink');
      expect(run.isHyperlinkStyled()).toBe(true);

      run.setCharacterStyle('Emphasis');
      expect(run.isHyperlinkStyled()).toBe(false);
    });
  });
});
