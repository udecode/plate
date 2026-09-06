import { type OverrideEditor, ElementApi } from 'platejs';

export const withEquation: OverrideEditor = ({
  editor,
  tf: { normalizeNode },
  type,
}) => ({
  transforms: {
    normalizeNode(entry) {
      const [node, path] = entry;

      if (
        ElementApi.isElement(node) &&
        node.type === type &&
        typeof node.texExpression !== 'string'
      ) {
        editor.tf.setNodes({ texExpression: '' }, { at: path });

        return;
      }

      return normalizeNode(entry);
    },
  },
});
