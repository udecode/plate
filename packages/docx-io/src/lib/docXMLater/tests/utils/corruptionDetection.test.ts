/**
 * Tests for corruptionDetection utility
 * Validates that we can detect when users pass XML strings to text methods
 */

import { describe, it, expect } from '@jest/globals';
import {
  detectCorruptionInText,
  suggestFix,
  looksCorrupted,
  detectCorruptionInDocument,
} from '../../src/utils/corruptionDetection';
import { Document } from '../../src/core/Document';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';

describe('CorruptionDetection', () => {
  describe('detectCorruptionInText', () => {
    it('should detect escaped XML tags', () => {
      const text =
        'Important Information&lt;w:t xml:space=&quot;preserve&quot;&gt;1&lt;/w:t&gt;';
      const result = detectCorruptionInText(text);

      expect(result.isCorrupted).toBe(true);
      expect(result.type).toBe('escaped-xml');
      expect(result.suggestedFix).toBe('Important Information1');
    });

    it('should detect raw XML tags', () => {
      const text = 'Important Information<w:t xml:space="preserve">1</w:t>';
      const result = detectCorruptionInText(text);

      expect(result.isCorrupted).toBe(true);
      expect(result.type).toBe('xml-tags');
      expect(result.suggestedFix).toBe('Important Information1');
    });

    it('should detect XML entities in suspicious patterns', () => {
      const text = 'Text with xml:space=&quot;preserve&quot; pattern';
      const result = detectCorruptionInText(text);

      expect(result.isCorrupted).toBe(true);
      expect(result.type).toBe('entities');
    });

    it('should detect mixed corruption types', () => {
      const text = '&lt;w:t&gt;Text<w:r>&quot;preserve&quot;</w:r>&lt;/w:t&gt;';
      const result = detectCorruptionInText(text);

      expect(result.isCorrupted).toBe(true);
      // Primary indicator is escaped XML with raw XML tags - classified as 'escaped-xml'
      expect(result.type).toBe('escaped-xml');
    });

    it('should not flag clean text', () => {
      const cleanTexts = [
        'Hello World',
        'Normal text with <brackets>',
        'Text with & ampersand',
        'Text with "quotes"',
        'Numbers 123 and symbols !@#$',
      ];

      for (const text of cleanTexts) {
        const result = detectCorruptionInText(text);
        expect(result.isCorrupted).toBe(false);
      }
    });

    it('should handle empty or null input', () => {
      expect(detectCorruptionInText('').isCorrupted).toBe(false);
      expect(detectCorruptionInText(null as any).isCorrupted).toBe(false);
      expect(detectCorruptionInText(undefined as any).isCorrupted).toBe(false);
    });
  });

  describe('suggestFix', () => {
    it('should clean escaped XML tags', () => {
      const corrupted =
        'Important Information&lt;w:t xml:space=&quot;preserve&quot;&gt;1&lt;/w:t&gt;';
      const fixed = suggestFix(corrupted);

      expect(fixed).toBe('Important Information1');
    });

    it('should clean raw XML tags', () => {
      const corrupted =
        'Important Information<w:t xml:space="preserve">1</w:t>';
      const fixed = suggestFix(corrupted);

      expect(fixed).toBe('Important Information1');
    });

    it('should clean mixed corruption', () => {
      const corrupted =
        'CVS Specialty&lt;w:t xml:space=&quot;preserve&quot;&gt;1</w:t>';
      const fixed = suggestFix(corrupted);

      expect(fixed).toBe('CVS Specialty1');
    });

    it('should handle multiple XML patterns', () => {
      const corrupted =
        '<w:r><w:t>Hello</w:t></w:r>&lt;w:p&gt;World&lt;/w:p&gt;';
      const fixed = suggestFix(corrupted);

      expect(fixed).toBe('HelloWorld');
    });

    it('should clean up extra whitespace', () => {
      const corrupted = 'Text  &lt;w:t&gt;  with   spaces  &lt;/w:t&gt;  ';
      const fixed = suggestFix(corrupted);

      expect(fixed).toBe('Text with spaces');
    });

    it('should handle already clean text', () => {
      const clean = 'Hello World';
      const fixed = suggestFix(clean);

      expect(fixed).toBe('Hello World');
    });

    it('should handle empty or null input', () => {
      expect(suggestFix('')).toBe('');
      expect(suggestFix(null as any)).toBe(null);
      expect(suggestFix(undefined as any)).toBe(undefined);
    });
  });

  describe('looksCorrupted', () => {
    it('should quickly detect obvious corruption', () => {
      const corruptedTexts = [
        'Text&lt;w:t&gt;more',
        'Text<w:t>more',
        'Text&lt;w:p&gt;para',
        'xml:space=&quot;preserve&quot;',
      ];

      for (const text of corruptedTexts) {
        expect(looksCorrupted(text)).toBe(true);
      }
    });

    it('should not flag clean text', () => {
      const cleanTexts = [
        'Hello World',
        'Normal text',
        'Text with <html> tags',
        'Some & text',
      ];

      for (const text of cleanTexts) {
        expect(looksCorrupted(text)).toBe(false);
      }
    });

    it('should handle empty or null input', () => {
      expect(looksCorrupted('')).toBe(false);
      expect(looksCorrupted(null as any)).toBe(false);
      expect(looksCorrupted(undefined as any)).toBe(false);
    });
  });

  describe('detectCorruptionInDocument', () => {
    it('should detect corruption in a document', () => {
      const doc = Document.create();

      // Add corrupted paragraphs (disable auto-clean to test detection)
      const para1 = new Paragraph();
      para1.addRun(
        new Run(
          'Important Information&lt;w:t xml:space=&quot;preserve&quot;&gt;1&lt;/w:t&gt;',
          { cleanXmlFromText: false }
        )
      );
      doc.addParagraph(para1);

      const para2 = new Paragraph();
      para2.addRun(
        new Run('CVS Specialty Pharmacy&lt;w:t&gt;1&lt;/w:t&gt;', {
          cleanXmlFromText: false,
        })
      );
      doc.addParagraph(para2);

      const report = detectCorruptionInDocument(doc);

      expect(report.isCorrupted).toBe(true);
      expect(report.totalLocations).toBe(2);
      expect(report.locations).toHaveLength(2);
      expect(report.statistics.escapedXml).toBeGreaterThan(0);
    });

    it('should provide correct location information', () => {
      const doc = Document.create();

      // Add clean paragraph
      const para1 = new Paragraph();
      para1.addRun(new Run('Clean text'));
      doc.addParagraph(para1);

      // Add corrupted paragraph (disable auto-clean)
      const para2 = new Paragraph();
      para2.addRun(new Run('Clean run'));
      para2.addRun(
        new Run('Corrupted&lt;w:t&gt;text&lt;/w:t&gt;', {
          cleanXmlFromText: false,
        })
      );
      doc.addParagraph(para2);

      const report = detectCorruptionInDocument(doc);

      expect(report.isCorrupted).toBe(true);
      expect(report.totalLocations).toBe(1);
      expect(report.locations[0]?.paragraphIndex).toBe(1);
      expect(report.locations[0]?.runIndex).toBe(1);
    });

    it('should not flag clean documents', () => {
      const doc = Document.create();

      const para1 = new Paragraph();
      para1.addRun(new Run('Hello World'));
      para1.addRun(new Run('This is clean text'));
      doc.addParagraph(para1);

      const para2 = new Paragraph();
      para2.addRun(new Run('More clean content'));
      doc.addParagraph(para2);

      const report = detectCorruptionInDocument(doc);

      expect(report.isCorrupted).toBe(false);
      expect(report.totalLocations).toBe(0);
      expect(report.locations).toHaveLength(0);
    });

    it('should generate helpful summary', () => {
      const doc = Document.create();

      const para = new Paragraph();
      para.addRun(
        new Run('Corrupted&lt;w:t&gt;text&lt;/w:t&gt;', {
          cleanXmlFromText: false,
        })
      );
      doc.addParagraph(para);

      const report = detectCorruptionInDocument(doc);

      expect(report.summary).toContain('Found 1 corrupted');
      expect(report.summary).toContain(
        'typically occurs when XML strings are passed'
      );
      expect(report.summary).toContain('cleanXmlFromText');
    });

    it('should handle empty documents', () => {
      const doc = Document.create();
      const report = detectCorruptionInDocument(doc);

      expect(report.isCorrupted).toBe(false);
      expect(report.totalLocations).toBe(0);
      expect(report.summary).toContain('No corruption detected');
    });

    it('should track statistics correctly', () => {
      const doc = Document.create();

      // Add different types of corruption (disable auto-clean)
      const para1 = new Paragraph();
      para1.addRun(
        new Run('Escaped&lt;w:t&gt;xml&lt;/w:t&gt;', {
          cleanXmlFromText: false,
        })
      );
      doc.addParagraph(para1);

      const para2 = new Paragraph();
      para2.addRun(new Run('Raw<w:t>xml</w:t>', { cleanXmlFromText: false }));
      doc.addParagraph(para2);

      const report = detectCorruptionInDocument(doc);

      expect(report.statistics.escapedXml).toBeGreaterThan(0);
      expect(report.statistics.xmlTags).toBeGreaterThan(0);
    });

    it('should provide suggested fixes for each location', () => {
      const doc = Document.create();

      const para = new Paragraph();
      para.addRun(
        new Run('Important Information&lt;w:t&gt;1&lt;/w:t&gt;', {
          cleanXmlFromText: false,
        })
      );
      doc.addParagraph(para);

      const report = detectCorruptionInDocument(doc);

      expect(report.locations[0]?.suggestedFix).toBe('Important Information1');
    });
  });

  describe('Real-world corruption patterns', () => {
    it('should detect the exact pattern from the bug report', () => {
      // This is the actual corrupted text from the issue
      const corruptedText =
        'Important Information&lt;w:t xml:space=&quot;preserve&quot;&gt;1</w:t>';

      const result = detectCorruptionInText(corruptedText);
      expect(result.isCorrupted).toBe(true);

      const fixed = suggestFix(corruptedText);
      expect(fixed).toBe('Important Information1');
    });

    it('should handle all patterns from the bug report', () => {
      const patterns = [
        'Important Information&lt;w:t xml:space=&quot;preserve&quot;&gt;1</w:t>',
        'CVS Specialty Pharmacy Plan Provisions&lt;w:t xml:space=&quot;preserve&quot;&gt;1</w:t>',
        'CCR Process&lt;w:t xml:space=&quot;preserve&quot;&gt;1</w:t>',
        'Related Documents&lt;w:t xml:space=&quot;preserve&quot;&gt;1</w:t>',
      ];

      for (const pattern of patterns) {
        const result = detectCorruptionInText(pattern);
        expect(result.isCorrupted).toBe(true);

        const fixed = suggestFix(pattern);
        expect(fixed).toMatch(/1$/); // Should end with "1"
        expect(fixed).not.toContain('<');
        expect(fixed).not.toContain('&lt;');
      }
    });
  });
});
