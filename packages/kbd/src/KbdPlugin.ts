import { createSlatePlugin } from '@udecode/plate-common';
import { onKeyDownToggleMark } from '@udecode/plate-common/react';

/** Enables support for code formatting */
export const KbdPlugin = createSlatePlugin({
  deserializeHtml: {
    rules: [{ validNodeName: ['KBD'] }],
  },
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  isLeaf: true,
  key: 'kbd',
});
