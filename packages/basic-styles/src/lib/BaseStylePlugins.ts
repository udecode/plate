import {
  BaseParagraphPlugin,
  defineBasePlugin,
  getInjectMatch,
  type DefinitionOf,
} from '@platejs/core';
import {
  type Element,
  type NodeSetNodesOptions,
  type NodeUnsetNodesOptions,
  property,
  target,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

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
  KEYS.backgroundColor,
  {
    schema: { mark: property.string() },
    codecs: ({ defineCodecs }) =>
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
          decode: ({ decode, decoration, node, type }) => {
            const value = getMarkdownStyleValue(
              node.attributes,
              'background-color'
            );

            return decode(node.children, {
              ...decoration,
              ...(value === undefined ? {} : { [type]: value }),
            });
          },
          encode: ({ node, type }) => ({
            attributes: [
              {
                name: 'style',
                type: 'mdxJsxAttribute',
                value: `background-color: ${String(node[type])};`,
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
    update: ({ tx, type }) => ({
      clear: () => {
        tx.marks.remove(type);
      },
      set: (value: string) => {
        tx.marks.add(type, value);
      },
    }),
  }
);

export const BaseFontColorPlugin = defineBasePlugin(KEYS.color, {
  schema: { mark: property.string() },
  codecs: ({ defineCodecs }) =>
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
        decode: ({ decode, decoration, node, type }) => {
          const value = getMarkdownStyleValue(node.attributes, 'color');

          return decode(node.children, {
            ...decoration,
            ...(value === undefined ? {} : { [type]: value }),
          });
        },
        encode: ({ node, type }) => ({
          attributes: [
            {
              name: 'style',
              type: 'mdxJsxAttribute',
              value: `color: ${String(node[type])};`,
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
  update: ({ tx, type }) => ({
    clear: () => {
      tx.marks.remove(type);
    },
    set: (value: string) => {
      tx.marks.add(type, value);
    },
  }),
});

export const BaseFontFamilyPlugin = defineBasePlugin(KEYS.fontFamily, {
  schema: { mark: property.string() },
  codecs: ({ defineCodecs }) =>
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
        decode: ({ decode, decoration, node, type }) => {
          const value = getMarkdownStyleValue(node.attributes, 'font-family');

          return decode(node.children, {
            ...decoration,
            ...(value === undefined ? {} : { [type]: value }),
          });
        },
        encode: ({ node, type }) => ({
          attributes: [
            {
              name: 'style',
              type: 'mdxJsxAttribute',
              value: `font-family: ${String(node[type])};`,
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
  update: ({ tx, type }) => ({
    set: (value: string) => {
      tx.marks.add(type, value);
    },
  }),
});

export const BaseFontSizePlugin = defineBasePlugin(KEYS.fontSize, {
  schema: { mark: property.string() },
  codecs: ({ defineCodecs }) =>
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
        decode: ({ decode, decoration, node, type }) => {
          const value = getMarkdownStyleValue(node.attributes, 'font-size');

          return decode(node.children, {
            ...decoration,
            ...(value === undefined ? {} : { [type]: value }),
          });
        },
        encode: ({ node, type }) => ({
          attributes: [
            {
              name: 'style',
              type: 'mdxJsxAttribute',
              value: `font-size: ${String(node[type])};`,
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
  update: ({ tx, type }) => ({
    set: (value: string) => {
      tx.marks.add(type, value);
    },
  }),
});

export const BaseFontWeightPlugin = defineBasePlugin(KEYS.fontWeight, {
  schema: { mark: property.string() },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => element.style.fontWeight || undefined,
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
        decode: ({ decode, decoration, node, type }) => {
          const value = getMarkdownStyleValue(node.attributes, 'font-weight');

          return decode(node.children, {
            ...decoration,
            ...(value === undefined ? {} : { [type]: value }),
          });
        },
        encode: ({ node, type }) => ({
          attributes: [
            {
              name: 'style',
              type: 'mdxJsxAttribute',
              value: `font-weight: ${String(node[type])};`,
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
  update: ({ tx, type }) => ({
    set: (value: string) => {
      tx.marks.add(type, value);
    },
  }),
});

/** Enables configurable line spacing on targeted block elements. */
export const BaseLineHeightPlugin = defineBasePlugin(KEYS.lineHeight, {
  schema: ({ own, targetElementTypes }) => ({
    properties: [
      own.elementProperty(
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
    ],
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
  update: ({ editor, plugin, tx, type }) => ({
    set: (value: number, options?: NodeSetNodesOptions<Element>) => {
      const { defaultNodeValue } =
        editor.plugin(plugin).plugin.inject.nodeProps!;
      const match = getInjectMatch(editor, plugin);

      if (value === defaultNodeValue) {
        tx.nodes.unset(type, {
          match,
          ...options,
        });
        return;
      }

      tx.nodes.set(
        { [type]: value },
        {
          match,
          ...options,
        }
      );
    },
  }),
});

/** Creates a plugin that adds alignment functionality to the editor. */
export const BaseTextAlignPlugin = defineBasePlugin(KEYS.textAlign, {
  schema: ({ own, targetElementTypes }) => ({
    properties: [
      own.elementProperty(property.string(), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
    ],
  }),
  targetPlugins: [BaseParagraphPlugin],
  type: 'align',
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
  update: ({ editor, plugin, tx, type }) => ({
    set: (value: Alignment, options?: NodeSetNodesOptions<Element>) => {
      const { defaultNodeValue } =
        editor.plugin(plugin).plugin.inject.nodeProps!;
      const match = getInjectMatch(editor, plugin);

      if (value === defaultNodeValue) {
        tx.nodes.unset(type, {
          match,
          ...options,
        });
        return;
      }

      tx.nodes.set(
        { [type]: value },
        {
          match,
          ...options,
        }
      );
    },
  }),
});

export const BaseTextIndentPlugin = defineBasePlugin(KEYS.textIndent, {
  initialState: (): TextIndentPluginState => ({
    offset: 24,
    unit: 'px',
  }),
  schema: ({ own, targetElementTypes }) => ({
    properties: [
      own.elementProperty(property.number(), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
    ],
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
}).extend({
  update: ({ tx, type }) => ({
    set: (value: number, options?: NodeSetNodesOptions<Element>) => {
      tx.nodes.set({ [type]: value }, options);
    },
    unset: (options?: NodeUnsetNodesOptions<Element>) => {
      tx.nodes.unset(type, options);
    },
  }),
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
