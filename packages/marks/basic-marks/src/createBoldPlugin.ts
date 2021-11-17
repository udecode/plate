import { onKeyDownToggleMark, ToggleMarkPlugin } from '@udecode/plate-common';
import { createPluginFactory } from '@udecode/plate-core';

export const MARK_BOLD = 'bold';

/**
 * Enables support for bold formatting
 */
export const createBoldPlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_BOLD,
  isLeaf: true,
  deserializeHtml: [
    { validNodeName: ['STRONG'] },
    {
      validStyle: {
        fontWeight: ['600', '700', 'bold'],
      },
    },
  ],
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+b',
  },
});
