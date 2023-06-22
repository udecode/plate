import { createPlateEditor } from '@udecode/plate-common';
import { getLinkAttributes } from './getLinkAttributes';

import { createLinkPlugin } from '@/packages/nodes/link/src/createLinkPlugin';
import { TLinkElement } from '@/packages/nodes/link/src/types';

const baseLink = {
  type: 'a',
  children: [{ text: 'Link text' }],
};

const defaultOptions: LinkPlugin = {
  defaultLinkAttributes: {
    rel: 'noopener noreferrer',
  },
};

const createEditor = (options: LinkPlugin = {}) =>
  createPlateEditor({
    plugins: [
      createLinkPlugin({
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
      url: 'https://example.com/',
      target: '_self',
    };

    it('should include href, target and default attributes', () => {
      expect(getLinkAttributes(editor, link)).toEqual({
        href: 'https://example.com/',
        target: '_self',
        rel: 'noopener noreferrer',
      });
    });
  });

  describe('when url is invalid', () => {
    const link: TLinkElement = {
      ...baseLink,
      // eslint-disable-next-line no-script-url
      url: 'javascript://example.com/',
      target: '_self',
    };

    it('href should be undefined', () => {
      expect(getLinkAttributes(editor, link)).toEqual({
        href: undefined,
        target: '_self',
        rel: 'noopener noreferrer',
      });
    });
  });

  describe('when url is invalid and skipSanitization is true', () => {
    const editorWithSkipSanitization = createEditor({
      dangerouslySkipSanitization: true,
    });

    const link: TLinkElement = {
      ...baseLink,
      url: 'pageKey',
      target: '_self',
    };

    it('href should be defined', () => {
      expect(getLinkAttributes(editorWithSkipSanitization, link)).toEqual({
        href: 'pageKey',
        target: '_self',
        rel: 'noopener noreferrer',
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
