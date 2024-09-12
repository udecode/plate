import { Key, toPlatePlugin } from '@udecode/plate-common/react';

import { BaseItalicPlugin } from '../lib/BaseItalicPlugin';

export const ItalicPlugin = toPlatePlugin(
  BaseItalicPlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleItalic: {
        handler: () => {
          editor.tf.toggle.mark({ key: type });
        },
        keys: [[Key.Mod, 'i']],
        preventDefault: true,
      },
    },
  })
);
