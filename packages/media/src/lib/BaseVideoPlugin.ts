import { createSlatePlugin, KEYS } from 'platejs';

export const BaseVideoPlugin = createSlatePlugin({
  key: KEYS.video,
  node: {
    dangerouslyAllowAttributes: ['width', 'height'],
    isElement: true,
    isVoid: true,
  },
});
