import type { TLinkElement } from 'platejs';

import { createSlateEditor } from 'platejs';

import { BaseLinkPlugin, getLinkAttributes } from '../../lib';
import type { LinkConfig } from '../LinkPlugin';

const baseLink = {
  children: [{ text: 'Link text' }],
  type: 'a',
};

const defaultOptions: Partial<LinkConfig['options']> = {
  defaultLinkAttributes: {
    rel: 'noopener noreferrer',
  },
};

const createEditor = (options: Partial<LinkConfig['options']> = {}) =>
  createSlateEditor({
    plugins: [
      BaseLinkPlugin.configure({
        options: {
          ...defaultOptions,
          ...options,
        },
      }),
    ],
  });

describe('getLinkAttributes', () => {
  const editor = createEditor();

  describe('when url is valid', () => {
    const link: TLinkElement = {
      ...baseLink,
      target: '_self',
      url: 'https://example.com/',
    };

    it('include href, target and default attributes', () => {
      expect(getLinkAttributes(editor, link)).toEqual({
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
      expect(getLinkAttributes(editor, link)).toEqual({
        href: undefined,
        rel: 'noopener noreferrer',
        target: '_self',
      });
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
      expect(getLinkAttributes(editorWithSkipSanitization, link)).toEqual({
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
      const linkAttributes = getLinkAttributes(editor, link);
      expect(linkAttributes).toEqual({
        href: 'https://example.com/',
        rel: 'noopener noreferrer',
      });
      expect(linkAttributes).not.toHaveProperty('target');
    });
  });
});
