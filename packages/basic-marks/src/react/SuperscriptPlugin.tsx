import { Key, toPlatePlugin } from '@udecode/plate-common/react';

import { BaseSuperscriptPlugin } from '../lib/BaseSuperscriptPlugin';
import { SubscriptPlugin } from './SubscriptPlugin';

export const SuperscriptPlugin = toPlatePlugin(
  BaseSuperscriptPlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleSuperscript: {
        keys: [[Key.Mod, '.']],
        preventDefault: true,
        handler: () => {
          editor.tf.toggle.mark({
            key: type,
            clear: editor.getType(SubscriptPlugin),
          });
        },
      },
    },
  })
);
