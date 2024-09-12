import { Key, toPlatePlugin } from '@udecode/plate-common/react';

import { BaseCodePlugin } from '../lib/BaseCodePlugin';

export const CodePlugin = toPlatePlugin(BaseCodePlugin, ({ editor, type }) => ({
  shortcuts: {
    toggleCode: {
      handler: () => {
        editor.tf.toggle.mark({ key: type });
      },
      keys: [[Key.Mod, 'e']],
      preventDefault: true,
    },
  },
}));
