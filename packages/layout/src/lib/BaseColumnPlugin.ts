import { createSlatePlugin, keyToDataAttribute } from '@udecode/plate';

import { withColumn } from './withColumn';

export const BaseColumnItemPlugin = createSlatePlugin({
  key: 'column',
  node: {
    isElement: true,
  },

  parsers: {
    html: {},
  },
}).overrideEditor(withColumn);

export const BaseColumnPlugin = createSlatePlugin({
  key: 'column_group',
  node: {
    isElement: true,
    toDataAttributes: ({ node }) => {
      keyToDataAttribute;

      return {};
    },
  },
  plugins: [BaseColumnItemPlugin],
});
