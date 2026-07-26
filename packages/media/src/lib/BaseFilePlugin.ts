import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import {
  defineMediaPlugin,
  mediaElementContent,
  mediaElementProperties,
  type MediaPluginOptions,
} from './media/MediaPlugin.internal';

export const BaseFilePlugin = defineMediaPlugin(
  createBasePlugin({
    key: KEYS.file,
    options: {} as MediaPluginOptions,
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
