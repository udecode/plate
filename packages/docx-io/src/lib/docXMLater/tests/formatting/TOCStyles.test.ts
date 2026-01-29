/**
 * Tests for TOC (Table of Contents) Entry Style Formatting
 *
 * Validates that TOC 1-9 styles can be created and formatted
 * to control how Word renders TOC entries when the field is updated.
 */

import { Document, Style } from '../../src';

describe('TOC Entry Style Formatting', () => {
  let doc: Document;

  beforeEach(() => {
    doc = Document.create();
  });

  afterEach(() => {
    doc.dispose();
  });

  describe('formatTOCStyles()', () => {
    it('should create TOC styles with specified formatting', () => {
      doc.formatTOCStyles({
        run: {
          font: 'Verdana',
          size: 12,
          color: '0000FF',
          underline: true,
          bold: false,
          italic: false,
        },
        paragraph: { spacing: { before: 0, after: 0 } },
      });

      const toc1 = doc.getStyle('TOC1');
      expect(toc1).toBeDefined();
      expect(toc1?.getRunFormatting()?.font).toBe('Verdana');
      expect(toc1?.getRunFormatting()?.size).toBe(12);
      expect(toc1?.getRunFormatting()?.color).toBe('0000FF');
      expect(toc1?.getRunFormatting()?.underline).toBe(true);
      expect(toc1?.getRunFormatting()?.bold).toBe(false);
      expect(toc1?.getRunFormatting()?.italic).toBe(false);
      expect(toc1?.getParagraphFormatting()?.spacing?.before).toBe(0);
      expect(toc1?.getParagraphFormatting()?.spacing?.after).toBe(0);
    });

    it('should format all 9 TOC levels by default', () => {
      const result = doc.formatTOCStyles({
        run: { font: 'Verdana', size: 12 },
      });

      expect(result.formatted).toHaveLength(9);
      for (let i = 1; i <= 9; i++) {
        expect(doc.getStyle(`TOC${i}`)).toBeDefined();
      }
    });

    it('should format only specified levels', () => {
      const result = doc.formatTOCStyles({
        run: { font: 'Verdana' },
        levels: [1, 2, 3],
      });

      expect(result.formatted).toEqual([1, 2, 3]);
      expect(doc.getStyle('TOC1')).toBeDefined();
      expect(doc.getStyle('TOC2')).toBeDefined();
      expect(doc.getStyle('TOC3')).toBeDefined();
      expect(doc.getStyle('TOC4')).toBeUndefined();
    });

    it('should update existing TOC style if already present', () => {
      // Create initial style
      doc.formatTOCStyles({ run: { font: 'Arial' }, levels: [1] });
      expect(doc.getStyle('TOC1')?.getRunFormatting()?.font).toBe('Arial');

      // Update style
      doc.formatTOCStyles({ run: { font: 'Verdana' }, levels: [1] });
      expect(doc.getStyle('TOC1')?.getRunFormatting()?.font).toBe('Verdana');
    });

    it('should mark TOC styles as modified for merging', () => {
      doc.styles().resetModified();

      doc.formatTOCStyles({
        run: { font: 'Verdana' },
        levels: [1, 2],
      });

      const modified = doc.styles().getModifiedStyleIds();
      expect(modified.has('TOC1')).toBe(true);
      expect(modified.has('TOC2')).toBe(true);
    });

    it('should preserve default indentation per level', () => {
      doc.formatTOCStyles({
        run: { font: 'Verdana' },
      });

      // Level 1: 0 indent, Level 2: 220 twips, Level 3: 440 twips
      expect(
        doc.getStyle('TOC1')?.getParagraphFormatting()?.indentation?.left
      ).toBe(0);
      expect(
        doc.getStyle('TOC2')?.getParagraphFormatting()?.indentation?.left
      ).toBe(220);
      expect(
        doc.getStyle('TOC3')?.getParagraphFormatting()?.indentation?.left
      ).toBe(440);
    });

    it('should skip invalid level numbers', () => {
      const result = doc.formatTOCStyles({
        run: { font: 'Verdana' },
        levels: [0, 1, 2, 10, 11],
      });

      // Only 1 and 2 are valid
      expect(result.formatted).toEqual([1, 2]);
      expect(doc.getStyle('TOC1')).toBeDefined();
      expect(doc.getStyle('TOC2')).toBeDefined();
    });
  });

  describe('Style.createTOCStyle()', () => {
    it('should create TOC style with correct styleId and name', () => {
      const toc1 = Style.createTOCStyle(1);
      expect(toc1.getStyleId()).toBe('TOC1');
      expect(toc1.getName()).toBe('toc 1');
    });

    it('should create TOC style based on Normal', () => {
      const toc1 = Style.createTOCStyle(1);
      expect(toc1.getProperties().basedOn).toBe('Normal');
    });

    it('should set appropriate UI properties', () => {
      const toc1 = Style.createTOCStyle(1);
      const props = toc1.getProperties();
      expect(props.uiPriority).toBe(39);
      expect(props.semiHidden).toBe(true);
      expect(props.unhideWhenUsed).toBe(true);
    });

    it('should throw for invalid level 0', () => {
      expect(() => Style.createTOCStyle(0)).toThrow(
        'TOC level must be between 1 and 9'
      );
    });

    it('should throw for invalid level 10', () => {
      expect(() => Style.createTOCStyle(10)).toThrow(
        'TOC level must be between 1 and 9'
      );
    });

    it('should accept custom formatting', () => {
      const toc2 = Style.createTOCStyle(2, {
        run: { font: 'Georgia', size: 11, color: 'FF0000' },
        paragraph: { spacing: { before: 100, after: 50 } },
      });

      expect(toc2.getRunFormatting()?.font).toBe('Georgia');
      expect(toc2.getRunFormatting()?.size).toBe(11);
      expect(toc2.getRunFormatting()?.color).toBe('FF0000');
      expect(toc2.getParagraphFormatting()?.spacing?.before).toBe(100);
      expect(toc2.getParagraphFormatting()?.spacing?.after).toBe(50);
    });

    it('should set correct indentation based on level', () => {
      // Level 1 = 0 indent, Level 2 = 220, Level 3 = 440, etc.
      for (let level = 1; level <= 9; level++) {
        const tocStyle = Style.createTOCStyle(level);
        const expectedIndent = (level - 1) * 220;
        expect(tocStyle.getParagraphFormatting()?.indentation?.left).toBe(
          expectedIndent
        );
      }
    });
  });
});
