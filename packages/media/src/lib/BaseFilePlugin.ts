import { createSlatePlugin, KEYS } from 'platejs';

export const BaseFilePlugin = createSlatePlugin({
  key: KEYS.file,
  node: { isElement: true, isVoid: true },
});
