import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import {
  defineMediaPlugin,
  mediaElementContent,
  mediaElementProperties,
  type MediaPluginState,
} from './media/MediaPlugin.internal';

export const BaseFilePlugin = defineMediaPlugin(
  createBasePlugin({
    key: KEYS.file,
    initialState: {} as MediaPluginState,
    schema: {
      element: {
        content: mediaElementContent,
        isolating: true,
        keyboardSelectable: true,
        properties: mediaElementProperties,
      },
    },
  })
);
