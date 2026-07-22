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

export const BaseIndentPlugin = createBasePlugin({
  key: KEYS.indent,
  inject: {
    isBlock: true,
    nodeProps: {
      nodeKey: 'indent',
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
  shortcuts: {
    tab: { keys: 'tab' },
    untab: { keys: 'shift+tab' },
  },
  targetPluginKeys: defaultTargetPluginKeys,
})
  .extendTx(({ editor, plugin }) => (tx) => {
    const set = ({
      nodes,
      offset = 1,
      setNodeProps,
      unsetNodeProps = [],
    }: IndentChangeOptions = {}) => {
      const { nodeKey = KEYS.indent } = editor.getInjectProps(plugin);
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
        const currentIndent = Number(node[nodeKey] ?? 0);
        const nextIndent = currentIndent + offset;
        const props = setNodeProps?.({ indent: nextIndent }) ?? {};

        if (nextIndent <= 0) {
          tx.nodes.unset([nodeKey, ...unsetNodeProps], { at: path });
          continue;
        }

        tx.nodes.set({ [nodeKey]: nextIndent, ...props }, { at: path });
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

        if (!element[KEYS.indent]) {
          return !isInsideBlockquote(editor, path);
        }

        decrease();

        return true;
      },
    };
  })
  .extendExtension(({ editor, getOptions, plugin }) => ({
    corrections: [
      {
        event: 'properties',
        correct({ entry, tx }) {
          const [node, path] = entry;

          if (!ElementApi.isElement(node)) {
            return;
          }

          const { indentMax } = getOptions();
          const { nodeKey = KEYS.indent } = editor.getInjectProps(plugin);
          const indent = node[nodeKey];
          if (
            typeof indentMax === 'number' &&
            typeof indent === 'number' &&
            indent > indentMax
          ) {
            tx.nodes.set({ [nodeKey]: indentMax }, { at: path });
          }
        },
      },
    ],
  }));

export type IndentConfig = InferConfig<typeof BaseIndentPlugin>;
