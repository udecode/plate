import { onKeyDownToggleMark, ToggleMarkPlugin } from '@udecode/plate-common';
import { createPluginFactory } from '@udecode/plate-core';
import { getHighlightDeserialize } from './getHighlightDeserialize';

export const MARK_HIGHLIGHT = 'highlight';

/**
 * Enables support for highlights, useful when reviewing
 * content or highlighting it for future reference.
 */
export const createHighlightPlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_HIGHLIGHT,
  isLeaf: true,
  deserialize: getHighlightDeserialize(),
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+shift+h',
  },
});
