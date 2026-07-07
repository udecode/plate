import {
  type BaseEditor,
  type PluginConfig,
  createBasePlugin,
  getInjectMatch,
} from '@platejs/core';
import {
  type EditorNodesOptions,
  type Element,
  type Path,
  ElementApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export type IndentChangeOptions = {
  nodes?: EditorNodesOptions<Element>;
  offset?: number;
  setNodeProps?: ({ indent }: { indent: number }) => Record<string, unknown>;
  unsetNodeProps?: string[];
};

export type IndentConfig = PluginConfig<
  'indent',
  {
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
  }
>;

const isInsideBlockquote = (editor: BaseEditor, path: Path) =>
  !!editor.read.nodes.above({
    at: path,
    match: (node, nodePath) =>
      nodePath.length < path.length &&
      ElementApi.isElement(node) &&
      node.type === editor.getType(KEYS.blockquote),
  });

export const BaseIndentPlugin = createBasePlugin<IndentConfig>({
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
    targetPlugins: [KEYS.p],
  },
  options: {
    offset: 24,
    unit: 'px',
  },
  shortcuts: {
    tab: { keys: 'tab' },
    untab: { keys: 'shift+tab' },
  },
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

      tx.withoutNormalizing(() => {
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
      });
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
    normalizers: {
      node({ entry, next, tx }) {
        const [node, path] = entry;

        if (!ElementApi.isElement(node)) {
          next();
          return;
        }

        const { indentMax } = getOptions();
        const { nodeKey = KEYS.indent } = editor.getInjectProps(plugin);
        const indent = node[nodeKey];
        const match = getInjectMatch(editor, plugin);

        if (match(node, path)) {
          if (
            typeof indentMax === 'number' &&
            typeof indent === 'number' &&
            indent > indentMax
          ) {
            tx.nodes.set({ [nodeKey]: indentMax }, { at: path });
            return;
          }

          next();
          return;
        }

        if (indent) {
          tx.nodes.unset(nodeKey, { at: path });
          return;
        }

        next();
      },
    },
  }));
