import { isHotkey } from '@udecode/plate-common';
import { blurEditor, extendPlugin } from '@udecode/plate-common/react';

import { PlaceholderPlugin as BasePlaceholderPlugin } from '../../lib/placeholder/PlaceholderPlugin';

export const PlaceholderPlugin = extendPlugin(BasePlaceholderPlugin, {
  handlers: {
    onKeyDown: ({ editor, event }) => {
      if (isHotkey('escape')(event)) {
        blurEditor(editor);
      }
    },
  },
});
