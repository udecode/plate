import { createEditorPlugin, KEYS } from 'platejs';

export const BaseAudioPlugin = createEditorPlugin({
  key: KEYS.audio,
  node: { isElement: true, isVoid: true },
});
