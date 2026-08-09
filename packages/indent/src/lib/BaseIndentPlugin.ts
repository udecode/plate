import {
  BaseParagraphPlugin,
  type DefinitionOf,
  defineBasePlugin,
  getInjectMatch,
} from '@platejs/core';
import {
  type EditorNodesOptions,
  type Element,
  type NodeMatchPredicate,
  ElementApi,
  property,
  schema,
  target,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

export type IndentChangeOptions = {
  nodes?: Omit<EditorNodesOptions<Element>, 'match'> & {
    match?: NodeMatchPredicate<Element>;
  };
  offset?: number;
  setNodeProps?: ({ indent }: { indent: number }) => Record<string, unknown>;
  unsetNodeProps?: string[];
};

export type IndentPluginState = {
  /** Maximum number of indentation. */
  indentMax?: number;
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
  offset: 24,
  unit: 'px',
};

export const BaseIndentPlugin = defineBasePlugin(PLUGINS.indent, {
  initialState,
  schema: ({ targetElementTypes }) => ({
    properties: {
      indent: schema.elementProperty(property.number(), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
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
  update: ({ editor, plugin, tx }) => {
    const change = ({
      nodes,
      offset = 1,
      setNodeProps,
      unsetNodeProps = [],
    }: IndentChangeOptions = {}) => {
      const { match, mode = 'lowest', ...nodeOptions } = nodes ?? {};
      const entries = tx.nodes.toArray<Element>({
        ...nodeOptions,
        mode,
        match: (node, path) =>
          ElementApi.isElement(node) &&
          tx.nodes.isBlock(node) &&
          (!match || match(node, path)),
      });

      for (const [node, path] of entries) {
        const currentIndent = Number(node.indent ?? 0);
        const nextIndent = currentIndent + offset;
        const props = setNodeProps?.({ indent: nextIndent }) ?? {};

        if (nextIndent <= 0) {
          tx.nodes.unset(['indent', ...unsetNodeProps], { at: path });
          continue;
        }

        tx.nodes.set({ indent: nextIndent, ...props }, { at: path });
      }
    };

    const increase = (options?: Omit<IndentChangeOptions, 'offset'>) => {
      change({ ...options, offset: 1 });
    };

    const decrease = (options?: Omit<IndentChangeOptions, 'offset'>) => {
      change({ ...options, offset: -1 });
    };

    return {
      change,
      decrease,
      increase,
      tab: () => {
        const match = getInjectMatch(editor, plugin);
        const entry = tx.nodes.block();

        if (!entry) return false;

        const [element, path] = entry;

        if (!match(element, path)) return false;

        increase();

        return true;
      },
      untab: () => {
        const match = getInjectMatch(editor, plugin);
        const entry = tx.nodes.block();

        if (!entry) return false;

        const [element, path] = entry;

        if (!match(element, path)) return false;

        if (!element.indent) {
          const blockquote = editor.plugin(PLUGINS.blockquote);

          if (!blockquote.installed) return true;

          return !tx.nodes.above({
            at: path,
            match: (node, nodePath) =>
              nodePath.length < path.length &&
              ElementApi.isElement(node) &&
              node.type === blockquote.schema.type,
          });
        }

        decrease();

        return true;
      },
    };
  },
  codecs: ({ defineCodecs, store }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => {
          const { offset = 24, unit = 'px' } = store.get();
          const dataValue =
            element.dataset.indent ?? element.getAttribute('aria-level');

          if (dataValue) {
            const value = Number(dataValue);

            return Number.isFinite(value) && value > 0 ? value : undefined;
          }
          const styleValue = element.style.marginLeft;

          if (!styleValue || !offset || (unit && !styleValue.endsWith(unit))) {
            return;
          }
          const numericValue = unit
            ? styleValue.slice(0, -unit.length)
            : styleValue;
          const value = Number(numericValue) / offset;

          return Number.isFinite(value) && value > 0 ? value : undefined;
        },
        encode: ({ value }) => {
          const { offset = 24, unit = 'px' } = store.get();

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
  shortcuts: {
    tab: { keys: 'tab' },
    untab: { keys: 'shift+tab' },
  },
}).extend({
  corrections: [
    {
      event: 'properties',
      correct({ editor, entry, tx }) {
        const [node, path] = entry;

        if (!ElementApi.isElement(node)) return;

        const { indentMax } = editor.plugin(BaseIndentPlugin).store.get();
        const indent = node.indent;

        if (
          typeof indentMax === 'number' &&
          typeof indent === 'number' &&
          indent > indentMax
        ) {
          tx.nodes.set('indent', indentMax, { at: path });
        }
      },
    },
  ],
});

export type IndentDefinition = DefinitionOf<typeof BaseIndentPlugin>;
