import { blurEditor, createPlugin, isHotkey } from '@udecode/plate-common';

import type { MediaPlaceholder } from './types';

export const ELEMENT_PLACEHOLDER = 'placeholder';

export const PlaceholderPlugin = createPlugin<MediaPlaceholder>({
  handlers: {
    onKeyDown: (editor) => (event) => {
      if (isHotkey('escape')(event)) {
        blurEditor(editor);
      }
    },
  },
  isElement: true,
  isVoid: true,
  key: ELEMENT_PLACEHOLDER,
});
