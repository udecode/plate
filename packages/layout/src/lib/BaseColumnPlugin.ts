import { createSlatePlugin, KEYS } from 'platejs';

import { withColumn } from './withColumn';

export const BaseColumnItemPlugin = createSlatePlugin({
  key: KEYS.column,
  node: { isContainer: true, isElement: true, isStrictSiblings: true },
}).overrideEditor(withColumn);

export const BaseColumnPlugin = createSlatePlugin({
  key: KEYS.columnGroup,
  node: { isContainer: true, isElement: true },
  plugins: [BaseColumnItemPlugin],
});
