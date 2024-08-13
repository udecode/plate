import {
  type PlateEditor,
  type Value,
  removeNodes,
} from '@udecode/plate-common/server';

export const withSingleLine = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
) => {
  const { normalizeNode } = editor;

  editor.insertBreak = () => null;

  editor.normalizeNode = (entry) => {
    if (entry[1].length === 0 && editor.children.length > 1) {
      removeNodes(editor, {
        at: [],
        match: (node, path) => path.length === 1 && path[0] > 0,
        mode: 'highest',
      });

      return;
    }

    normalizeNode(entry);
  };

  return editor;
};
