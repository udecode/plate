import { defineBasePlugin, type PlateNodeInsertOptions } from '@platejs/core';
import type { ElementOf } from '@platejs/plite';
import { property } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

import { normalizeDateValue, parseCanonicalDateValue } from './dateValue';

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
          const value = normalizeDateValue(dateValue);

          if (!value) return;

          return {
            children: [{ text: '' }],
            type,
            value,
          };
        },
        encode: ({ node, propsToAttributes }) => {
          if (parseCanonicalDateValue(node.value)) {
            return {
              attributes: propsToAttributes({ value: node.value }),
              children: [],
              name: type,
              type: 'mdxJsxTextElement',
            };
          }

          return {
            attributes: [],
            children: [{ type: 'text', value: node.value }],
            name: type,
            type: 'mdxJsxTextElement',
          };
        },
      },
    }),
  schema: {
    element: {
      properties: {
        value: property.string({
          required: true,
          validate: (value): value is string =>
            typeof value === 'string' && value.trim().length > 0,
          validationVersion: 1,
        }),
      },
      void: 'inline',
    },
  },
}).extend(({ schema: { type } }) => ({
  update: ({ tx }) => ({
    insert: (
      { value }: { value?: Date | string } = {},
      options: PlateNodeInsertOptions = {}
    ) => {
      const normalized = normalizeDateValue(value ?? new Date());

      if (!normalized) return;

      tx.nodes.insert(
        [
          {
            children: [{ text: '' }],
            type,
            value: normalized,
          },
          { text: ' ' },
        ],
        options
      );
    },
  }),
}));

export type DateElement = ElementOf<typeof BaseDatePlugin>;
