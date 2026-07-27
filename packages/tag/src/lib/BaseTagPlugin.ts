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
  read: ({ state, type }) => {
    const getSelectedItems = () =>
      Array.from(
        state.nodes.entries<TTagElement>({
          at: [],
          match: { type },
        })
      ).map(([{ children: _children, type: _type, ...item }]) => item);

    return {
      getSelectedItems,
      isEqual: (tags: readonly TTagProps[] = []) => {
        const current = new Set(getSelectedItems().map((item) => item.value));
        const next = new Set(tags.map((item) => item.value));

        return (
          current.size === next.size &&
          [...current].every((value) => next.has(value))
        );
      },
    };
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
