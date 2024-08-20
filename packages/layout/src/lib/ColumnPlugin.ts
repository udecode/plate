import { createSlatePlugin } from '@udecode/plate-common';

import { withColumn } from './withColumn';

export const ColumnItemPlugin = createSlatePlugin({
  isElement: true,
  key: 'column',
  withOverrides: withColumn,
});

export const ColumnPlugin = createSlatePlugin({
  isElement: true,
  key: 'column_group',
  plugins: [ColumnItemPlugin],
});
