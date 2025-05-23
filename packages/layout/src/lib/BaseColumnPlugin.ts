import { createSlatePlugin, KEYS } from '@udecode/plate';

import { withColumn } from './withColumn';

export const BaseColumnItemPlugin = createSlatePlugin({
  key: KEYS.column,
  node: { isElement: true },
}).overrideEditor(withColumn);

export const BaseColumnPlugin = createSlatePlugin({
  key: KEYS.columnGroup,
  node: { isElement: true },
  plugins: [BaseColumnItemPlugin],
});
