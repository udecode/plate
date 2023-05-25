import { createPlateEditor } from '@udecode/plate-common';
import { createLinkPlugin } from '../createLinkPlugin';
import { TLinkElement } from '../types';
import { getLinkAttributes } from './getLinkAttributes';

const baseLink = {
  type: 'a',
  children: [{ text: 'Link text' }],
};

describe('getLinkAttributes', () => {
  const editor = createPlateEditor({
    plugins: [createLinkPlugin()],
  });

  describe('when url is valid', () => {
    const link: TLinkElement = {
      ...baseLink,
      url: 'https://example.com/',
      target: '_self',
    };

    it('should return href and target', () => {
      expect(getLinkAttributes(editor, link)).toEqual({
        href: 'https://example.com/',
        target: '_self',
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
      });
      expect(linkAttributes).not.toHaveProperty('target');
    });
  });
});
