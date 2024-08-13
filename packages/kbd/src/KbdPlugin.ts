import { createPlugin } from '@udecode/plate-common';
import { onKeyDownToggleMark } from '@udecode/plate-common/react';

/** Enables support for code formatting */
export const KbdPlugin = createPlugin({
  deserializeHtml: {
    rules: [{ validNodeName: ['KBD'] }],
  },
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  isLeaf: true,
  key: 'kbd',
});
