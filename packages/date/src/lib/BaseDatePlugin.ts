import { defineBasePlugin } from '@platejs/core';
import type { NodeInsertNodesOptions, Text } from '@platejs/plite';
import { property } from '@platejs/plite';
import { PLUGINS, type TDateElement } from '@platejs/utils';

import { normalizeDateValue } from './dateValue';

export type InsertDateOptions = NodeInsertNodesOptions<TDateElement | Text> & {
  date?: string;
};

export const BaseDatePlugin = defineBasePlugin(PLUGINS.date, {
  codecs: ({ defineCodecs, type }) =>
    defineCodecs({
      'text/markdown': {
        from: 'date',
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
            children: [{ text: '' }],
            ...normalizeDateValue(dateValue),
            type,
          };
        },
        encode: ({ node, propsToAttributes }) => {
          if (node.date && !node.rawDate) {
            return {
              attributes: propsToAttributes({ value: node.date }),
              children: [],
              name: 'date',
              type: 'mdxJsxTextElement',
            };
          }

          return {
            attributes: [],
            children: [
              { type: 'text', value: node.rawDate ?? node.date ?? '' },
            ],
            name: 'date',
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
  update: ({ tx, type }) => ({
    insert: ({ date, ...options }: InsertDateOptions = {}) => {
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
});
