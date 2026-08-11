import {
  BaseParagraphPlugin,
  defineBasePlugin,
  getInjectMatch,
  type DefinitionOf,
} from '@platejs/core';
import {
  type Element,
  type NodeSetNodesOptions,
  property,
  schema,
  target,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

const digitRegex = /\d+/;
const getMarkdownStyleValue = (
  attributes: readonly {
    type: string;
    name?: string;
    value?: unknown;
  }[],
  styleName: string
) => {
  const styleAttribute = attributes.find(
    (attribute) =>
      attribute.type === 'mdxJsxAttribute' &&
      attribute.name === 'style' &&
      typeof attribute.value === 'string'
  );

  if (typeof styleAttribute?.value !== 'string') return;

  for (const style of styleAttribute.value.split(';')) {
    const [name, value] = style.split(':').map((part) => part.trim());

    if (name === styleName) return value;
  }
};

export type Alignment =
  | 'center'
  | 'end'
  | 'justify'
  | 'left'
  | 'right'
  | 'start';

export type TextIndentPluginState = {
  offset: number;
  unit: string;
};

export const BaseFontBackgroundColorPlugin = defineBasePlugin(
  PLUGINS.backgroundColor,
  {
    schema: { mark: property.string() },
    codecs: ({ defineCodecs, schema: { key } }) =>
      defineCodecs({
        'text/html': {
          decode: ({ element }) => element.style.backgroundColor || undefined,
          encode: ({ value }) => ({
            style: { backgroundColor: value },
            tag: 'span',
          }),
          match: [{ style: { backgroundColor: '*' } }],
        },

        'text/markdown': {
          from: 'span',
          kind: 'node',
          mark: true,
          decode: ({ decode, decoration, node }) => {
            const value = getMarkdownStyleValue(
              node.attributes,
              'background-color'
            );

            return decode(node.children, {
              ...decoration,
              ...(value === undefined ? {} : { [key]: value }),
            });
          },
          encode: ({ node }) => ({
            attributes: [
              {
                name: 'style',
                type: 'mdxJsxAttribute',
                value: `background-color: ${String(node[key])};`,
              },
            ],
            children: [{ type: 'text', value: node.text }],
            name: 'span',
            type: 'mdxJsxTextElement',
          }),
        },
      }),
    inject: {
      nodeProps: {
        styleKey: 'backgroundColor',
      },
    },
  }
);

export const BaseFontColorPlugin = defineBasePlugin(PLUGINS.color, {
  schema: { mark: property.string() },
  codecs: ({ defineCodecs, schema: { key } }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => element.style.color || undefined,
        encode: ({ value }) => ({
          style: { color: value },
          tag: 'span',
        }),
        match: [{ style: { color: '*' } }],
      },

      'text/markdown': {
        from: 'span',
        kind: 'node',
        mark: true,
        decode: ({ decode, decoration, node }) => {
          const value = getMarkdownStyleValue(node.attributes, 'color');

          return decode(node.children, {
            ...decoration,
            ...(value === undefined ? {} : { [key]: value }),
          });
        },
        encode: ({ node }) => ({
          attributes: [
            {
              name: 'style',
              type: 'mdxJsxAttribute',
              value: `color: ${String(node[key])};`,
            },
          ],
          children: [{ type: 'text', value: node.text }],
          name: 'span',
          type: 'mdxJsxTextElement',
        }),
      },
    }),
  inject: {
    nodeProps: {
      defaultNodeValue: 'black',
      styleKey: 'color',
    },
  },
});

