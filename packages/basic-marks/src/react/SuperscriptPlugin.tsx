import { KEYS } from '@udecode/plate';
import { Key, toPlatePlugin } from '@udecode/plate/react';

import { BaseSuperscriptPlugin } from '../lib/BaseSuperscriptPlugin';

export const SuperscriptPlugin = toPlatePlugin(
  BaseSuperscriptPlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleSuperscript: {
        keys: [[Key.Mod, 'period']],
        preventDefault: true,
        handler: () => {
          editor.tf.toggleMark(type, {
            remove: editor.getType(KEYS.sub),
          });
        },
      },
    },
  })
);
