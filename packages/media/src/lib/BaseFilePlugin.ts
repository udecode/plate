import { createEditorPlugin, KEYS } from 'platejs';

export const BaseFilePlugin = createEditorPlugin({
  key: KEYS.file,
  node: { isElement: true, isVoid: true },
});
