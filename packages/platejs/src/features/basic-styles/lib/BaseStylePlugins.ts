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
  type PluginFormatRegistry,
  type PluginTransaction,
  txLocate,
  locateAt,
} from '../../../core';
import type { AnyBasePlugin } from '../../../lib/plugin/BasePlugin';

const lineHeightRegex =
  /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:e([+-]?\d+))?(%|em)?$/i;

const isLineHeight = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const parseLineHeight = (text: string) => {
  const match = lineHeightRegex.exec(text.trim());

  if (!match) return undefined;

  const [, digits, exponent = '0', unit] = match;
  const value = Number(
    `${digits}e${Number(exponent) - (unit === '%' ? 2 : 0)}`
  );

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

// Google Docs writes its default text style on every run it copies, and each run
// is a span that carries its whole style. So inside a Docs paste, a value equal
// to that default is not one the author picked, and only a span styles text.
const docsPastes = new WeakMap<Document, boolean>();

const markDocsPaste = ({ document }: { document: Document }) => {
  docsPastes.set(
    document,
    document.body.querySelector('[id^="docs-internal-guid"]') !== null
  );
};

const isDocsDefault = (value: string, docsDefaults: readonly string[]) =>
  docsDefaults.includes(value.replaceAll(/["'\s]/g, '').toLowerCase());

const hasBackground = (element: HTMLElement | null) =>
  !!element?.style.backgroundColor &&
  !isDocsDefault(element.style.backgroundColor, ['transparent']);

const decodeTextStyle = (
  element: HTMLElement,
  key: 'backgroundColor' | 'color' | 'fontFamily' | 'fontSize',
  docsDefaults: readonly string[]
) => {
  const value = element.style[key];

  if (!value || docsPastes.get(element.ownerDocument) !== true) {
    return value || undefined;
  }
  if (element.tagName !== 'SPAN') return undefined;

  return isDocsDefault(value, docsDefaults) ? undefined : value;
};

const decodeTextColor = (
  element: HTMLElement,
  registry: Pick<PluginFormatRegistry, 'has'>
) => {
  const onBackground =
    (registry.has(PLUGINS.backgroundColor) && hasBackground(element)) ||
    (registry.has(PLUGINS.tableCell) &&
      hasBackground(element.closest('td, th')));

  return decodeTextStyle(
    element,
    'color',
    onBackground ? [] : ['#000000', 'rgb(0,0,0)']
  );
};

export const BaseFontBackgroundColorPlugin = definePlugin(
  PLUGINS.backgroundColor,
  {
    schema: { mark: property.string() },
    formats: ({ defineFormats }) =>
      defineFormats({
        html: {
          prepareDocument: markDocsPaste,
          decode: ({ element }) =>
            decodeTextStyle(element, 'backgroundColor', ['transparent']),
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
        prepareDocument: markDocsPaste,
        decode: ({ element, registry }) => decodeTextColor(element, registry),
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
        prepareDocument: markDocsPaste,
        decode: ({ element }) =>
          decodeTextStyle(element, 'fontFamily', ['arial', 'arial,sans-serif']),
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
        prepareDocument: markDocsPaste,
        decode: ({ element }) => decodeTextStyle(element, 'fontSize', ['11pt']),
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
