import { Editor, Transforms } from 'slate';
import { isNodeInSelection } from '../../../common/queries';
import { isTable, isTableRow } from '../queries';
import { defaultTableTypes } from '../types';

export const deleteRow = (editor: Editor, options = defaultTableTypes) => {
  if (isNodeInSelection(editor, options.typeTable)) {
    const currentTableItem = Editor.above(editor, {
      match: isTable(options),
    });
    const currentRowItem = Editor.above(editor, {
      match: isTableRow(options),
    });
    if (
      currentRowItem &&
      currentTableItem &&
      // Cannot delete the last row
      currentTableItem[0].children.length > 1
    ) {
      Transforms.removeNodes(editor, {
        at: currentRowItem[1],
      });
    }
  }
};
