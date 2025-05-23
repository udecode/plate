import { KEYS } from '@udecode/plate';
import { Key, toPlatePlugin } from '@udecode/plate/react';

import { BaseSubscriptPlugin } from '../lib/BaseSubscriptPlugin';

export const SubscriptPlugin = toPlatePlugin(
  BaseSubscriptPlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleSubscript: {
        keys: [[Key.Mod, 'comma']],
        preventDefault: true,
        handler: () => {
          editor.tf.toggleMark(type, {
            remove: editor.getType(KEYS.sup),
          });
        },
      },
    },
  })
);
