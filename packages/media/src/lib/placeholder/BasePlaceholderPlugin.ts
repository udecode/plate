import { defineBasePlugin } from '@platejs/core';
import { type NodeInsertNodesOptions, property } from '@platejs/plite';
import type { TPlaceholderElement } from '@platejs/utils';
import { KEYS, NODES } from '@platejs/utils';

export const BasePlaceholderPlugin = defineBasePlugin(KEYS.placeholder, {
  type: NODES.placeholder,
  schema: {
    element: {
      properties: {
        mediaType: property.string(),
      },
      void: 'block',
    },
  },
  update: ({ tx, type }) => ({
    insert: (
      mediaType: string,
      options?: NodeInsertNodesOptions<TPlaceholderElement>
    ) =>
      tx.nodes.insert<TPlaceholderElement>(
        {
          children: [{ text: '' }],
          mediaType,
          type,
        },
        options
      ),
  }),
});
