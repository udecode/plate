import { createPlateEditor } from '@udecode/plate-common/react';

import type { TLinkElement } from '../types';

import { type LinkConfig, LinkPlugin } from '../LinkPlugin';
import { getLinkAttributes } from './getLinkAttributes';

const baseLink = {
  children: [{ text: 'Link text' }],
  type: 'a',
};

const defaultOptions: LinkConfig['options'] = {
  defaultLinkAttributes: {
    rel: 'noopener noreferrer',
  },
};

const createEditor = (options: LinkConfig['options'] = {}) =>
  createPlateEditor({
    plugins: [
      LinkPlugin.configure({
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

    it('should include href, target and default attributes', () => {
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
      // eslint-disable-next-line no-script-url
      url: 'javascript://example.com/',
    };

    it('href should be undefined', () => {
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

    it('href should be defined', () => {
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

    it('target should not be included', () => {
      const linkAttributes = getLinkAttributes(editor, link);
      expect(linkAttributes).toEqual({
        href: 'https://example.com/',
        rel: 'noopener noreferrer',
      });
      expect(linkAttributes).not.toHaveProperty('target');
    });
  });
});
