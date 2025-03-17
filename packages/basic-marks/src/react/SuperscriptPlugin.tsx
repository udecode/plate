import { Key, toPlatePlugin } from '@udecode/plate/react';

import { BaseSuperscriptPlugin } from '../lib/BaseSuperscriptPlugin';
import { SubscriptPlugin } from './SubscriptPlugin';

export const SuperscriptPlugin = toPlatePlugin(
  BaseSuperscriptPlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleSuperscript: {
        keys: [[Key.Mod, 'period']],
        preventDefault: true,
        handler: () => {
          editor.tf.toggleMark(type, {
            remove: editor.getType(SubscriptPlugin),
          });
        },
      },
    },
  })
);
