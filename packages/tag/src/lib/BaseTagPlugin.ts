import { createBasePlugin } from '@platejs/core';
import type { NodeInsertNodesOptions, Text } from '@platejs/plite';
import type { TTagElement, TTagProps } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

export const BaseTagPlugin = createBasePlugin({
  key: KEYS.tag,
  node: {
    isElement: true,
    isInline: true,
    isVoid: true,
  },
}).extendTx(({ type }) => (tx) => ({
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
}));
