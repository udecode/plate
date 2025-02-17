import { Key, toPlatePlugin } from '@udecode/plate/react';

import { BaseCommentsPlugin } from '../lib';

export const CommentsPlugin = toPlatePlugin(BaseCommentsPlugin, {
  key: 'comment',
  node: { isLeaf: true },
  shortcuts: {
    toggleComment: {
      keys: [[Key.Mod, Key.Shift, 'm']],
    },
  },
});
