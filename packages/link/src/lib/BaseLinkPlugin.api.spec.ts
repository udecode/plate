import { createBaseEditor } from '@platejs/core';
import { NodeApi } from '@platejs/plite';
import type { TLinkElement } from '@platejs/utils';

import { BaseLinkPlugin, type BaseLinkConfig } from './BaseLinkPlugin';
import type { LinkConfig } from '../react/LinkPlugin';

const baseLink = {
  children: [{ text: 'Link text' }],
  type: 'a',
};

const defaultOptions: Partial<LinkConfig['initialState']> = {
  defaultLinkAttributes: {
    rel: 'noopener noreferrer',
  },
};

const createEditor = (options: Partial<LinkConfig['initialState']> = {}) =>
  createBaseEditor({
    plugins: [
      BaseLinkPlugin.configure({
        initialState: {
          ...defaultOptions,
          ...options,
        },
      }),
    ],
  });

describe('BaseLinkPlugin.api.getAttributes', () => {
  const editor = createEditor();

  describe('when url is valid', () => {
    const link: TLinkElement = {
      ...baseLink,
      target: '_self',
      url: 'https://example.com/',
    };

    it('include href, target and default attributes', () => {
      expect(editor.plugin(BaseLinkPlugin).api.getAttributes(link)).toEqual({
        href: 'https://example.com/',
        rel: 'noopener noreferrer',
        target: '_self',
      });
    });
  });

  describe('when url is invalid', () => {
    const link: TLinkElement = {
      ...baseLink,
      target: '_self',

      url: 'javascript://example.com/',
    };

    it('omits href for invalid URLs', () => {
      const attributes = editor.plugin(BaseLinkPlugin).api.getAttributes(link);

      expect(attributes).toEqual({
        rel: 'noopener noreferrer',
        target: '_self',
      });
      expect(attributes).not.toHaveProperty('href');
    });
  });

  describe('when url is invalid and skipSanitization is true', () => {
    const editorWithSkipSanitization = createEditor({
      dangerouslySkipSanitization: true,
    });

    const link: TLinkElement = {
      ...baseLink,
      target: '_self',
      url: 'pageKey',
    };

    it('keeps href when sanitization is skipped', () => {
      expect(
        editorWithSkipSanitization
          .plugin(BaseLinkPlugin)
          .api.getAttributes(link)
      ).toEqual({
        href: 'pageKey',
        rel: 'noopener noreferrer',
        target: '_self',
      });
    });
  });

  describe('when target is not set', () => {
    const link: TLinkElement = {
      ...baseLink,
      url: 'https://example.com/',
    };

    it('omits target when it is not set', () => {
      const linkAttributes = editor
        .plugin(BaseLinkPlugin)
        .api.getAttributes(link);
      expect(linkAttributes).toEqual({
        href: 'https://example.com/',
        rel: 'noopener noreferrer',
      });
      expect(linkAttributes).not.toHaveProperty('target');
    });
  });
});

describe('BaseLinkPlugin.api.validateUrl', () => {
  const createTestEditor = (
    options: Partial<BaseLinkConfig['initialState']> = {}
  ) =>
    createBaseEditor({
      plugins: [
        BaseLinkPlugin.configure({
          initialState: options,
        }),
      ],
    });

  describe('internal links', () => {
    it('validates paths starting with /', () => {
      const editor = createTestEditor();
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('/internal/path')
      ).toBe(true);
    });

    it('lets a custom isUrl reject paths starting with /', () => {
      const editor = createTestEditor({
        isUrl: (url) => !url.startsWith('/'),
      });

      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('/internal/path')
      ).toBe(false);
    });

    it('rejects protocol-relative URLs starting with //', () => {
      const editor = createTestEditor();
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('//example.com')
      ).toBe(false);
    });

    it('validates anchor links starting with #', () => {
      const editor = createTestEditor();
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('#section-name')
      ).toBe(true);
      expect(editor.plugin(BaseLinkPlugin).api.validateUrl('#top')).toBe(true);
    });

    it('lets a custom isUrl reject anchor links', () => {
      const editor = createTestEditor({
        isUrl: (url) => !url.startsWith('#'),
      });

      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('#section-name')
      ).toBe(false);
    });
  });

  describe('markdown headings', () => {
    it.each([
      '# heading1',
      '## heading2',
      '### heading3',
      '#### heading4',
      '##### heading5',
      '###### heading6',
      '# My Title',
      '## 2.3 Section',
      '### Hello World!',
    ])('rejects %s', (value) => {
      const editor = createTestEditor();

      expect(editor.plugin(BaseLinkPlugin).api.validateUrl(value)).toBe(false);
    });
  });

  describe('external links', () => {
    it.each([
      'http://example.com',
      'https://example.com',
    ])('validates %s', (url) => {
      const editor = createTestEditor();

      expect(editor.plugin(BaseLinkPlugin).api.validateUrl(url)).toBe(true);
    });

    it('uses a custom isUrl function', () => {
      const editor = createTestEditor({
        allowedSchemes: ['http', 'https', 'mailto', 'tel', 'custom'],
        isUrl: (url) => url.startsWith('custom://'),
      });

      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('custom://example')
      ).toBe(true);
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('http://example.com')
      ).toBe(false);
    });

    it('still sanitizes URLs accepted by custom isUrl', () => {
      const editor = createTestEditor({
        allowedSchemes: ['http', 'https', 'mailto', 'tel', 'custom'],
        isUrl: (url) =>
          url.startsWith('javascript:') || url.startsWith('custom://'),
      });

      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('javascript:alert("XSS")')
      ).toBe(false);
      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('custom://example')
      ).toBe(true);
    });

    it('can explicitly skip sanitization', () => {
      const editor = createTestEditor({
        dangerouslySkipSanitization: true,
        isUrl: (url) => url.startsWith('javascript:'),
      });

      expect(
        editor.plugin(BaseLinkPlugin).api.validateUrl('javascript:alert("XSS")')
      ).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('validates an empty anchor', () => {
      const editor = createTestEditor();

      expect(editor.plugin(BaseLinkPlugin).api.validateUrl('#')).toBe(true);
    });

    it.each([
      '#heading1',
      '##heading2',
    ])('validates anchor-like value %s', (value) => {
      const editor = createTestEditor();

      expect(editor.plugin(BaseLinkPlugin).api.validateUrl(value)).toBe(true);
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
