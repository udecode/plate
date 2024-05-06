import {
  type HotkeyPlugin,
  createPluginFactory,
  onKeyDownToggleElement,
} from '@udecode/plate-common/server';

export const ELEMENT_PARAGRAPH = 'p';

/** Enables support for paragraphs. */
export const createParagraphPlugin = createPluginFactory<HotkeyPlugin>({
  deserializeHtml: {
    query: (el) => el.style.fontFamily !== 'Consolas',
    rules: [
      {
        validNodeName: 'P',
      },
    ],
  },
  handlers: {
    onKeyDown: onKeyDownToggleElement,
  },
  isElement: true,
  key: ELEMENT_PARAGRAPH,
  options: {
    hotkey: ['mod+opt+0', 'mod+shift+0'],
  },
});
