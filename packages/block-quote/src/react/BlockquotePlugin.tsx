import { Key, toPlatePlugin } from '@udecode/plate-common/react';

import { BaseBlockquotePlugin } from '../lib/BaseBlockquotePlugin';

export const BlockquotePlugin = toPlatePlugin(
  BaseBlockquotePlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleBlockquote: {
        handler: () => {
          editor.tf.toggle.block({ type });
        },
        keys: [[Key.Mod, Key.Shift, 'period']],
        preventDefault: true,
      },
    },
  })
);
