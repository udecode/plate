import {
  BaseParagraphPlugin,
  definePlugin,
  getInjectMatch,
  PLUGINS,
  property,
  schema,
  target,
  type DefinitionOf,
  type Editor,
  type Element,
  type NodeSetNodesOptions,
  type PluginTransaction,
  txLocate,
  locateAt,
} from '../../../core';
import type { AnyBasePlugin } from '../../../lib/plugin/BasePlugin';

const digitRegex = /\d+/;
const lineHeightRegex = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(%|em)?$/i;

const isLineHeight = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const parseLineHeight = (text: string) => {
  const match = lineHeightRegex.exec(text.trim());

  if (!match) return undefined;

  const value = Number(match[2] === '%' ? `${match[1]}e-2` : match[1]);

  return isLineHeight(value) ? value : undefined;
};

const blockStyleUpdate =
  <TValue>(key: 'lineHeight' | 'textAlign' | 'textIndent') =>
  ({
    editor,
    plugin,
    tx,
  }: {
    editor: Editor;
    plugin: Pick<AnyBasePlugin, 'inject' | 'name' | 'targetPlugins'>;
    tx: PluginTransaction;
  }) => ({
    clear: txLocate(locateAt(0), (options?: NodeSetNodesOptions<Element>) => {
      tx.nodes.unset(key, {
        match: getInjectMatch(editor, plugin),
        ...options,
      });
    }),
    set: txLocate(
      locateAt(1),
      (value: TValue, options?: NodeSetNodesOptions<Element>) => {
        tx.nodes.set(
          { [key]: value },
          {
            match: getInjectMatch(editor, plugin),
            ...options,
          }
        );
      }
    ),
  });

export type Alignment =
  | 'center'
  | 'end'
  | 'justify'
  | 'left'
  | 'right'
  | 'start';

const ALIGNMENTS = [
  'center',
  'end',
  'justify',
  'left',
  'right',
  'start',
] as const satisfies readonly Alignment[];

const isAlignment = (value: unknown): value is Alignment =>
  typeof value === 'string' &&
  ALIGNMENTS.some((alignment) => alignment === value);

export type TextIndentPluginState = {
  offset: number;
  unit: string;
};

export const BaseFontBackgroundColorPlugin = definePlugin(
  PLUGINS.backgroundColor,
  {
    schema: { mark: property.string() },
    formats: ({ defineFormats }) =>
      defineFormats({
        html: {
          decode: ({ element }) => element.style.backgroundColor || undefined,
          encode: ({ value }) => ({
            style: { backgroundColor: value },
            tag: 'span',
          }),
          match: [{ style: { backgroundColor: '*' } }],
        },

        markdown: { tag: 'span', style: 'background-color' },
      }),
    inject: {
      nodeProps: {
        styleKey: 'backgroundColor',
      },
    },
  }
);

export const BaseFontColorPlugin = definePlugin(PLUGINS.color, {
  schema: { mark: property.string() },
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        decode: ({ element }) => element.style.color || undefined,
        encode: ({ value }) => ({
          style: { color: value },
          tag: 'span',
        }),
        match: [{ style: { color: '*' } }],
      },

      markdown: { tag: 'span', style: 'color' },
    }),
  inject: {
    nodeProps: {
      styleKey: 'color',
    },
  },
});

export const BaseFontFamilyPlugin = definePlugin(PLUGINS.fontFamily, {
  schema: { mark: property.string() },
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        decode: ({ element }) => element.style.fontFamily || undefined,
        encode: ({ value }) => ({
          style: { fontFamily: value },
          tag: 'span',
        }),
        match: [{ style: { fontFamily: '*' } }],
      },

      markdown: { tag: 'span', style: 'font-family' },
    }),
  inject: {
    nodeProps: {
      styleKey: 'fontFamily',
    },
  },
});

export const BaseFontSizePlugin = definePlugin(PLUGINS.fontSize, {
  schema: { mark: property.string() },
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        decode: ({ element }) => element.style.fontSize || undefined,
        encode: ({ value }) => ({
          style: { fontSize: value },
          tag: 'span',
        }),
        match: [{ style: { fontSize: '*' } }],
      },

      markdown: { tag: 'span', style: 'font-size' },
    }),
  inject: {
    nodeProps: {
      styleKey: 'fontSize',
    },
  },
});

export const BaseFontWeightPlugin = definePlugin(PLUGINS.fontWeight, {
  schema: { mark: property.string() },
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
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

      markdown: { tag: 'span', style: 'font-weight' },
    }),
  inject: {
    nodeProps: {
      styleKey: 'fontWeight',
    },
  },
});

/** Enables configurable line spacing on targeted block elements. */
export const BaseLineHeightPlugin = definePlugin(PLUGINS.lineHeight, {
  schema: ({ targetElementTypes }) => ({
    properties: {
      lineHeight: schema.elementProperty(
        property.number({ validate: isLineHeight, validationVersion: 1 }),
        {
          target: target.types(targetElementTypes),
          typeChange: 'preserve-if-allowed',
        }
      ),
    },
  }),
  targetPlugins: [BaseParagraphPlugin],
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        decode: ({ element, report }) => {
          const text = element.style.lineHeight;
          const value = parseLineHeight(text);

          if (value === undefined) {
            report({
              action: 'dropped',
              kind: 'style',
              message: `HTML line height "${text}" is not a positive number, percent or em value; it was omitted.`,
            });
          }

          return value;
        },
        encode: ({ value }) => ({ style: { lineHeight: value } }),
        match: [{ style: { lineHeight: '*' } }],
      },
    }),
  inject: {
    isBlock: true,
    nodeProps: {},
  },
  update: blockStyleUpdate<number>('lineHeight'),
});

/** Creates a plugin that adds alignment functionality to the editor. */
export const BaseTextAlignPlugin = definePlugin(PLUGINS.textAlign, {
  schema: ({ targetElementTypes }) => ({
    properties: {
      textAlign: schema.elementProperty(property.enum(ALIGNMENTS), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
    },
  }),
  targetPlugins: [BaseParagraphPlugin],
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        decode: ({ element }) =>
          isAlignment(element.style.textAlign)
            ? element.style.textAlign
            : undefined,
        encode: ({ value }) => ({ style: { textAlign: value } }),
        match: [
          {
            style: {
              textAlign: ALIGNMENTS,
            },
          },
        ],
      },
    }),
  inject: {
    isBlock: true,
    nodeProps: {
      styleKey: 'textAlign',
    },
  },
  update: blockStyleUpdate<Alignment>('textAlign'),
});

export const BaseTextIndentPlugin = definePlugin(PLUGINS.textIndent, {
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
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        decode: ({ element, pluginState, preserve }) => {
          const { offset, unit } = pluginState;
          const dataValue = element.dataset.textIndent;

          if (dataValue) {
            const value = Number(dataValue);

            preserve('data-text-indent');

            return Number.isFinite(value) && value !== 0 ? value : undefined;
          }

          const styleValue = element.style.textIndent;

          if (!styleValue || !offset || (unit && !styleValue.endsWith(unit))) {
            return undefined;
          }

          const numericValue = unit
            ? styleValue.slice(0, -unit.length)
            : styleValue;
          const value = Number(numericValue) / offset;

          return Number.isFinite(value) && value !== 0 ? value : undefined;
        },
        encode: ({ pluginState, value }) => {
          const { offset, unit } = pluginState;

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
  update: blockStyleUpdate<number>('textIndent'),
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
