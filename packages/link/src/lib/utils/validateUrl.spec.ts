import { createSlateEditor } from 'platejs';

import { BaseLinkPlugin } from '../BaseLinkPlugin';
import { validateUrl } from './validateUrl';

describe('validateUrl', () => {
  const createTestEditor = (options?: any) =>
    createSlateEditor({
      plugins: [BaseLinkPlugin.configure({ options })],
    });

  describe('internal links', () => {
    it('should validate paths starting with /', () => {
      const editor = createTestEditor();
      expect(validateUrl(editor, '/internal/path')).toBe(true);
    });

    it('should validate anchor links starting with #', () => {
      const editor = createTestEditor();
      expect(validateUrl(editor, '#section-name')).toBe(true);
      expect(validateUrl(editor, '#top')).toBe(true);
    });
  });

  describe('markdown headings', () => {
    it('should NOT validate markdown heading level 1', () => {
      const editor = createTestEditor();
      expect(validateUrl(editor, '# heading1')).toBe(false);
    });

    it('should NOT validate markdown heading level 2', () => {
      const editor = createTestEditor();
      expect(validateUrl(editor, '## heading2')).toBe(false);
    });

    it('should NOT validate markdown heading level 3', () => {
      const editor = createTestEditor();
      expect(validateUrl(editor, '### heading3')).toBe(false);
    });

    it('should NOT validate markdown heading level 4', () => {
      const editor = createTestEditor();
      expect(validateUrl(editor, '#### heading4')).toBe(false);
    });

    it('should NOT validate markdown heading level 5', () => {
      const editor = createTestEditor();
      expect(validateUrl(editor, '##### heading5')).toBe(false);
    });

    it('should NOT validate markdown heading level 6', () => {
      const editor = createTestEditor();
      expect(validateUrl(editor, '###### heading6')).toBe(false);
    });

    it('should NOT validate markdown headings with various content', () => {
      const editor = createTestEditor();
      expect(validateUrl(editor, '# My Title')).toBe(false);
      expect(validateUrl(editor, '## 2.3 Section')).toBe(false);
      expect(validateUrl(editor, '### Hello World!')).toBe(false);
    });
  });

  describe('external links', () => {
    it('should validate http URLs', () => {
      const editor = createTestEditor();
      expect(validateUrl(editor, 'http://example.com')).toBe(true);
    });

    it('should validate https URLs', () => {
      const editor = createTestEditor();
      expect(validateUrl(editor, 'https://example.com')).toBe(true);
    });

    it('should validate URLs with custom isUrl function', () => {
      const editor = createTestEditor({
        allowedSchemes: ['http', 'https', 'mailto', 'tel', 'custom'],
        isUrl: (url: string) => url.startsWith('custom://'),
      });
      expect(validateUrl(editor, 'custom://example')).toBe(true);
      expect(validateUrl(editor, 'http://example.com')).toBe(false);
    });

    it('should still sanitize URLs even with custom isUrl function', () => {
      const editor = createTestEditor({
        allowedSchemes: ['http', 'https', 'mailto', 'tel', 'custom'],
        isUrl: (url: string) =>
          url.startsWith('javascript:') || url.startsWith('custom://'),
      });
      // Custom isUrl accepts javascript: URLs, but sanitizeUrl should still block them
      expect(validateUrl(editor, 'javascript:alert("XSS")')).toBe(false);
      // Valid custom URLs should pass both checks (custom is in allowedSchemes)
      expect(validateUrl(editor, 'custom://example')).toBe(true);
    });

    it('should skip sanitization when dangerouslySkipSanitization is true', () => {
      const editor = createTestEditor({
        dangerouslySkipSanitization: true,
        isUrl: (url: string) => url.startsWith('javascript:'),
      });
      // With sanitization skipped, even dangerous URLs pass if custom validator accepts them
      expect(validateUrl(editor, 'javascript:alert("XSS")')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should still validate anchor links without content after #', () => {
      const editor = createTestEditor();
      expect(validateUrl(editor, '#')).toBe(true);
    });

    it('should validate anchor links that look like markdown but are not', () => {
      const editor = createTestEditor();
      // These are valid anchor links, not markdown headings (no space after #)
      expect(validateUrl(editor, '#heading1')).toBe(true);
      expect(validateUrl(editor, '##heading2')).toBe(true);
    });
  });
});
