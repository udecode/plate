import {
  type BaseEditor,
  BaseParagraphPlugin,
  createBasePlugin,
} from '@platejs/core';
import { type Element, type Path, ElementApi, PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

const isLiftableBlockquoteChild = (
  editor: BaseEditor,
  node: Element,
  path: Path,
  blockquoteType: string
) => {
  const paragraphType = editor.getType(KEYS.p);

  if (node.type !== paragraphType || node[KEYS.listType]) return false;

  return !!editor.read.nodes.above({
    at: path,
    match: { type: blockquoteType },
  });
};

const shouldLiftOnDeleteStart = (
  editor: BaseEditor,
  node: Element,
  path: Path,
  blockquoteType: string
) => {
  if (!isLiftableBlockquoteChild(editor, node, path, blockquoteType)) {
    return false;
  }

  const isEmptyBlock =
    !!editor.read.selection() && editor.read.nodes.isEmpty(node);

  if (!isEmptyBlock) return true;

  const parent = editor.read.nodes.parent(path);

  if (
    !parent ||
    !ElementApi.isElement(parent[0]) ||
    parent[0].type !== blockquoteType
  ) {
    return true;
  }

  return !PathApi.hasPrevious(path);
};

/** Enables support for block quotes, useful for quotations and passages. */
export const BaseBlockquotePlugin = createBasePlugin({
  key: KEYS.blockquote,
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: { type: plugins.elementType(BaseParagraphPlugin) },
        min: 1,
      }),
    },
  }),
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: 'BLOCKQUOTE',
          },
        ],
      },
    },
  },
  render: { as: 'blockquote' },
  rules: {
    break: {
      empty: 'lift',
    },
    delete: {
      start: 'lift',
    },
    match: ({ editor, node, path, rule }) => {
      if (!['break.empty', 'delete.start'].includes(rule)) return false;
      if (!path) return false;
      if (!ElementApi.isElement(node)) return false;

      const blockquoteType = editor.getType(KEYS.blockquote);

      if (rule === 'delete.start') {
        return shouldLiftOnDeleteStart(editor, node, path, blockquoteType);
      }

      return isLiftableBlockquoteChild(editor, node, path, blockquoteType);
    },
  },
})
  .extendTx(({ editor, type }) => (tx) => ({
    toggle: () => {
      tx.blocks.toggle(type, { wrap: true });
    },
    untab: () => {
      const blocks = tx.nodes
        .toArray<Element>({
          at: tx.selection() ?? undefined,
          match: (node, path) =>
            ElementApi.isElement(node) &&
            !node.indent &&
            isLiftableBlockquoteChild(editor, node, path, type),
          mode: 'lowest',
        })
        .sort(
          (a, b) =>
            b[1].length - a[1].length ||
            b[1].join('.').localeCompare(a[1].join('.'))
        );

      if (blocks.length === 0) return false;

      for (const [, path] of blocks) {
        tx.blocks.lift({
          at: path,
        });
      }

      return true;
    },
  }))
  .extend({
    shortcuts: {
      untab: { keys: 'shift+tab' },
    },
  });
