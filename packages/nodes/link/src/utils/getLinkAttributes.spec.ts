import { createPlateEditor } from '@udecode/plate-common';
import { getLinkAttributes } from './getLinkAttributes';

import { createLinkPlugin } from '@/packages/nodes/link/src/createLinkPlugin';
import { TLinkElement } from '@/packages/nodes/link/src/types';

const baseLink = {
  type: 'a',
  children: [{ text: 'Link text' }],
};

describe('getLinkAttributes', () => {
  const editor = createPlateEditor({
    plugins: [
      createLinkPlugin({
        options: {
          defaultLinkAttributes: {
            rel: 'noopener noreferrer',
          },
        },
      }),
    ],
  });

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
