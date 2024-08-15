import {
  type PluginConfig,
  createTPlugin,
  isHotkey,
} from '@udecode/plate-common';
import { blurEditor } from '@udecode/plate-common/react';

import type { MediaPlaceholder } from './types';

export type PlaceholderConfig = PluginConfig<'placeholder', MediaPlaceholder>;

export const PlaceholderPlugin = createTPlugin<PlaceholderConfig>({
  handlers: {
    onKeyDown: ({ editor, event }) => {
      if (isHotkey('escape')(event)) {
        blurEditor(editor);
      }
    },
  },
  isElement: true,
  isVoid: true,
  key: 'placeholder',
});
