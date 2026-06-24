import { createEditorPlugin, KEYS } from 'platejs';

export const BaseColumnItemPlugin = createEditorPlugin({
  key: KEYS.column,
  node: { isContainer: true, isElement: true, isStrictSiblings: true },
});

export const BaseColumnPlugin = createEditorPlugin({
  key: KEYS.columnGroup,
  node: { isContainer: true, isElement: true },
  plugins: [BaseColumnItemPlugin],
});
