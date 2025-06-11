import { createSlatePlugin, KEYS } from '@udecode/plate';

export const BaseFilePlugin = createSlatePlugin({
  key: KEYS.file,
  node: { isElement: true, isVoid: true },
});
