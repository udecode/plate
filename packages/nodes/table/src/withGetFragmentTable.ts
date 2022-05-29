import { getPluginType, PlateEditor, Value } from '@udecode/plate-core';
import { getTableGridAbove } from './queries/getTableGridAbove';
import { ELEMENT_TABLE } from './createTablePlugin';

/**
 * If selection is in a table, get subtable above.
 */
export const withGetFragmentTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const { getFragment } = editor;

  editor.getFragment = (): any[] => {
    let fragment = getFragment();

    fragment = fragment.map((node) => {
      if (node.type === getPluginType(editor, ELEMENT_TABLE)) {
        const subTable = getTableGridAbove(editor);
        if (subTable.length) {
          return subTable[0][0];
        }
      }

      return node;
    });

    return fragment;
  };

  return editor;
};