export const BaseFontFamilyPlugin = defineBasePlugin(PLUGINS.fontFamily, {
  schema: { mark: property.string() },
  codecs: ({ defineCodecs, schema: { key } }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => element.style.fontFamily || undefined,
        encode: ({ value }) => ({
          style: { fontFamily: value },
          tag: 'span',
        }),
        match: [{ style: { fontFamily: '*' } }],
      },

      'text/markdown': {
        from: 'span',
        kind: 'node',
        mark: true,
        decode: ({ decode, decoration, node }) => {
          const value = getMarkdownStyleValue(node.attributes, 'font-family');

          return decode(node.children, {
            ...decoration,
            ...(value === undefined ? {} : { [key]: value }),
          });
        },
        encode: ({ node }) => ({
          attributes: [
            {
              name: 'style',
              type: 'mdxJsxAttribute',
              value: `font-family: ${String(node[key])};`,
            },
          ],
          children: [{ type: 'text', value: node.text }],
          name: 'span',
          type: 'mdxJsxTextElement',
        }),
      },
    }),
  inject: {
    nodeProps: {
      styleKey: 'fontFamily',
    },
  },
});

export const BaseFontSizePlugin = defineBasePlugin(PLUGINS.fontSize, {
  schema: { mark: property.string() },
  codecs: ({ defineCodecs, schema: { key } }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => element.style.fontSize || undefined,
        encode: ({ value }) => ({
          style: { fontSize: value },
          tag: 'span',
        }),
        match: [{ style: { fontSize: '*' } }],
      },

      'text/markdown': {
        from: 'span',
        kind: 'node',
        mark: true,
        decode: ({ decode, decoration, node }) => {
          const value = getMarkdownStyleValue(node.attributes, 'font-size');

          return decode(node.children, {
            ...decoration,
            ...(value === undefined ? {} : { [key]: value }),
          });
        },
        encode: ({ node }) => ({
          attributes: [
            {
              name: 'style',
              type: 'mdxJsxAttribute',
              value: `font-size: ${String(node[key])};`,
            },
          ],
          children: [{ type: 'text', value: node.text }],
          name: 'span',
          type: 'mdxJsxTextElement',
        }),
      },
    }),
  inject: {
    nodeProps: {
      styleKey: 'fontSize',
    },
  },
});

export const BaseFontWeightPlugin = defineBasePlugin(PLUGINS.fontWeight, {
  schema: { mark: property.string() },
  codecs: ({ defineCodecs, schema: { key } }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) =>
          element.style.fontWeight === 'normal'
            ? undefined
            : element.style.fontWeight || undefined,
        encode: ({ value }) => ({
          style: { fontWeight: value },
          tag: 'span',
        }),
        match: [{ style: { fontWeight: '*' } }],
      },

      'text/markdown': {
        from: 'span',
        kind: 'node',
        mark: true,
        decode: ({ decode, decoration, node }) => {
          const value = getMarkdownStyleValue(node.attributes, 'font-weight');

          return decode(node.children, {
            ...decoration,
            ...(value === undefined ? {} : { [key]: value }),
          });
        },
        encode: ({ node }) => ({
          attributes: [
            {
              name: 'style',
              type: 'mdxJsxAttribute',
              value: `font-weight: ${String(node[key])};`,
            },
          ],
          children: [{ type: 'text', value: node.text }],
          name: 'span',
          type: 'mdxJsxTextElement',
        }),
      },
    }),
  inject: {
    nodeProps: {
      styleKey: 'fontWeight',
    },
  },
});

/** Enables configurable line spacing on targeted block elements. */
export const BaseLineHeightPlugin = defineBasePlugin(PLUGINS.lineHeight, {
  schema: ({ targetElementTypes }) => ({
    properties: {
      lineHeight: schema.elementProperty(
        property.json({
          validate: (value): value is number | string =>
            (typeof value === 'number' && Number.isFinite(value)) ||
            typeof value === 'string',
          validationVersion: 1,
        }),
        {
          target: target.types(targetElementTypes),
          typeChange: 'preserve-if-allowed',
        }
      ),
    },
  }),
  targetPlugins: [BaseParagraphPlugin],
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => {
          if (!element.style.lineHeight) return;

          const value = Number(element.style.lineHeight);

          return Number.isFinite(value) ? value : element.style.lineHeight;
        },
        encode: ({ value }) => ({ style: { lineHeight: value } }),
        match: [{ style: { lineHeight: '*' } }],
      },
    }),
  inject: {
    isBlock: true,
    nodeProps: {
      defaultNodeValue: 1.5,
    },
  },
  update: ({ editor, plugin, tx }) => ({
    set: (value: number, options?: NodeSetNodesOptions<Element>) => {
      const { defaultNodeValue } = editor.plugin(plugin).inject.nodeProps!;
      const match = getInjectMatch(editor, plugin);

      if (value === defaultNodeValue) {
        tx.nodes.unset('lineHeight', {
          match,
          ...options,
        });
        return;
      }

      tx.nodes.set(
        { lineHeight: value },
        {
          match,
          ...options,
        }
      );
    },
  }),
});

