import { Key, toPlatePlugin } from '@udecode/plate/react';

import { BaseSubscriptPlugin } from '../lib/BaseSubscriptPlugin';
import { SuperscriptPlugin } from './SuperscriptPlugin';

export const SubscriptPlugin = toPlatePlugin(
  BaseSubscriptPlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleSubscript: {
        keys: [[Key.Mod, 'comma']],
        preventDefault: true,
        handler: () => {
          editor.tf.toggleMark(type, {
            remove: editor.getType(SuperscriptPlugin),
          });
        },
      },
    },
  })
);
