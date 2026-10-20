import {
  definePlugin,
  PLUGINS,
  property,
  type ElementOf,
  type NodeInsertOptions,
  txLocate,
  locateAt,
} from '../../../core';
import { formatDateValue, parseCanonicalDateValue } from './dateValue';
import { parseLegacyDateValue } from './legacyDateValue.internal';

const readDateText = (text: string) => {
  const trimmed = text.trim();

  return parseLegacyDateValue(trimmed) ?? trimmed;
};

export const BaseDatePlugin = definePlugin(PLUGINS.date, {
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      markdown: {
        tag: type,
        decode: ({ node, readTagAttributes }) => {
          const { attributes, properties } = readTagAttributes();
          const firstChild = node.children[0];
          const value =
            typeof attributes.text === 'string'
              ? attributes.text
              : readDateText(
                  typeof properties.value === 'string'
                    ? properties.value
                    : firstChild?.type === 'text'
                      ? firstChild.value
                      : ''
                );

          if (!value.trim()) return undefined;

          return {
            children: [{ text: '' }],
            type,
            value,
          };
        },
        encode: ({ encodeAttributes, node, preserve }) => {
          const { value } = node;

          if (parseCanonicalDateValue(value)) {
            return {
              attributes: encodeAttributes({ value }),
              children: [],
              name: type,
              type: 'mdxJsxTextElement',
            };
          }

          preserve('value');

          return {
            attributes: [{ name: 'text', type: 'mdxJsxAttribute', value }],
            children: [],
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
    insert: txLocate(
      locateAt(1),
      (
        { value = new Date() }: { value?: Date | string } = {},
        options: NodeInsertOptions = {}
      ) => {
        const stored =
          value instanceof Date
            ? Number.isNaN(value.getTime())
              ? undefined
              : formatDateValue(value)
            : value.trim();

        if (!stored) return;

        tx.nodes.insert(
          [
            {
              children: [{ text: '' }],
              type,
              value: stored,
            },
            { text: ' ' },
          ],
          options
        );
      }
    ),
  }),
}));

export type DateElement = ElementOf<typeof BaseDatePlugin>;
