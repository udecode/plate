import { createSlatePlugin, keyToDataAttribute } from '@udecode/plate';

import type { TColumnGroupElement } from './types';

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
    dangerouslyAllowAttributes: [keyToDataAttribute('layout')],
    isElement: true,
    toDataAttributes: ({ node }) => {
      if (node.layout as TColumnGroupElement['layout']) {
        return {
          [keyToDataAttribute('layout')]: JSON.stringify(node.layout),
        };
      }
    },
  },
  parsers: {
    html: {
      deserializer: {
        toNodeProps: ({ element }) => {
          const dangerouslyLayoutString = element.getAttribute(
            keyToDataAttribute('layout')
          );

          if (!dangerouslyLayoutString) return;

          const layout = JSON.parse(dangerouslyLayoutString);

          if (!Array.isArray(layout)) return;

          return {
            layout: layout,
          };
        },
      },
    },
  },
  plugins: [BaseColumnItemPlugin],
});
