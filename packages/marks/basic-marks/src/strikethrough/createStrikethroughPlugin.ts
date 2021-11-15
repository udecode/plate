import { onKeyDownToggleMark, ToggleMarkPlugin } from '@udecode/plate-common';
import { createPluginFactory } from '@udecode/plate-core';
import { getStrikethroughDeserialize } from './getStrikethroughDeserialize';

export const MARK_STRIKETHROUGH = 'strikethrough';

/**
 * Enables support for strikethrough formatting.
 */
export const createStrikethroughPlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_STRIKETHROUGH,
  isLeaf: true,
  deserialize: getStrikethroughDeserialize(),
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+shift+s',
  },
});
