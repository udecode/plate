import { createBasePlugin } from '@platejs/core';
import { type NodeInsertNodesOptions, property } from '@platejs/plite';
import type { TPlaceholderElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

export const BasePlaceholderPlugin = createBasePlugin({
  name: KEYS.placeholder,
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
