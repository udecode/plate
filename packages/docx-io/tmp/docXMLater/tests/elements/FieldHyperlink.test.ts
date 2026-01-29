/**
 * HYPERLINK Field Instruction Parsing Tests
 *
 * Tests for parsing HYPERLINK field instructions including:
 * - Basic URL parsing
 * - \l switch (anchor/fragment) parsing
 * - \o switch (tooltip) parsing
 * - \h switch detection
 * - URL decoding
 * - Full URL construction with anchors
 */

import { describe, it, expect } from '@jest/globals';
import {
  parseHyperlinkInstruction,
  buildHyperlinkInstruction,
  isHyperlinkInstruction,
  ParsedHyperlinkInstruction,
} from '../../src/elements/FieldHelpers';
import { ComplexField } from '../../src/elements/Field';

describe('HYPERLINK Field Instruction Parsing', () => {
  describe('parseHyperlinkInstruction', () => {
    it('should parse basic HYPERLINK instruction', () => {
      const result = parseHyperlinkInstruction('HYPERLINK "https://example.com/"');

      expect(result).not.toBeNull();
      expect(result!.url).toBe('https://example.com/');
      expect(result!.fullUrl).toBe('https://example.com/');
      expect(result!.anchor).toBeUndefined();
      expect(result!.tooltip).toBeUndefined();
    });

    it('should parse HYPERLINK with \\l anchor switch', () => {
      const result = parseHyperlinkInstruction(
        'HYPERLINK "https://example.com/" \\l "section1" \\h'
      );

      expect(result).not.toBeNull();
      expect(result!.url).toBe('https://example.com/');
      expect(result!.anchor).toBe('section1');
      expect(result!.fullUrl).toBe('https://example.com/#section1');
      expect(result!.hasHSwitch).toBe(true);
    });

    it('should parse anchor-only HYPERLINK (no URL)', () => {
      // This is common for "Top of the Document" links: HYPERLINK \l "_top"
      const result = parseHyperlinkInstruction('HYPERLINK \\l "_top" \\h');

      expect(result).not.toBeNull();
      expect(result!.url).toBe('');
      expect(result!.anchor).toBe('_top');
      expect(result!.fullUrl).toBe('#_top');
      expect(result!.hasHSwitch).toBe(true);
    });

    it('should parse anchor-only HYPERLINK with extra spaces', () => {
      // Word sometimes adds extra spaces in field codes
      const result = parseHyperlinkInstruction('HYPERLINK  \\l "_top"');

      expect(result).not.toBeNull();
      expect(result!.url).toBe('');
      expect(result!.anchor).toBe('_top');
      expect(result!.fullUrl).toBe('#_top');
    });

    it('should parse HYPERLINK with \\o tooltip switch', () => {
      const result = parseHyperlinkInstruction(
        'HYPERLINK "https://example.com/" \\o "Click here for more info"'
      );

      expect(result).not.toBeNull();
      expect(result!.url).toBe('https://example.com/');
      expect(result!.tooltip).toBe('Click here for more info');
    });

    it('should parse HYPERLINK with all switches', () => {
      const result = parseHyperlinkInstruction(
        'HYPERLINK "https://example.com/page" \\l "heading-1" \\o "Visit page" \\h'
      );

      expect(result).not.toBeNull();
      expect(result!.url).toBe('https://example.com/page');
      expect(result!.anchor).toBe('heading-1');
      expect(result!.tooltip).toBe('Visit page');
      expect(result!.hasHSwitch).toBe(true);
      expect(result!.fullUrl).toBe('https://example.com/page#heading-1');
    });

    it('should detect \\h switch at end of instruction', () => {
      const result = parseHyperlinkInstruction('HYPERLINK "https://example.com/" \\h');

      expect(result).not.toBeNull();
      expect(result!.hasHSwitch).toBe(true);
    });

    it('should detect missing \\h switch', () => {
      const result = parseHyperlinkInstruction('HYPERLINK "https://example.com/"');

      expect(result).not.toBeNull();
      expect(result!.hasHSwitch).toBe(false);
    });

    it('should decode URL-encoded characters', () => {
      const result = parseHyperlinkInstruction(
        'HYPERLINK "https://example.com/path%23section%20name"'
      );

      expect(result).not.toBeNull();
      expect(result!.url).toBe('https://example.com/path#section name');
    });

    it('should decode %23 (hash) in URL', () => {
      const result = parseHyperlinkInstruction(
        'HYPERLINK "https://thesource.cvshealth.com/nuxeo/thesource/%23!/view?docid=abc123"'
      );

      expect(result).not.toBeNull();
      expect(result!.url).toBe('https://thesource.cvshealth.com/nuxeo/thesource/#!/view?docid=abc123');
    });

    it('should decode anchor value as well', () => {
      const result = parseHyperlinkInstruction(
        'HYPERLINK "https://example.com/" \\l "!/view%3Fdocid=abc"'
      );

      expect(result).not.toBeNull();
      expect(result!.anchor).toBe('!/view?docid=abc');
    });

    it('should handle URL with existing fragment and anchor switch', () => {
      const result = parseHyperlinkInstruction(
        'HYPERLINK "https://example.com/#old-section" \\l "new-section"'
      );

      expect(result).not.toBeNull();
      // The anchor switch should replace the existing fragment
      expect(result!.fullUrl).toBe('https://example.com/#new-section');
    });

    it('should return null for non-HYPERLINK instructions', () => {
      expect(parseHyperlinkInstruction('TOC \\o "1-3" \\h')).toBeNull();
      expect(parseHyperlinkInstruction('REF bookmark1 \\h')).toBeNull();
      expect(parseHyperlinkInstruction('PAGE \\* MERGEFORMAT')).toBeNull();
    });

    it('should return null for empty or null input', () => {
      expect(parseHyperlinkInstruction('')).toBeNull();
      expect(parseHyperlinkInstruction(null as any)).toBeNull();
      expect(parseHyperlinkInstruction(undefined as any)).toBeNull();
    });

    it('should return null for HYPERLINK without URL', () => {
      expect(parseHyperlinkInstruction('HYPERLINK')).toBeNull();
      expect(parseHyperlinkInstruction('HYPERLINK \\h')).toBeNull();
    });

    it('should preserve raw instruction', () => {
      const instruction = 'HYPERLINK "https://example.com/" \\l "section" \\h';
      const result = parseHyperlinkInstruction(instruction);

      expect(result).not.toBeNull();
      expect(result!.rawInstruction).toBe(instruction);
    });

    it('should handle case-insensitive HYPERLINK keyword', () => {
      const result1 = parseHyperlinkInstruction('hyperlink "https://example.com/"');
      const result2 = parseHyperlinkInstruction('HyperLink "https://example.com/"');
      const result3 = parseHyperlinkInstruction('HYPERLINK "https://example.com/"');

      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      expect(result3).not.toBeNull();
      expect(result1!.url).toBe('https://example.com/');
      expect(result2!.url).toBe('https://example.com/');
      expect(result3!.url).toBe('https://example.com/');
    });

    it('should handle URLs with query parameters', () => {
      const result = parseHyperlinkInstruction(
        'HYPERLINK "https://example.com/search?q=test&page=1"'
      );

      expect(result).not.toBeNull();
      expect(result!.url).toBe('https://example.com/search?q=test&page=1');
    });
  });

  describe('buildHyperlinkInstruction', () => {
    it('should build basic HYPERLINK instruction', () => {
      const instruction = buildHyperlinkInstruction('https://example.com/');

      expect(instruction).toBe('HYPERLINK "https://example.com/" \\h');
    });

    it('should build HYPERLINK with anchor', () => {
      const instruction = buildHyperlinkInstruction('https://example.com/', 'section1');

      expect(instruction).toBe('HYPERLINK "https://example.com/" \\l "section1" \\h');
    });

    it('should build HYPERLINK with tooltip', () => {
      const instruction = buildHyperlinkInstruction(
        'https://example.com/',
        undefined,
        'Click here'
      );

      expect(instruction).toBe('HYPERLINK "https://example.com/" \\o "Click here" \\h');
    });

    it('should build HYPERLINK with all options', () => {
      const instruction = buildHyperlinkInstruction(
        'https://example.com/',
        'section1',
        'Click here'
      );

      expect(instruction).toBe(
        'HYPERLINK "https://example.com/" \\l "section1" \\o "Click here" \\h'
      );
    });
  });

  describe('isHyperlinkInstruction', () => {
    it('should return true for HYPERLINK instructions', () => {
      expect(isHyperlinkInstruction('HYPERLINK "https://example.com/"')).toBe(true);
      expect(isHyperlinkInstruction('hyperlink "https://example.com/"')).toBe(true);
      expect(isHyperlinkInstruction('HYPERLINK "url" \\l "anchor"')).toBe(true);
    });

    it('should return false for non-HYPERLINK instructions', () => {
      expect(isHyperlinkInstruction('TOC \\o "1-3"')).toBe(false);
      expect(isHyperlinkInstruction('REF bookmark')).toBe(false);
      expect(isHyperlinkInstruction('PAGE')).toBe(false);
    });

    it('should return false for empty/null input', () => {
      expect(isHyperlinkInstruction('')).toBe(false);
      expect(isHyperlinkInstruction(null as any)).toBe(false);
      expect(isHyperlinkInstruction(undefined as any)).toBe(false);
    });
  });

  describe('ComplexField HYPERLINK integration', () => {
    it('should auto-parse HYPERLINK instruction in ComplexField', () => {
      const field = new ComplexField({
        instruction: 'HYPERLINK "https://example.com/" \\l "section1" \\h',
        result: 'Click here',
      });

      expect(field.isHyperlinkField()).toBe(true);
      expect(field.getHyperlinkUrl()).toBe('https://example.com/#section1');

      const parsed = field.getParsedHyperlink();
      expect(parsed).not.toBeNull();
      expect(parsed!.url).toBe('https://example.com/');
      expect(parsed!.anchor).toBe('section1');
    });

    it('should not auto-parse non-HYPERLINK instruction', () => {
      const field = new ComplexField({
        instruction: 'TOC \\o "1-3" \\h',
        result: 'Table of Contents',
      });

      expect(field.isHyperlinkField()).toBe(false);
      expect(field.getHyperlinkUrl()).toBeUndefined();
      expect(field.getParsedHyperlink()).toBeUndefined();
    });

    it('should decode URL-encoded characters in ComplexField', () => {
      const field = new ComplexField({
        instruction:
          'HYPERLINK "https://thesource.cvshealth.com/nuxeo/thesource/%23!/view?docid=abc"',
        result: 'Link text',
      });

      expect(field.isHyperlinkField()).toBe(true);
      expect(field.getHyperlinkUrl()).toBe(
        'https://thesource.cvshealth.com/nuxeo/thesource/#!/view?docid=abc'
      );
    });

    it('should handle HYPERLINK with base URL and \\l anchor', () => {
      const field = new ComplexField({
        instruction:
          'HYPERLINK "https://thesource.cvshealth.com/nuxeo/thesource/" \\l "!/view?docid=abc123" \\h',
        result: 'Document Link',
      });

      expect(field.isHyperlinkField()).toBe(true);
      const parsed = field.getParsedHyperlink();
      expect(parsed!.url).toBe('https://thesource.cvshealth.com/nuxeo/thesource/');
      expect(parsed!.anchor).toBe('!/view?docid=abc123');
      expect(parsed!.fullUrl).toBe(
        'https://thesource.cvshealth.com/nuxeo/thesource/#!/view?docid=abc123'
      );
    });
  });
});
