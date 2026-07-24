import { createBaseEditor } from '@platejs/core';
import { NodeApi } from '@platejs/plite';

import { BaseLinkPlugin } from './BaseLinkPlugin';
import type { BaseLinkConfig } from './BaseLinkPlugin';

describe('validateUrl', () => {
  const createTestEditor = (options: Partial<BaseLinkConfig['options']> = {}) =>
    createBaseEditor({
      plugins: [
        BaseLinkPlugin.configure({
          options,
        }),
      ],
    });

  describe('internal links', () => {
    it('validate paths starting with /', () => {
      const editor = createTestEditor();
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('/internal/path')
      ).toBe(true);
    });

    it('lets a custom isUrl reject paths starting with /', () => {
      const editor = createTestEditor({
        isUrl: (url: string) => !url.startsWith('/'),
      });

      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('/internal/path')
      ).toBe(false);
    });

    it('does not validate protocol-relative URLs starting with //', () => {
      const editor = createTestEditor();
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('//example.com')
      ).toBe(false);
    });

    it('validate anchor links starting with #', () => {
      const editor = createTestEditor();
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('#section-name')
      ).toBe(true);
      expect(editor.plugin(BaseLinkPlugin).api.validateUrl('#top')).toBe(true);
    });

    it('lets a custom isUrl reject anchor links', () => {
      const editor = createTestEditor({
        isUrl: (url: string) => !url.startsWith('#'),
      });

      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('#section-name')
      ).toBe(false);
    });
  });

  describe('markdown headings', () => {
    it('does not validate markdown heading level 1', () => {
      const editor = createTestEditor();
      expect(editor.plugin(BaseLinkPlugin).api.validateUrl('# heading1')).toBe(
        false
      );
    });

    it('does not validate markdown heading level 2', () => {
      const editor = createTestEditor();
      expect(editor.plugin(BaseLinkPlugin).api.validateUrl('## heading2')).toBe(
        false
      );
    });

    it('does not validate markdown heading level 3', () => {
      const editor = createTestEditor();
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('### heading3')
      ).toBe(false);
    });

    it('does not validate markdown heading level 4', () => {
      const editor = createTestEditor();
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('#### heading4')
      ).toBe(false);
    });

    it('does not validate markdown heading level 5', () => {
      const editor = createTestEditor();
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('##### heading5')
      ).toBe(false);
    });

    it('does not validate markdown heading level 6', () => {
      const editor = createTestEditor();
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('###### heading6')
      ).toBe(false);
    });

    it('does not validate markdown headings with various content', () => {
      const editor = createTestEditor();
      expect(editor.plugin(BaseLinkPlugin).api.validateUrl('# My Title')).toBe(
        false
      );
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('## 2.3 Section')
      ).toBe(false);
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('### Hello World!')
      ).toBe(false);
    });
  });

  describe('external links', () => {
    it('validate http URLs', () => {
      const editor = createTestEditor();
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('http://example.com')
      ).toBe(true);
    });

    it('validate https URLs', () => {
      const editor = createTestEditor();
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('https://example.com')
      ).toBe(true);
    });

    it('validate URLs with custom isUrl function', () => {
      const editor = createTestEditor({
        allowedSchemes: ['http', 'https', 'mailto', 'tel', 'custom'],
        isUrl: (url: string) => url.startsWith('custom://'),
      });
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('custom://example')
      ).toBe(true);
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('http://example.com')
      ).toBe(false);
    });

    it('still sanitize URLs even with custom isUrl function', () => {
      const editor = createTestEditor({
        allowedSchemes: ['http', 'https', 'mailto', 'tel', 'custom'],
        isUrl: (url: string) =>
          url.startsWith('javascript:') || url.startsWith('custom://'),
      });
      // Custom isUrl accepts javascript: URLs, but sanitizeUrl should still block them
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('javascript:alert("XSS")')
      ).toBe(false);
      // Valid custom URLs should pass both checks (custom is in allowedSchemes)
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('custom://example')
      ).toBe(true);
    });

    it('skip sanitization when dangerouslySkipSanitization is true', () => {
      const editor = createTestEditor({
        dangerouslySkipSanitization: true,
        isUrl: (url: string) => url.startsWith('javascript:'),
      });
      // With sanitization skipped, even dangerous URLs pass if custom validator accepts them
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('javascript:alert("XSS")')
      ).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('still validate anchor links without content after #', () => {
      const editor = createTestEditor();
      expect(editor.plugin(BaseLinkPlugin).api.validateUrl('#')).toBe(true);
    });

    it('validate anchor links that look like markdown but are not', () => {
      const editor = createTestEditor();
      // These are valid anchor links, not markdown headings (no space after #)
      expect(editor.plugin(BaseLinkPlugin).api.validateUrl('#heading1')).toBe(
        true
      );
      expect(editor.plugin(BaseLinkPlugin).api.validateUrl('##heading2')).toBe(
        true
      );
    });
  });

  it('uses configured URL options during HTML parsing', () => {
    const editor = createTestEditor({
      allowedSchemes: ['mailto'],
      isUrl: () => true,
    });
    const fragment = editor.api.html.deserialize({
      element: '<a href="https://example.com">Link</a>',
    });

    expect(
      Array.from(
        NodeApi.elements({ children: fragment ?? [], type: 'root' }),
        ([node]) => node
      ).some((node) => node.type === editor.getType(BaseLinkPlugin.key))
    ).toBe(false);
  });
});
