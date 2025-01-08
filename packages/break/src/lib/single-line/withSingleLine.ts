import type { ExtendEditorTransforms } from '@udecode/plate';

export const withSingleLine: ExtendEditorTransforms = ({
  editor,
  tf: { normalizeNode },
}) => ({
  insertBreak() {
    return null;
  },

  normalizeNode(entry) {
    if (entry[1].length === 0 && editor.children.length > 1) {
      editor.tf.removeNodes({
        at: [],
        match: (node, path) => path.length === 1 && path[0] > 0,
        mode: 'highest',
      });

      return;
    }

    normalizeNode(entry);
  },
});
