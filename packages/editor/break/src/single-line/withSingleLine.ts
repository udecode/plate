import { PlateEditor, removeNodes, Value } from '@udecode/plate-common';

export const withSingleLine = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const { normalizeNode } = editor;

  editor.insertBreak = () => null;

  editor.normalizeNode = (entry) => {
    if (editor.children.length > 1) {
      removeNodes(editor, {
        at: [],
        mode: 'highest',
        match: (node, path) => path[0] > 0,
      });
    }
    normalizeNode(entry);
  };

  return editor;
};
