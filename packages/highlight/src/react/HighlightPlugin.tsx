import { Key, toPlatePlugin } from '@udecode/plate-common/react';

import { BaseHighlightPlugin } from '../lib/BaseHighlightPlugin';

export const HighlightPlugin = toPlatePlugin(
  BaseHighlightPlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleHighlight: {
        handler: () => {
          editor.tf.toggle.mark({ key: type });
        },
        keys: [[Key.Mod, Key.Shift, 'h']],
        preventDefault: true,
      },
    },
  })
);