/** Creates a plugin that adds alignment functionality to the editor. */
export const BaseTextAlignPlugin = defineBasePlugin(PLUGINS.textAlign, {
  schema: ({ targetElementTypes }) => ({
    properties: {
      textAlign: schema.elementProperty(property.string(), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
    },
  }),
  targetPlugins: [BaseParagraphPlugin],
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => element.style.textAlign || undefined,
        encode: ({ value }) => ({ style: { textAlign: value } }),
        match: [
          {
            style: {
              textAlign: ['start', 'left', 'center', 'right', 'end', 'justify'],
            },
          },
        ],
      },
    }),
  inject: {
    isBlock: true,
    nodeProps: {
      defaultNodeValue: 'start',
      styleKey: 'textAlign',
      validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
    },
  },
  update: ({ editor, plugin, tx }) => ({
    set: (value: Alignment, options?: NodeSetNodesOptions<Element>) => {
      const { defaultNodeValue } = editor.plugin(plugin).inject.nodeProps!;
      const match = getInjectMatch(editor, plugin);

      if (value === defaultNodeValue) {
        tx.nodes.unset('textAlign', {
          match,
          ...options,
        });
        return;
      }

      tx.nodes.set(
        { textAlign: value },
        {
          match,
          ...options,
        }
      );
    },
  }),
});

export const BaseTextIndentPlugin = defineBasePlugin(PLUGINS.textIndent, {
  initialState: (): TextIndentPluginState => ({
    offset: 24,
    unit: 'px',
  }),
  schema: ({ targetElementTypes }) => ({
    properties: {
      textIndent: schema.elementProperty(property.number(), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
    },
  }),
  targetPlugins: [BaseParagraphPlugin],
  codecs: ({ defineCodecs, store }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => {
          const { offset, unit } = store.get();
          const dataValue = element.dataset.textIndent;

          if (dataValue) {
            const value = Number(dataValue);

            return Number.isFinite(value) && value !== 0 ? value : undefined;
          }

          const styleValue = element.style.textIndent;

          if (!styleValue || !offset || (unit && !styleValue.endsWith(unit))) {
            return;
          }

          const numericValue = unit
            ? styleValue.slice(0, -unit.length)
            : styleValue;
          const value = Number(numericValue) / offset;

          return Number.isFinite(value) && value !== 0 ? value : undefined;
        },
        encode: ({ value }) => {
          const { offset, unit } = store.get();

          return {
            attributes: { 'data-text-indent': value },
            style: { textIndent: value * offset + unit },
          };
        },
        match: [
          { attributes: { 'data-text-indent': true } },
          { style: { textIndent: '*' } },
        ],
      },
    }),
  inject: {
    isBlock: true,
    nodeProps: {
      styleKey: 'textIndent',
      transformNodeValue: ({ store, nodeValue }) => {
        const { offset, unit } = store.get();

        return Number(nodeValue) * offset + unit;
      },
    },
  },
});

export type LineHeightDefinition = DefinitionOf<typeof BaseLineHeightPlugin>;
export type TextAlignDefinition = DefinitionOf<typeof BaseTextAlignPlugin>;
export type TextIndentDefinition = DefinitionOf<typeof BaseTextIndentPlugin>;

/** Converts a CSS size to a unitless pixel value. */
export const toUnitLess = (value: string): string => {
  const match = digitRegex.exec(value);

  if (!match) return '0';

  const number = Number(match[0]);

  return value.endsWith('rem') ? String(number * 16) : String(number);
};
