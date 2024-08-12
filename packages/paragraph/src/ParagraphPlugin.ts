import { type HotkeyPluginOptions, createPlugin } from '@udecode/plate-common';
import { onKeyDownToggleElement } from '@udecode/plate-common/react';

export const ELEMENT_PARAGRAPH = 'p';

/** Enables support for paragraphs. */
export const ParagraphPlugin = createPlugin<'p', HotkeyPluginOptions>({
  deserializeHtml: {
    query: ({ element }) => element.style.fontFamily !== 'Consolas',
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
