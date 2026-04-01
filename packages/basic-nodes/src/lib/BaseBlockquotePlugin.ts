import { type Descendant, ElementApi, createSlatePlugin, KEYS } from 'platejs';

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
    delete: {
      start: 'reset',
    },
  },
})
  .extendTransforms(({ editor, type }) => ({
    toggle: () => {
      editor.tf.toggleBlock(type, { wrap: true });
    },
  }))
  .overrideEditor(({ editor, tf: { normalizeNode }, type }) => ({
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
    },
  }));
