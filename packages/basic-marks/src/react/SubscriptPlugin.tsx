import { Key, toPlatePlugin } from '@udecode/plate-common/react';

import { BaseSubscriptPlugin } from '../lib/BaseSubscriptPlugin';
import { SuperscriptPlugin } from './SuperscriptPlugin';

export const SubscriptPlugin = toPlatePlugin(
  BaseSubscriptPlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleSubscript: {
        keys: [[Key.Mod, ',']],
        preventDefault: true,
        handler: () => {
          editor.tf.toggle.mark({
            key: type,
            clear: editor.getType(SuperscriptPlugin),
          });
        },
      },
    },
  })
);
