import { PathApi, TextApi } from '@udecode/plate';
import { toPlatePlugin } from '@udecode/plate/react';

import { BaseTagPlugin } from '../lib';

export const TagPlugin = toPlatePlugin(BaseTagPlugin);

export const MultiSelectPlugin = TagPlugin.extend({
  extendEditor: ({ editor, type }) => {
    const { deleteBackward, normalizeNode, onChange } = editor;

    editor.deleteBackward = (unit) => {
      deleteBackward(unit);

      if (
        editor.api.some({
          match: (n) => n.type === type,
        })
      ) {
        editor.tf.move();
      }
    };

    editor.onChange = (op) => {
      onChange(op);

      // Remove text not in selection or if selection contains an tag
      editor.tf.removeNodes({
        at: [],
        empty: true,
        match: (_, p) =>
          editor.api.some({
            match: { type },
          }) ||
          !editor.api.some({
            match: (t, textPath) => {
              return TextApi.isText(t) && PathApi.equals(textPath, p);
            },
          }),
        text: true,
      });
    };

    editor.normalizeNode = ([node, path]) => {
      // Duplicate tag removal
      if (
        node.type === type &&
        editor.api.some({
          at: [],
          match: (n, p) =>
            n.type === type &&
            n.value === node.value &&
            !PathApi.equals(p, path),
        })
      ) {
        editor.tf.removeNodes({
          at: path,
        });

        return;
      }
      // Trim leading whitespace
      if (TextApi.isText(node) && node.text) {
        const trimmedText = node.text.trimStart();

        if (trimmedText !== node.text) {
          editor.tf.replaceNodes(
            { text: trimmedText },
            {
              at: path,
              select: true,
            }
          );

          return;
        }
      }

      normalizeNode([node, path]);
    };

    return editor;
  },
});
