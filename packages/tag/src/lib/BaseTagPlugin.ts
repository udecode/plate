import { defineBasePlugin } from '@platejs/core';
import {
  type ElementOf,
  type NodeInsertNodesOptions,
  type Text,
  property,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

export type TagItem = { url?: string; value: string };

export const BaseTagPlugin = defineBasePlugin(PLUGINS.tag, {
  schema: {
    element: {
      properties: {
        url: property.string(),
        value: property.string({ required: true }),
      },
      void: 'inline',
    },
  },
})
  .extend(({ plugin }) => {
    type TagElement = ElementOf<typeof plugin>;

    return {
      read: ({ state, schema: { type } }) => ({
        getSelectedItems: () =>
          Array.from(
            state.nodes.entries<TagElement>({
              at: [],
              match: { type },
            })
          ).map(([node]) => ({ value: node.value })),
      }),
      update: ({ tx, schema: { type } }) => ({
        insert: (
          props: TagItem,
          options?: NodeInsertNodesOptions<TagElement | Text>
        ) => {
          tx.nodes.insert(
            [
              {
                children: [{ text: '' }],
                type,
                ...(props.url === undefined ? {} : { url: props.url }),
                value: props.value,
              },
              { text: '' },
            ],
            options
          );
        },
      }),
    };
  })
  .extend(({ plugin }) => ({
    read: ({ state }) => ({
      isEqual: (tags: readonly TagItem[] = []) => {
        const current = new Set(
          state[plugin.name].getSelectedItems().map((item) => item.value)
        );
        const next = new Set(tags.map((item) => item.value));

        return (
          current.size === next.size &&
          [...current].every((value) => next.has(value))
        );
      },
    }),
  }));

export type TagElement = ElementOf<typeof BaseTagPlugin>;
