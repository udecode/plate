import { onKeyDownToggleMark } from '@udecode/plate-common';
import { createPluginFactory } from '@udecode/plate-core';

export const MARK_KBD = 'kbd';

/**
 * Enables support for code formatting
 */
export const createKbdPlugin = createPluginFactory({
  key: MARK_KBD,
  isLeaf: true,
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  deserializeHtml: [
    { validNodeName: ['KBD'] },
    {
      validStyle: {
        wordWrap: 'break-word',
      },
    },
  ],
});
