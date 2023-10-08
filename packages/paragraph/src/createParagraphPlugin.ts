import {
  createPluginFactory,
  HotkeyPlugin,
  onKeyDownToggleElement,
} from '@udecode/plate-common';
import { withParagraph } from './withParagraph';

export const ELEMENT_PARAGRAPH = 'p';

/**
 * Enables support for paragraphs.
 */
export const createParagraphPlugin = createPluginFactory<HotkeyPlugin>({
  key: ELEMENT_PARAGRAPH,
  isElement: true,
  handlers: {
    onKeyDown: onKeyDownToggleElement,
  },
  withOverrides: withParagraph,
  options: {
    hotkey: ['mod+opt+0', 'mod+shift+0'],
  },
  deserializeHtml: {
    rules: [
      {
        validNodeName: 'P',
      },
    ],
    query: (el) => el.style.fontFamily !== 'Consolas',
  },
});
