import { defineBasePlugin } from '@platejs/core';
import type { ElementOf, NodeInsertNodesOptions, Text } from '@platejs/plite';
import { property } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

import { normalizeDateValue } from './dateValue';

export const BaseDatePlugin = defineBasePlugin(PLUGINS.date, {
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/markdown': {
        from: type,
        kind: 'node',
        decode: ({ node, parseAttributes }) => {
          const props = parseAttributes(node.attributes);
          const firstChild = node.children[0];
          const dateValue =
            typeof props.value === 'string'
              ? props.value
              : firstChild?.type === 'text'
                ? firstChild.value
                : '';

          return {
            ...normalizeDateValue(dateValue),
            children: [{ text: '' }],
            type,
          };
        },
        encode: ({ node, propsToAttributes }) => {
          if (node.date && !node.rawDate) {
            return {
              attributes: propsToAttributes({ value: node.date }),
              children: [],
              name: type,
              type: 'mdxJsxTextElement',
            };
          }

          return {
            attributes: [],
            children: [
              { type: 'text', value: node.rawDate ?? node.date ?? '' },
            ],
            name: type,
            type: 'mdxJsxTextElement',
          };
        },
      },
    }),
  schema: {
    element: {
      properties: {
        date: property.string(),
        rawDate: property.string(),
      },
      void: 'inline',
    },
  },
}).extend(({ plugin, schema: { type } }) => {
  type DateNode = ElementOf<typeof plugin>;

  return {
    update: ({ tx }) => ({
      insert: (
        { date }: { date?: string } = {},
        options: NodeInsertNodesOptions<DateNode | Text> = {}
      ) => {
        tx.nodes.insert(
          [
            {
              children: [{ text: '' }],
              ...normalizeDateValue(date ?? new Date()),
              type,
            },
            { text: ' ' },
          ],
          options
        );
      },
    }),
  };
});

export type DateElement = ElementOf<typeof BaseDatePlugin>;
