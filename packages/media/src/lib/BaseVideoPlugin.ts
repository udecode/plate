import { createSlatePlugin, KEYS } from '@udecode/plate';

export const BaseVideoPlugin = createSlatePlugin({
  key: KEYS.video,
  node: {
    dangerouslyAllowAttributes: ['width', 'height'],
    isElement: true,
    isVoid: true,
  },
});
