import { type BaseEditor, createBasePlugin } from '@platejs/core';
import {
  type Descendant,
  type Element,
  type Path,
  ElementApi,
  PathApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

const normalizeBlockquoteChildren = (
  editor: BaseEditor,
  children: Descendant[] = []
) => {
  const paragraphType = editor.getType(KEYS.p);
  const elements: Descendant[] = [];
  let inlineNodes: Descendant[] = [];

  const flushInlineNodes = () => {
    if (inlineNodes.length === 0) return;

    elements.push({
      children: inlineNodes,
      type: paragraphType,
    } as Descendant);
    inlineNodes = [];
  };

  children.forEach((child) => {
    const isBlock =
      ElementApi.isElement(child) &&
      !editor.read.schema.isInline(child) &&
      editor.read.schema.isBlock(child);

    if (isBlock) {
      flushInlineNodes();
      elements.push(child);
      return;
    }

    inlineNodes.push(child);
  });

  flushInlineNodes();

  if (elements.length > 0) {
    return elements;
  }

  return [
    {
      children: [{ text: '' }],
      type: paragraphType,
    },
  ];
};

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
    match: (entryNode, entryPath) =>
      ElementApi.isElement(entryNode) &&
      entryPath.length < path.length &&
      entryNode.type === blockquoteType,
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
      if (!ElementApi.isElement(node)) return false;

      const blockquoteType = editor.getType(KEYS.blockquote);

      if (rule === 'delete.start') {
        return shouldLiftOnDeleteStart(editor, node, path, blockquoteType);
      }

      return isLiftableBlockquoteChild(editor, node, path, blockquoteType);
    },
  },
  shortcuts: {
    untab: { keys: 'shift+tab' },
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
            !(node as { indent?: unknown }).indent &&
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
  .extendExtension(({ editor, type }) => ({
    normalizers: {
      node({ entry, next, tx }) {
        const [node, path] = entry;

        if (!ElementApi.isElement(node) || node.type !== type) {
          next();
          return;
        }

        const nextChildren = normalizeBlockquoteChildren(
          editor,
          node.children as Descendant[]
        );
        const shouldNormalizeChildren =
          nextChildren.length !== node.children.length ||
          nextChildren.some((child, index) => child !== node.children[index]);

        if (!shouldNormalizeChildren) {
          next();
          return;
        }

        tx.nodes.replaceChildren(nextChildren, {
          at: path,
        });
      },
    },
  }));
