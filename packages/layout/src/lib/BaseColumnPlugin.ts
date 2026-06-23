import { createSlatePlugin, KEYS } from 'platejs';

export const BaseColumnItemPlugin = createSlatePlugin({
  key: KEYS.column,
  node: { isContainer: true, isElement: true, isStrictSiblings: true },
});

export const BaseColumnPlugin = createSlatePlugin({
  key: KEYS.columnGroup,
  node: { isContainer: true, isElement: true },
  plugins: [BaseColumnItemPlugin],
});
