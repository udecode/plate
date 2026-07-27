import { createBasePlugin } from '@platejs/core';
import { type NodeInsertNodesOptions, property, schema } from '@platejs/plite';
import { KEYS, type TCalloutElement } from '@platejs/utils';

export const CALLOUT_STORAGE_KEY = 'plate-storage-callout';

export type InsertCalloutOptions = NodeInsertNodesOptions<TCalloutElement> & {
  icon?: string;
  variant?: TCalloutElement['variant'];
};

export const BaseCalloutPlugin = createBasePlugin({
  key: KEYS.callout,
  schema: {
    element: {
      content: schema.content.any(
        [schema.content.text(), schema.content.group('inline')],
        { default: 'text', min: 1 }
      ),
      properties: {
        backgroundColor: property.string(),
        icon: property.string(),
        variant: property.string(),
      },
    },
  },

  rules: {
    break: {
      default: 'lineBreak',
      empty: 'reset',
      emptyLineEnd: 'deleteExit',
    },
    delete: {
      start: 'reset',
    },
  },
  update: ({ tx, type }) => ({
    insert: ({ icon, variant, ...options }: InsertCalloutOptions = {}) => {
      tx.nodes.insert<TCalloutElement>(
        {
          children: [{ text: '' }],
          icon: icon ?? localStorage.getItem(CALLOUT_STORAGE_KEY) ?? '💡',
          type,
          ...(variant === undefined ? {} : { variant }),
        },
        options
      );
    },
  }),
});
