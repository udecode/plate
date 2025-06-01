import { createSlatePlugin, KEYS } from '@udecode/plate';

export const BaseAudioPlugin = createSlatePlugin({
  key: KEYS.audio,
  node: { isElement: true, isVoid: true },
});
