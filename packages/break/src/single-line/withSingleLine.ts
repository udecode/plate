import { PlateEditor, Value, removeNodes } from '@udecode/plate-common';

export const withSingleLine = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const { normalizeNode } = editor;

  editor.insertBreak = () => null;

  editor.normalizeNode = (entry) => {
    if (entry[1].length === 0 && editor.children.length > 1) {
      removeNodes(editor, {
        at: [],
        mode: 'highest',
        match: (node, path) => path.length === 1 && path[0] > 0,
      });
    }
    normalizeNode(entry);
  };

  return editor;
};
