import { Key, toPlatePlugin } from '@udecode/plate-common/react';

import { BaseUnderlinePlugin } from '../lib/BaseUnderlinePlugin';

export const UnderlinePlugin = toPlatePlugin(
  BaseUnderlinePlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleUnderline: {
        handler: () => {
          editor.tf.toggle.mark({ key: type });
        },
        keys: [[Key.Mod, 'u']],
        preventDefault: true,
      },
    },
  })
);
