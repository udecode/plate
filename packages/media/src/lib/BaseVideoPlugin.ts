import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import {
  defineMediaPlugin,
  mediaElementContent,
  mediaElementProperties,
  type MediaPluginState,
} from './media/MediaPlugin.internal';

export const BaseVideoPlugin = defineMediaPlugin(
  createBasePlugin({
    key: KEYS.video,
    initialState: {} as MediaPluginState,
    schema: {
      element: {
        content: mediaElementContent,
        isolating: true,
        keyboardSelectable: true,
        properties: {
          ...mediaElementProperties,
          provider: property.string(),
          sourceUrl: property.string(),
        },
      },
    },
  })
);
