import {
  type BaseEditor,
  type InferConfig,
  createBasePlugin,
  getInjectMatch,
} from '@platejs/core';
import {
  type EditorNodesOptions,
  type Element,
  type NodeMatchPredicate,
  type Path,
  ElementApi,
  property,
  target,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export type IndentChangeOptions = {
  nodes?: Omit<EditorNodesOptions<Element>, 'match'> & {
    match?: NodeMatchPredicate<Element>;
  };
  offset?: number;
  setNodeProps?: ({ indent }: { indent: number }) => Record<string, unknown>;
  unsetNodeProps?: string[];
};

export type IndentPluginOptions = {
  /** Maximum number of indentation. */
  indentMax?: number;
  /**
   * Indentation offset used in `(offset * element.indent) + unit`.
   *
   * @default 40
   */
  offset?: number;
  /**
   * Indentation unit used in `(offset * element.indent) + unit`.
   *
   * @default 'px'
   */
  unit?: string;
};

const defaultOptions: IndentPluginOptions = {
  offset: 24,
  unit: 'px',
};
const defaultTargetPluginKeys: readonly string[] = [KEYS.p];

const isInsideBlockquote = (editor: BaseEditor, path: Path) =>
  !!editor.read.nodes.above({
    at: path,
    match: (node, nodePath) =>
      nodePath.length < path.length &&
      ElementApi.isElement(node) &&
      node.type === editor.getType(KEYS.blockquote),
  });

const parseIndent = (
  element: Readonly<HTMLElement>,
  offset: number,
  unit: string
) => {
  const dataValue =
    element.dataset.indent ?? element.getAttribute('aria-level');

  if (dataValue) {
    const value = Number(dataValue);

    return Number.isFinite(value) && value > 0 ? value : undefined;
  }
  const styleValue = element.style.marginLeft;

  if (!styleValue || !offset || (unit && !styleValue.endsWith(unit))) return;

  const numericValue = unit ? styleValue.slice(0, -unit.length) : styleValue;
  const value = Number(numericValue) / offset;

  return Number.isFinite(value) && value > 0 ? value : undefined;
};

export const BaseIndentPlugin = createBasePlugin({
  key: KEYS.indent,
  inject: {
    isBlock: true,
    nodeProps: {
      styleKey: 'marginLeft',
      transformNodeValue: ({ getOptions, nodeValue }) => {
        const { offset = 24, unit = 'px' } = getOptions();

        return Number(nodeValue) * offset + unit;
      },
    },
  },
  options: defaultOptions,
  schema: ({ own, plugins, targetPluginKeys }) => ({
    properties: [
      own.elementProperty(property.number(), {
        target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
        typeChange: 'preserve-if-allowed',
      }),
    ],
  }),
  targetPluginKeys: defaultTargetPluginKeys,
})
  .extendHtmlCodec(({ getOptions }) => ({
    decode: ({ element }) => {
      const { offset = 24, unit = 'px' } = getOptions();

      return parseIndent(element, offset, unit);
    },
    encode: ({ value }) => {
      const { offset = 24, unit = 'px' } = getOptions();

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
  }))
  .extendTx(({ editor, plugin, type }) => (tx) => {
    const set = ({
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
        const currentIndent = Number(node[type] ?? 0);
        const nextIndent = currentIndent + offset;
        const props = setNodeProps?.({ indent: nextIndent }) ?? {};

        if (nextIndent <= 0) {
          tx.nodes.unset([type, ...unsetNodeProps], { at: path });
          continue;
        }

        tx.nodes.set({ [type]: nextIndent, ...props }, { at: path });
      }
    };

    const increase = (options?: Omit<IndentChangeOptions, 'offset'>) => {
      set({ ...options, offset: 1 });
    };

    const decrease = (options?: Omit<IndentChangeOptions, 'offset'>) => {
      set({ ...options, offset: -1 });
    };

    return {
      decrease,
      increase,
      set,
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

        if (!element[type]) {
          return !isInsideBlockquote(editor, path);
        }

        decrease();

        return true;
      },
    };
  })
  .extend({
    shortcuts: {
      tab: { keys: 'tab' },
      untab: { keys: 'shift+tab' },
    },
  })
  .extendExtension(({ getOptions, type }) => ({
    corrections: [
      {
        event: 'properties',
        correct({ entry, tx }) {
          const [node, path] = entry;

          if (!ElementApi.isElement(node)) {
            return;
          }

          const { indentMax } = getOptions();
          const indent = node[type];
          if (
            typeof indentMax === 'number' &&
            typeof indent === 'number' &&
            indent > indentMax
          ) {
            tx.nodes.set({ [type]: indentMax }, { at: path });
          }
        },
      },
    ],
  }));

export type IndentConfig = InferConfig<typeof BaseIndentPlugin>;
