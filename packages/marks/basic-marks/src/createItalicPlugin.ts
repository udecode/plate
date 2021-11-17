import { onKeyDownToggleMark, ToggleMarkPlugin } from '@udecode/plate-common';
import { createPluginFactory } from '@udecode/plate-core';
import { deserializeHtmlItalic } from './deserializeHtmlItalic';

export const MARK_ITALIC = 'italic';

/**
 * Enables support for italic formatting.
 */
export const createItalicPlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_ITALIC,
  isLeaf: true,
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+i',
  },
  deserializeHtml: deserializeHtmlItalic,
});
