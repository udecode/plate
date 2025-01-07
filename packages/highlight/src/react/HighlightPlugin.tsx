import { Key, toPlatePlugin } from '@udecode/plate/react';

import { BaseHighlightPlugin } from '../lib/BaseHighlightPlugin';

export const HighlightPlugin = toPlatePlugin(
  BaseHighlightPlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleHighlight: {
        keys: [[Key.Mod, Key.Shift, 'h']],
        preventDefault: true,
        handler: () => {
          editor.tf.toggleMark(type);
        },
      },
    },
  })
);
