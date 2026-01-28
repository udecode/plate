/**
 * Text Element Protection Tests
 * Ensures critical protections from the error analysis report are working
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { XMLBuilder, XMLElement } from '../../src/xml/XMLBuilder';
import { Run } from '../../src/elements/Run';
import { Document } from '../../src/core/Document';
import { setGlobalLogger, ConsoleLogger, LogLevel, SilentLogger } from '../../src/utils/logger';
import * as fs from 'fs';
import * as os from 'os';
import path from 'path';

describe('Text Element Protection (from Error Analysis Report)', () => {
  describe('Issue #1: Self-Closing Text Element Protection', () => {
    it('should throw error if w:t is marked as self-closing', () => {
      const builder = new XMLBuilder();

      // Try to create a self-closing text element
      const element: XMLElement = {
        name: 'w:t',
        attributes: { 'xml:space': 'preserve' },
        selfClosing: true
      };

      expect(() => {
        builder.element(element.name, element.attributes).selfClosingElement('w:t', { 'xml:space': 'preserve' }).build();
      }).toThrow();
    });

    it('should never create self-closing w:t elements', () => {
      const element = XMLBuilder.w('t', { 'xml:space': 'preserve' }, ['Hello']);
      const builder = new XMLBuilder();
      const xml = builder.element(element.name!, element.attributes, element.children).build();

      expect(xml).not.toContain('<w:t xml:space="preserve"/>');
      expect(xml).not.toContain('<w:t/>');
      expect(xml).toContain('<w:t xml:space="preserve">Hello</w:t>');
    });

    it('should preserve empty text with proper closing tag', () => {
      const element = XMLBuilder.w('t', { 'xml:space': 'preserve' }, ['']);
      const builder = new XMLBuilder();
      const xml = builder.element(element.name!, element.attributes, element.children).build();

      expect(xml).toBe('<w:t xml:space="preserve"></w:t>');
      expect(xml).not.toContain('/>');
    });
  });

  describe('Issue #2: Run Text Validation', () => {
    it('should warn when creating run with undefined text', () => {
      // Enable console logging for this test
      setGlobalLogger(new ConsoleLogger(LogLevel.WARN));
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      try {
        const run = new Run(undefined as any);
        run.toXML();

        expect(spy).toHaveBeenCalled();
        const callArgs = spy.mock.calls[0];
        expect(callArgs && callArgs.some(arg =>
          typeof arg === 'string' && arg.includes('undefined')
        )).toBe(true);
      } finally {
        spy.mockRestore();
        setGlobalLogger(new SilentLogger());
      }
    });

    it('should warn when creating run with null text', () => {
      // Enable console logging for this test
      setGlobalLogger(new ConsoleLogger(LogLevel.WARN));
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      try {
        const run = new Run(null as any);
        run.toXML();

        expect(spy).toHaveBeenCalled();
        const callArgs = spy.mock.calls[0];
        expect(callArgs && callArgs.some(arg =>
          typeof arg === 'string' && arg.includes('null')
        )).toBe(true);
      } finally {
        spy.mockRestore();
        setGlobalLogger(new SilentLogger());
      }
    });

    it('should convert undefined/null text to empty string', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      try {
        const run = new Run(undefined as any);
        const xml = run.toXML();

        // Should still generate valid XML with empty text
        const builder = new XMLBuilder();
        const xmlStr = builder.element(xml.name!, xml.attributes, xml.children).build();

        expect(xmlStr).toContain('<w:t');
        expect(xmlStr).not.toContain('undefined');
        expect(xmlStr).not.toContain('null');
      } finally {
        spy.mockRestore();
      }
    });
  });

  describe('Issue #8: Run Helper Methods', () => {
    it('should correctly identify runs with text', () => {
      const runWithText = new Run('Hello World');
      const runEmpty = new Run('');
      const runUndefined = new Run(undefined as any);

      expect(runWithText.hasText()).toBe(true);
      expect(runEmpty.hasText()).toBe(false);
      expect(runUndefined.hasText()).toBe(false);
    });

    it('should correctly identify runs with formatting', () => {
      const runPlain = new Run('Text');
      const runBold = new Run('Text', { bold: true });
      const runFormatted = new Run('', { italic: true, color: 'FF0000' });

      expect(runPlain.hasFormatting()).toBe(false);
      expect(runBold.hasFormatting()).toBe(true);
      expect(runFormatted.hasFormatting()).toBe(true);
    });

    it('should validate runs correctly', () => {
      const validRun1 = new Run('Text');
      const validRun2 = new Run('', { bold: true });
      const invalidRun = new Run('');

      expect(validRun1.isValid()).toBe(true);
      expect(validRun2.isValid()).toBe(true);
      expect(invalidRun.isValid()).toBe(false);
    });
  });

  describe('Round-Trip Text Preservation', () => {
    let tempDir: string;

    beforeAll(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docxml-validation-'));
    });

    afterAll(() => {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should preserve text through load-save cycle', async () => {
      const testPath = path.join(tempDir, 'round-trip-test.docx');

      // Create document with text
      const doc1 = Document.create();
      doc1.createParagraph('Test text content that must be preserved');

      // Save
      await doc1.save(testPath);

      // Load
      const doc2 = await Document.load(testPath);
      const paras = doc2.getParagraphs();

      expect(paras.length).toBeGreaterThan(0);
      expect(paras[0]?.getRuns().length).toBeGreaterThan(0);
      expect(paras[0]?.getRuns()[0]?.getText()).toBe('Test text content that must be preserved');
    });

    it('should preserve special characters through round-trip', async () => {
      const testPath = path.join(tempDir, 'special-chars-test.docx');

      const specialText = '<HTML> & "quotes" and \'apostrophes\'';

      const doc1 = Document.create();
      doc1.createParagraph(specialText);

      await doc1.save(testPath);

      const doc2 = await Document.load(testPath);
      const text = doc2.getParagraphs()[0]?.getText();

      expect(text).toBe(specialText);
    });

    it('should preserve formatted text through round-trip', async () => {
      const testPath = path.join(tempDir, 'formatted-test.docx');

      const doc1 = Document.create();
      const para = doc1.createParagraph();
      para.addText('Bold', { bold: true });
      para.addText(' Normal ');
      para.addText('Italic', { italic: true });

      await doc1.save(testPath);

      const doc2 = await Document.load(testPath);
      const runs = doc2.getParagraphs()[0]?.getRuns();

      expect(runs).toBeDefined();
      expect(runs!.length).toBe(3);
      expect(runs![0]?.getText()).toBe('Bold');
      expect(runs![0]?.getFormatting().bold).toBe(true);
      expect(runs![1]?.getText()).toBe(' Normal ');
      expect(runs![2]?.getText()).toBe('Italic');
      expect(runs![2]?.getFormatting().italic).toBe(true);
    });

    it('should detect multiple round-trips without data loss', async () => {
      const testPath = path.join(tempDir, 'multi-round-trip.docx');

      const originalTexts = [
        'First paragraph',
        'Second paragraph',
        'Third paragraph with special chars: <>&"\''
      ];

      // Round trip 1
      const doc1 = Document.create();
      originalTexts.forEach(text => doc1.createParagraph(text));
      await doc1.save(testPath);

      // Round trip 2
      const doc2 = await Document.load(testPath);
      await doc2.save(testPath);

      // Round trip 3
      const doc3 = await Document.load(testPath);
      await doc3.save(testPath);

      // Final verification
      const docFinal = await Document.load(testPath);
      const paras = docFinal.getParagraphs();

      expect(paras.length).toBe(3);
      paras.forEach((para, i) => {
        expect(para?.getText()).toBe(originalTexts[i]);
      });
    });
  });
});
