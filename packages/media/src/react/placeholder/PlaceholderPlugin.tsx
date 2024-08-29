import { isHotkey } from '@udecode/plate-common';
import { blurEditor, toPlatePlugin } from '@udecode/plate-common/react';

import { PlaceholderPlugin as BasePlaceholderPlugin } from '../../lib/placeholder/PlaceholderPlugin';

export const PlaceholderPlugin = toPlatePlugin(BasePlaceholderPlugin, {
  handlers: {
    onKeyDown: ({ editor, event }) => {
      if (isHotkey('escape')(event)) {
        blurEditor(editor);
      }
    },
  },
});
