import { createEditorPlugin, KEYS } from 'platejs';

export const BaseVideoPlugin = createEditorPlugin({
  key: KEYS.video,
  node: {
    dangerouslyAllowAttributes: ['width', 'height'],
    isElement: true,
    isVoid: true,
  },
});
