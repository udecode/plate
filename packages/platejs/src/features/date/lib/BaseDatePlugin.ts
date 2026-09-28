import {
  definePlugin,
  PLUGINS,
  property,
  type ElementOf,
  type NodeInsertOptions,
} from '../../../core';
import { normalizeDateValue, parseCanonicalDateValue } from './dateValue';

export const BaseDatePlugin = definePlugin(PLUGINS.date, {
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      markdown: {
        tag: type,
        decode: ({ node, readTagAttributes }) => {
          const props = readTagAttributes().properties;
          const firstChild = node.children[0];
          const dateValue =
            typeof props.value === 'string'
              ? props.value
              : firstChild?.type === 'text'
                ? firstChild.value
                : '';
          const value = normalizeDateValue(dateValue);

          if (!value) return undefined;

          return {
            children: [{ text: '' }],
            type,
            value,
          };
        },
        encode: ({ encodeAttributes, node }) => {
          if (parseCanonicalDateValue(node.value)) {
            return {
              attributes: encodeAttributes({ value: node.value }),
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
      selectable: false,
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
      options: NodeInsertOptions = {}
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
