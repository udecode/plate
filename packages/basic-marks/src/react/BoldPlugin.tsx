import { Key, toPlatePlugin } from '@udecode/plate-common/react';

import { BoldPlugin as BaseBoldPlugin } from '../lib/BoldPlugin';

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
