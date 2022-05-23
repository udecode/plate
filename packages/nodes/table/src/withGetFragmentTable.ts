import {
  findNode,
  getPluginType,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { getSubTableAbove } from './queries/getSubTableAbove';
import { ELEMENT_TABLE } from './createTablePlugin';

export const tableFragmentTo = () => {};

export const withGetFragmentTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const { getFragment } = editor;

  editor.getFragment = () => {
    // TODO: fragment with more than table
    // const fragment = getFragment();

    const table = findNode(editor, {
      match: {
        type: getPluginType(editor, ELEMENT_TABLE),
      },
    });

    if (table) {
      return [getSubTableAbove(editor)] as any;
    }

    return getFragment();
  };

  return editor;
};
