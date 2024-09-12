import { Key, toPlatePlugin } from '@udecode/plate-common/react';

import { BaseSuperscriptPlugin } from '../lib/BaseSuperscriptPlugin';
import { SubscriptPlugin } from './SubscriptPlugin';

export const SuperscriptPlugin = toPlatePlugin(
  BaseSuperscriptPlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleSuperscript: {
        handler: () => {
          editor.tf.toggle.mark({
            clear: editor.getType(SubscriptPlugin),
            key: type,
          });
        },
        keys: [[Key.Mod, '.']],
        preventDefault: true,
      },
    },
  })
);
