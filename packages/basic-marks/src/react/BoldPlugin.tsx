import { Key, toPlatePlugin } from '@udecode/plate/react';

import { BaseBoldPlugin } from '../lib/BaseBoldPlugin';

export const BoldPlugin = toPlatePlugin(BaseBoldPlugin, ({ editor, type }) => ({
  shortcuts: {
    toggleBold: {
      keys: [[Key.Mod, 'b']],
      preventDefault: true,
      handler: () => {
        editor.tf.toggleMark(type);
      },
    },
  },
}));
