import { createSlatePlugin, KEYS } from 'platejs';

export const BaseAudioPlugin = createSlatePlugin({
  key: KEYS.audio,
  node: { isElement: true, isVoid: true },
});
