import {
  blurEditor,
  createPluginFactory,
  isHotkey,
} from '@udecode/plate-common';

import type { MediaPlaceholder } from './types';

export const ELEMENT_PLACEHOLDER = 'placeholder';

export const createPlaceholderPlugin = createPluginFactory<MediaPlaceholder>({
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
