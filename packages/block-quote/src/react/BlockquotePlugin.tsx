import { Key, toPlatePlugin } from '@udecode/plate-common/react';

import { BlockquotePlugin as BaseBlockquotePlugin } from '../lib/BlockquotePlugin';

export const BlockquotePlugin = toPlatePlugin(
  BaseBlockquotePlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleBlockquote: {
        handler: () => {
          editor.tf.toggle.block({ type });
        },
        keys: [[Key.Mod, Key.Shift, '.']],
        preventDefault: true,
        useKey: true,
      },
    },
  })
);
