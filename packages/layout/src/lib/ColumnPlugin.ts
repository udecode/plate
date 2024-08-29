import { createSlatePlugin } from '@udecode/plate-common';

import { withColumn } from './withColumn';

export const ColumnItemPlugin = createSlatePlugin({
  extendEditor: withColumn,
  key: 'column',
  node: { isElement: true },
});

export const ColumnPlugin = createSlatePlugin({
  key: 'column_group',
  node: { isElement: true },
  plugins: [ColumnItemPlugin],
});
