import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { mediaElementProperties } from './media/types';

export const BaseVideoPlugin = createBasePlugin({
  key: KEYS.video,
  host: { dangerouslyAllowAttributes: ['width', 'height'] },
  schema: {
    element: {
      properties: {
        ...mediaElementProperties,
        provider: property.string(),
        sourceUrl: property.string(),
      },
      void: 'block',
    },
  },
});
