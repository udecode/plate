import { createPluginFactory, onKeyDownToggleMark } from '@udecode/plate-core';

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
