import { TextApi, removeEditorText, replaceNode } from '@udecode/plate-common';
import { toPlatePlugin } from '@udecode/plate-common/react';
import { Path } from 'slate';

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
      removeEditorText(editor, {
        match: (_, p) =>
          editor.api.some({
            match: { type },
          }) ||
          !editor.api.some({
            match: (t, textPath) => {
              return TextApi.isText(t) && Path.equals(textPath, p);
            },
          }),
      });
    };

    editor.normalizeNode = ([node, path]) => {
      // Duplicate tag removal
      if (
        node.type === type &&
        editor.api.some({
          at: [],
          match: (n, p) =>
            n.type === type && n.value === node.value && !Path.equals(p, path),
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
          replaceNode(editor, {
            at: path,
            insertOptions: {
              select: true,
            },
            nodes: { text: trimmedText },
          });

          return;
        }
      }

      normalizeNode([node, path]);
    };

    return editor;
  },
});
