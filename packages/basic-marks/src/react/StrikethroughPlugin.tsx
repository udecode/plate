import { Key, toPlatePlugin } from '@udecode/plate-common/react';

import { BaseStrikethroughPlugin } from '../lib/BaseStrikethroughPlugin';

export const StrikethroughPlugin = toPlatePlugin(
  BaseStrikethroughPlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleStrikethrough: {
        keys: [[Key.Mod, Key.Shift, 'x']],
        preventDefault: true,
        handler: () => {
          editor.tf.toggle.mark({ key: type });
        },
      },
    },
  })
);
