import {
  createPluginFactory,
  HotkeyPlugin,
  onKeyDownToggleElement,
} from '@udecode/plate-common';

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
