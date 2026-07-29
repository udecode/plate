import {
  createBasePlugin,
  getInjectMatch,
  type InferConfig,
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

export const BaseFontBackgroundColorPlugin = createBasePlugin({
  key: KEYS.backgroundColor,
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
});

export const BaseFontColorPlugin = createBasePlugin({
  key: KEYS.color,
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

export const BaseFontFamilyPlugin = createBasePlugin({
  key: KEYS.fontFamily,
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

export const BaseFontSizePlugin = createBasePlugin({
  key: KEYS.fontSize,
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

export const BaseFontWeightPlugin = createBasePlugin({
  key: KEYS.fontWeight,
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
export const BaseLineHeightPlugin = createBasePlugin({
  key: KEYS.lineHeight,
  schema: ({ own, plugins, targetPluginKeys }) => ({
    properties: [
      own.elementProperty(
        property.json({
          validate: (value): value is number | string =>
            (typeof value === 'number' && Number.isFinite(value)) ||
            typeof value === 'string',
          validationVersion: 1,
        }),
        {
          target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
          typeChange: 'preserve-if-allowed',
        }
      ),
    ],
  }),
  targetPluginKeys: [KEYS.p],
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
      const { defaultNodeValue } = editor.getInjectProps(plugin);
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
export const BaseTextAlignPlugin = createBasePlugin({
  key: KEYS.textAlign,
  schema: ({ own, plugins, targetPluginKeys }) => ({
    properties: [
      own.elementProperty(property.string(), {
        target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
        typeChange: 'preserve-if-allowed',
      }),
    ],
  }),
  targetPluginKeys: [KEYS.p],
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
      const { defaultNodeValue } = editor.getInjectProps(plugin);
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

export const BaseTextIndentPlugin = createBasePlugin({
  initialState: (): TextIndentPluginState => ({
    offset: 24,
    unit: 'px',
  }),
  key: KEYS.textIndent,
  schema: ({ own, plugins, targetPluginKeys }) => ({
    properties: [
      own.elementProperty(property.number(), {
        target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
        typeChange: 'preserve-if-allowed',
      }),
    ],
  }),
  targetPluginKeys: [KEYS.p],
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
  update: ({ tx, type }) => ({
    set: (value: number, options?: NodeSetNodesOptions<Element>) => {
      tx.nodes.set({ [type]: value }, options);
    },
    unset: (options?: NodeUnsetNodesOptions<Element>) => {
      tx.nodes.unset(type, options);
    },
  }),
});

export type LineHeightConfig = InferConfig<typeof BaseLineHeightPlugin>;
export type TextAlignConfig = InferConfig<typeof BaseTextAlignPlugin>;
export type TextIndentConfig = InferConfig<typeof BaseTextIndentPlugin>;

/** Converts a CSS size to a unitless pixel value. */
export const toUnitLess = (value: string): string => {
  const match = digitRegex.exec(value);

  if (!match) return '0';

  const number = Number(match[0]);

  return value.endsWith('rem') ? String(number * 16) : String(number);
};
