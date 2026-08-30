import {
  defineBasePlugin,
  type ElementOf,
  type PlateNodeInsertOptions,
  PLUGINS,
  property,
} from '../../../core';

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
  .extend(({ plugin }) => ({
    read: ({ state }) => ({
      getSelectedItems: () =>
        Array.from(
          state.nodes.entries({
            at: [],
            type: plugin,
          })
        ).map(([node]) => ({ value: node.value })),
    }),
    update: ({ tx, schema: { type } }) => ({
      insert: (props: TagItem, options?: PlateNodeInsertOptions) => {
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
  }))
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
