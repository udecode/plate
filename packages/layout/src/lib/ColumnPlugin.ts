import { createSlatePlugin } from '@udecode/plate-common';

import { withColumn } from './withColumn';

export const ColumnItemPlugin = createSlatePlugin({
  extendEditor: withColumn,
  isElement: true,
  key: 'column',
});

export const ColumnPlugin = createSlatePlugin({
  isElement: true,
  key: 'column_group',
  plugins: [ColumnItemPlugin],
});
