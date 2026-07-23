import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { mediaElementProperties } from './media/types';

export const BaseFilePlugin = createBasePlugin({
  key: KEYS.file,
  schema: {
    element: {
      properties: mediaElementProperties,
      void: 'block',
    },
  },
});
