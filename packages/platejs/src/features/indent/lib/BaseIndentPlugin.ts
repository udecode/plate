import {
  BaseParagraphPlugin,
  definePlugin,
  ElementApi,
  getInjectMatch,
  PLUGINS,
  property,
  schema,
  target,
  type DefinitionOf,
  type EditorNodesOptions,
  type Element,
  type NodeMatchPredicate,
} from '../../../core';
import { getCompiledPlatePlugin } from '../../../internal/plugin/compilePlateModel';

export type IndentChangeOptions = {
  nodes?: Omit<EditorNodesOptions<Element>, 'match'> & {
    match?: NodeMatchPredicate<Element>;
  };
};

export type IndentPluginState = {
  /** Maximum number of indentation. */
  indentMax: number | null;
  /**
   * Indentation offset used in `(offset * element.indent) + unit`.
   *
   * @default 40
   */
  offset: number;
  /**
   * Indentation unit used in `(offset * element.indent) + unit`.
   *
   * @default 'px'
   */
  unit: string;
};

const initialState: IndentPluginState = {
  indentMax: null,
  offset: 24,
  unit: 'px',
};

const isNonNegativeSafeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

export const BaseIndentPlugin = definePlugin(PLUGINS.indent, {
  initialState,
  schema: ({ targetElementTypes }) => ({
    properties: {
      indent: schema.elementProperty(
        property.number({
          validate: isNonNegativeSafeInteger,
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
  inject: {
    isBlock: true,
    nodeProps: {
      styleKey: 'marginLeft',
      transformNodeValue: ({ store, nodeValue }) => {
        const { offset = 24, unit = 'px' } = store.get();

        return Number(nodeValue) * offset + unit;
      },
    },
  },
  update: ({ schema: pluginSchema, tx }) => {
    const change = (offset: number, { nodes }: IndentChangeOptions = {}) => {
      const { match, mode = 'lowest', ...nodeOptions } = nodes ?? {};
      const entries = tx.nodes.blocks({
        ...nodeOptions,
        mode,
        match: (node, path) => !match || match(node, path),
      });

      for (const [node, path] of entries) {
        if (!ElementApi.isElement(node)) continue;

        const currentIndent = Number(
          tx.schema.getProperty(node, pluginSchema.properties.indent) ?? 0
        );
        const nextIndent = currentIndent + offset;

        if (nextIndent <= 0) {
          tx.nodes.unset('indent', { at: path });
          continue;
        }

        tx.nodes.set({ indent: nextIndent }, { at: path });
      }
    };

    return {
      decrease: (options?: IndentChangeOptions) => change(-1, options),
      increase: (options?: IndentChangeOptions) => change(1, options),
    };
  },
  formats: ({ defineFormats }) =>
    defineFormats({
      html: {
        decode: ({ element, pluginState, preserve }) => {
          const { offset = 24, unit = 'px' } = pluginState;
          const dataValue =
            element.dataset.indent ?? element.getAttribute('aria-level');

          if (dataValue) {
            const value = Number(dataValue);

            if (element.dataset.indent !== undefined) preserve('data-indent');

            return Number.isFinite(value) && value > 0 ? value : undefined;
          }
          const styleValue = element.style.marginLeft;

          if (!styleValue || !offset || (unit && !styleValue.endsWith(unit))) {
            return undefined;
          }
          const numericValue = unit
            ? styleValue.slice(0, -unit.length)
            : styleValue;
          const value = Number(numericValue) / offset;

          return Number.isFinite(value) && value > 0 ? value : undefined;
        },
        encode: ({ pluginState, value }) => {
          const { offset = 24, unit = 'px' } = pluginState;

          return {
            attributes: { 'data-indent': value },
            style: { marginLeft: value * offset + unit },
          };
        },
        match: [
          { attributes: { 'aria-level': true } },
          { attributes: { 'data-indent': true } },
          { style: { marginLeft: '*' } },
        ],
      },
    }),
}).extend(({ plugin }) => ({
  shortcuts: {
    tab: {
      handler: ({ editor }) => {
        const entry = editor.read.nodes.block();

        if (!entry || !getInjectMatch(editor, plugin)(...entry)) return false;

        editor.plugin(plugin).update.increase();

        return true;
      },
      keys: 'tab',
    },
    untab: {
      handler: ({ editor }) => {
        const entry = editor.read.nodes.block();

        if (!entry || !getInjectMatch(editor, plugin)(...entry)) return false;

        const [element, path] = entry;

        if (!element.indent) {
          const quote = getCompiledPlatePlugin(editor, PLUGINS.blockquote);
          const inQuote =
            !!quote &&
            !!editor.read.nodes.above({
              at: path,
              match: (node, nodePath) =>
                nodePath.length < path.length &&
                ElementApi.isElement(node) &&
                node.type === editor.plugin(quote).schema.type,
            });

          return !inQuote;
        }

        editor.plugin(plugin).update.decrease();

        return true;
      },
      keys: 'shift+tab',
    },
  },
  corrections: [
    {
      event: 'properties',
      correct({ editor, entry, tx }) {
        const [node, path] = entry;

        if (!ElementApi.isElement(node)) return;

        const { indentMax } = editor.plugin(BaseIndentPlugin).store.get();
        const { indent } = node;

        if (
          typeof indentMax === 'number' &&
          typeof indent === 'number' &&
          indent > indentMax
        ) {
          tx.nodes.set({ indent: indentMax }, { at: path });
        }
      },
    },
  ],
}));

export type IndentDefinition = DefinitionOf<typeof BaseIndentPlugin>;
