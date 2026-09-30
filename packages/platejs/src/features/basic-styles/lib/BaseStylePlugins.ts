import {
  BaseParagraphPlugin,
  definePlugin,
  getInjectMatch,
  PLUGINS,
  property,
  schema,
  target,
  type DefinitionOf,
  type Element,
  type NodeSetNodesOptions,
} from '../../../core';
import { failInvariant } from '../internal/failInvariant';

const digitRegex = /\d+/;

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
      defaultNodeValue: 'black',
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
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        decode: ({ element }) => {
          if (!element.style.lineHeight) return undefined;

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
      const { defaultNodeValue } =
        editor.plugin(plugin).inject.nodeProps ??
        failInvariant('Expected value to be defined');
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
              textAlign: [...ALIGNMENTS],
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
      validNodeValues: ALIGNMENTS,
    },
  },
  update: ({ editor, plugin, tx }) => ({
    set: (value: Alignment, options?: NodeSetNodesOptions<Element>) => {
      const { defaultNodeValue } =
        editor.plugin(plugin).inject.nodeProps ??
        failInvariant('Expected value to be defined');
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
