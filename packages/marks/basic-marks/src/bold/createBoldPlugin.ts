import { onKeyDownToggleMark, ToggleMarkPlugin } from '@udecode/plate-common';
import { createPluginFactory } from '@udecode/plate-core';
import { getBoldDeserialize } from './getBoldDeserialize';

export const MARK_BOLD = 'bold';

/**
 * Enables support for bold formatting
 */
export const createBoldPlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_BOLD,
  isLeaf: true,
  deserialize: getBoldDeserialize(),
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+b',
  },
});
