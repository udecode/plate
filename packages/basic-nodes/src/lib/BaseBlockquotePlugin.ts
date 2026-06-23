import {
  type Path,
  type SlateEditor,
  createSlatePlugin,
  ElementApi,
  PathApi,
  KEYS,
} from 'platejs';
import type { Element } from '@platejs/slate';

const isLiftableBlockquoteChild = (
  editor: SlateEditor,
  node: Element,
  path: Path,
  blockquoteType: string
) => {
  const paragraphType = editor.getType(KEYS.p);

  if (node.type !== paragraphType || node[KEYS.listType]) return false;

  return !!editor.api.above({
    at: path,
    match: (entryNode: Element, entryPath: Path) =>
      entryPath.length < path.length && entryNode.type === blockquoteType,
  });
};

const shouldLiftOnDeleteStart = (
  editor: SlateEditor,
  node: Element,
  path: Path,
  blockquoteType: string
) => {
  if (!isLiftableBlockquoteChild(editor, node, path, blockquoteType)) {
    return false;
  }

  const isEmptyBlock =
    !!editor.selection && editor.api.isEmpty(editor.selection, { block: true });

  if (!isEmptyBlock) return true;

  const parent = editor.api.parent(path);

  if (!parent || parent[0].type !== blockquoteType) return true;

  return !PathApi.hasPrevious(path);
};

/** Enables support for block quotes, useful for quotations and passages. */
export const BaseBlockquotePlugin = createSlatePlugin({
  key: KEYS.blockquote,
  node: {
    isElement: true,
  },
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

      const blockquoteType = editor.getType(KEYS.blockquote);

      if (rule === 'delete.start') {
        return shouldLiftOnDeleteStart(editor, node, path, blockquoteType);
      }

      return isLiftableBlockquoteChild(editor, node, path, blockquoteType);
    },
  },
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    const isActive = tx.nodes.some({
      match: (node) => ElementApi.isElement(node) && node.type === type,
    });

    if (isActive) {
      tx.nodes.unwrap({
        match: (node) => ElementApi.isElement(node) && node.type === type,
      });
      return;
    }

    tx.nodes.wrap({ children: [], type } as Element);
  },
}));
