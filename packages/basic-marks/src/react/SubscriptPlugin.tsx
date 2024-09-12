import { Key, toPlatePlugin } from '@udecode/plate-common/react';

import { BaseSubscriptPlugin } from '../lib/BaseSubscriptPlugin';
import { SuperscriptPlugin } from './SuperscriptPlugin';

export const SubscriptPlugin = toPlatePlugin(
  BaseSubscriptPlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleSubscript: {
        handler: () => {
          editor.tf.toggle.mark({
            clear: editor.getType(SuperscriptPlugin),
            key: type,
          });
        },
        keys: [[Key.Mod, ',']],
        preventDefault: true,
      },
    },
  })
);
