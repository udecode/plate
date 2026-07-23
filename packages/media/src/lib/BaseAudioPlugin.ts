import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { mediaElementProperties } from './media/types';

export const BaseAudioPlugin = createBasePlugin({
  key: KEYS.audio,
  schema: {
    element: {
      properties: mediaElementProperties,
      void: 'block',
    },
  },
});
