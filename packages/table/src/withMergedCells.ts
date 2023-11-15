import {
  getBlockAbove,
  getPluginType,
  PlateEditor,
  TElement,
  Value,
} from '@udecode/plate-common';
import { BaseSelection } from 'slate';

import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from './createTablePlugin';
import { computeAllCellIndices } from './merge/computeCellIndices';
import { TTableElement } from './types';

export const withMergedCells = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
) => {
  const { apply } = editor;

  editor.apply = (op) => {
    const needsSync =
      op.type === 'insert_node' ||
      op.type === 'merge_node' ||
      op.type === 'move_node' ||
      op.type === 'remove_node' ||
      op.type === 'set_node';

    const updateTable = (selection: BaseSelection) => {
      const tableEntry = getBlockAbove(editor, {
        at: selection?.anchor,
        match: { type: getPluginType(editor, ELEMENT_TABLE) },
      });
      if (tableEntry) {
        const realTable = tableEntry[0] as TTableElement;
        computeAllCellIndices(editor, realTable);
      }
    };

    if (needsSync) {
      updateTable(editor.selection);
    }

    apply(op);
  };

  return editor;
};
