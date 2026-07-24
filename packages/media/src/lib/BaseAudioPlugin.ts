import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import {
  defineMediaPlugin,
  mediaElementContent,
  mediaElementProperties,
} from './media/MediaPlugin.internal';

export const BaseAudioPlugin = defineMediaPlugin(
  createBasePlugin({
    key: KEYS.audio,
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
