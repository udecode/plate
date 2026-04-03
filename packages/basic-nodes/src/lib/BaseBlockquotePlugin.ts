import {
  type Descendant,
  ElementApi,
  PathApi,
  createSlatePlugin,
  KEYS,
} from 'platejs';

const normalizeBlockquoteChildren = (
  editor: any,
  children: Descendant[] = []
) => {
  const paragraphType = editor.getType(KEYS.p);
  const elements: Descendant[] = [];
  let inlineNodes: Descendant[] = [];

  const flushInlineNodes = () => {
    if (inlineNodes.length === 0) return;

    elements.push({
      children: inlineNodes as any,
      type: paragraphType,
    } as any);
    inlineNodes = [];
  };

  children.forEach((child) => {
    const isBlock =
      ElementApi.isElement(child) &&
      !editor.api.isInline(child) &&
      editor.api.isBlock(child);

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
  editor: any,
  node: any,
  path: number[],
  blockquoteType: string
) => {
  const paragraphType = editor.getType(KEYS.p);

  if (node.type !== paragraphType || node[KEYS.listType]) return false;

  return !!editor.api.above({
    at: path,
    match: (entryNode: any, entryPath: number[]) =>
      entryPath.length < path.length && entryNode.type === blockquoteType,
  });
};

const shouldLiftOnDeleteStart = (
  editor: any,
  node: any,
  path: number[],
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
})
  .extendTransforms(({ editor, type }) => ({
    toggle: () => {
      editor.tf.toggleBlock(type, { wrap: true });
    },
  }))
  .overrideEditor(({ editor, tf: { normalizeNode, tab }, type }) => ({
    transforms: {
      normalizeNode([node, path]) {
        if (ElementApi.isElement(node) && node.type === type) {
          const nextChildren = normalizeBlockquoteChildren(
            editor,
            node.children as Descendant[]
          );
          const shouldNormalizeChildren =
            nextChildren.length !== node.children.length ||
            nextChildren.some((child, index) => child !== node.children[index]);

          if (shouldNormalizeChildren) {
            editor.tf.replaceNodes(nextChildren as any, {
              at: path,
              children: true,
            });
            return;
          }
        }

        normalizeNode([node, path]);
      },
      tab(options) {
        if (options.reverse) {
          const liftableBlocks = editor.api.blocks({
            mode: 'lowest',
            match: (node, path) =>
              !(node as any).indent &&
              isLiftableBlockquoteChild(editor, node, path as number[], type),
          });

          if (liftableBlocks.length > 0) {
            const blocks = [...liftableBlocks].sort(
              (a, b) =>
                b[1].length - a[1].length ||
                b[1].join('.').localeCompare(a[1].join('.'))
            );

            editor.tf.withoutNormalizing(() => {
              for (const [, path] of blocks) {
                editor.tf.liftBlock({
                  at: path,
                  match: { type },
                });
              }
            });

            return true;
          }
        }

        return tab(options);
      },
    },
  }));
