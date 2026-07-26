import { createBasePlugin } from '@platejs/core';
import {
  type NodeInsertNodesOptions,
  type Text,
  property,
} from '@platejs/plite';
import type { TTagElement, TTagProps } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

export const BaseTagPlugin = createBasePlugin({
  key: KEYS.tag,
  schema: {
    element: {
      properties: { value: property.string() },
      void: 'inline',
    },
  },
  update: ({ tx, type }) => ({
    insert: (
      props: TTagProps,
      options?: NodeInsertNodesOptions<TTagElement | Text>
    ) => {
      tx.nodes.insert(
        [
          {
            children: [{ text: '' }],
            type,
            ...props,
          },
          { text: '' },
        ],
        options
      );
    },
  }),
});
