import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export const BaseVideoPlugin = createBasePlugin({
  key: KEYS.video,
  node: {
    dangerouslyAllowAttributes: ['width', 'height'],
    isElement: true,
    isVoid: true,
  },
});
