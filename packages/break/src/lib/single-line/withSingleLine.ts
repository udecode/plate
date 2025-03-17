import type { OverrideEditor } from '@udecode/plate';

export const withSingleLine: OverrideEditor = ({
  editor,
  tf: { normalizeNode },
}) => ({
  transforms: {
    insertBreak() {
      return null;
    },

    normalizeNode(entry) {
      if (entry[1].length === 0 && editor.children.length > 1) {
        editor.tf.removeNodes({
          at: [],
          mode: 'highest',
          match: (node, path) => path.length === 1 && path[0] > 0,
        });

        return;
      }

      normalizeNode(entry);
    },
  },
});
