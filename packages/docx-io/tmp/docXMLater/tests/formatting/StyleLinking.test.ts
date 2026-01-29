/**
 * Tests for Normal and NormalWeb Style Linking
 *
 * Validates that changes to Normal style are automatically
 * applied to NormalWeb (Normal (Web)) style when it exists.
 */

import { Document, Style } from '../../src';

describe('Normal and NormalWeb Style Linking', () => {
  let doc: Document;

  beforeEach(() => {
    doc = Document.create();
  });

  afterEach(() => {
    doc.dispose();
  });

  describe('linkNormalWebToNormal option (default: true)', () => {
    it('should apply Normal changes to NormalWeb by default', () => {
      // Add NormalWeb style with different formatting
      const normalWeb = Style.create({
        styleId: 'NormalWeb',
        name: 'Normal (Web)',
        type: 'paragraph',
        basedOn: 'Normal',
        runFormatting: { font: 'Times New Roman', size: 10 },
        paragraphFormatting: { alignment: 'left' },
      });
      doc.addStyle(normalWeb);

      // Apply styles with default options (linkNormalWebToNormal defaults to true)
      doc.applyStyles({
        normal: {
          run: { font: 'Arial', size: 12 },
          paragraph: { alignment: 'left' },
        },
      });

      // Verify NormalWeb was updated with Normal's formatting
      const updated = doc.getStyle('NormalWeb');
      expect(updated).toBeDefined();
      expect(updated?.getRunFormatting()?.font).toBe('Arial');
      expect(updated?.getRunFormatting()?.size).toBe(12);
    });

    it('should apply paragraph formatting to NormalWeb', () => {
      const normalWeb = Style.create({
        styleId: 'NormalWeb',
        name: 'Normal (Web)',
        type: 'paragraph',
        paragraphFormatting: { alignment: 'left', spacing: { before: 0 } },
      });
      doc.addStyle(normalWeb);

      doc.applyStyles({
        normal: {
          run: { font: 'Verdana' },
          paragraph: { alignment: 'justify', spacing: { before: 100, after: 100 } },
        },
      });

      const updated = doc.getStyle('NormalWeb');
      expect(updated?.getParagraphFormatting()?.alignment).toBe('justify');
      expect(updated?.getParagraphFormatting()?.spacing?.before).toBe(100);
    });
  });

  describe('linkNormalWebToNormal: false', () => {
    it('should NOT apply Normal changes to NormalWeb when disabled', () => {
      // Add NormalWeb style with specific formatting
      const normalWeb = Style.create({
        styleId: 'NormalWeb',
        name: 'Normal (Web)',
        type: 'paragraph',
        runFormatting: { font: 'Times New Roman', size: 10 },
        paragraphFormatting: { alignment: 'left' },
      });
      doc.addStyle(normalWeb);

      // Apply styles with linking DISABLED
      doc.applyStyles({
        normal: {
          run: { font: 'Arial', size: 12 },
          paragraph: { alignment: 'center' },
        },
        linkNormalWebToNormal: false,
      });

      // Verify NormalWeb was NOT updated
      const notUpdated = doc.getStyle('NormalWeb');
      expect(notUpdated?.getRunFormatting()?.font).toBe('Times New Roman');
      expect(notUpdated?.getRunFormatting()?.size).toBe(10);
      expect(notUpdated?.getParagraphFormatting()?.alignment).toBe('left');
    });
  });

  describe('NormalWeb does not exist', () => {
    it('should not throw when NormalWeb does not exist', () => {
      // Apply styles without adding NormalWeb - should not throw
      expect(() => {
        doc.applyStyles({
          normal: { run: { font: 'Arial', size: 12 } },
        });
      }).not.toThrow();
    });

    it('should still apply Normal changes when NormalWeb does not exist', () => {
      const results = doc.applyStyles({
        normal: {
          run: { font: 'Arial', size: 12 },
          paragraph: { alignment: 'center' },
        },
      });

      expect(results.normal).toBe(true);

      // Verify Normal was updated
      const normal = doc.getStyle('Normal');
      expect(normal?.getRunFormatting()?.font).toBe('Arial');
    });
  });

  describe('Modified style tracking', () => {
    it('should mark NormalWeb as modified for merging', () => {
      const normalWeb = Style.create({
        styleId: 'NormalWeb',
        name: 'Normal (Web)',
        type: 'paragraph',
      });
      doc.addStyle(normalWeb);

      // Reset modified tracking
      doc.styles().resetModified();

      // Apply styles
      doc.applyStyles({
        normal: { run: { font: 'Arial' } },
      });

      // Verify NormalWeb is in modified set
      const modified = doc.styles().getModifiedStyleIds();
      expect(modified.has('NormalWeb')).toBe(true);
    });

    it('should NOT mark NormalWeb as modified when linking disabled', () => {
      const normalWeb = Style.create({
        styleId: 'NormalWeb',
        name: 'Normal (Web)',
        type: 'paragraph',
      });
      doc.addStyle(normalWeb);

      // Reset modified tracking
      doc.styles().resetModified();

      // Apply styles with linking disabled
      doc.applyStyles({
        normal: { run: { font: 'Arial' } },
        linkNormalWebToNormal: false,
      });

      // Verify NormalWeb is NOT in modified set
      const modified = doc.styles().getModifiedStyleIds();
      expect(modified.has('NormalWeb')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle NormalWeb with basedOn Normal', () => {
      // Real-world scenario: NormalWeb often has basedOn="Normal"
      const normalWeb = Style.create({
        styleId: 'NormalWeb',
        name: 'Normal (Web)',
        type: 'paragraph',
        basedOn: 'Normal',
        // Only override specific properties
        runFormatting: { size: 10 },
      });
      doc.addStyle(normalWeb);

      doc.applyStyles({
        normal: {
          run: { font: 'Georgia', size: 11 },
          paragraph: { alignment: 'justify' },
        },
      });

      const updated = doc.getStyle('NormalWeb');
      // Should have the new font and size from Normal linking
      expect(updated?.getRunFormatting()?.font).toBe('Georgia');
      expect(updated?.getRunFormatting()?.size).toBe(11);
    });

    it('should work with explicit linkNormalWebToNormal: true', () => {
      const normalWeb = Style.create({
        styleId: 'NormalWeb',
        name: 'Normal (Web)',
        type: 'paragraph',
        runFormatting: { font: 'Courier' },
      });
      doc.addStyle(normalWeb);

      // Explicitly set to true (same as default)
      doc.applyStyles({
        normal: { run: { font: 'Tahoma' } },
        linkNormalWebToNormal: true,
      });

      const updated = doc.getStyle('NormalWeb');
      expect(updated?.getRunFormatting()?.font).toBe('Tahoma');
    });
  });
});
