import { createSlatePlugin } from '@udecode/plate';

import { withColumn } from './withColumn';

export const BaseColumnItemPlugin = createSlatePlugin({
  key: 'column',
  extendEditor: withColumn,
  node: { isElement: true },
});

export const BaseColumnPlugin = createSlatePlugin({
  key: 'column_group',
  node: { isElement: true },
  plugins: [BaseColumnItemPlugin],
});
