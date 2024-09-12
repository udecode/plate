import { Key, toPlatePlugin } from '@udecode/plate-common/react';

import { BaseBoldPlugin } from '../lib/BaseBoldPlugin';

export const BoldPlugin = toPlatePlugin(BaseBoldPlugin, ({ editor, type }) => ({
  shortcuts: {
    toggleBold: {
      handler: () => {
        editor.tf.toggle.mark({ key: type });
      },
      keys: [[Key.Mod, 'b']],
      preventDefault: true,
    },
  },
}));
