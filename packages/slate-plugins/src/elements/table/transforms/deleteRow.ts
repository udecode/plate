import { Editor, Transforms } from 'slate';
import { isNodeTypeIn } from '../../../common/queries';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { isTable, isTableRow } from '../queries';
import { TableOptions } from '../types';

export const deleteRow = (editor: Editor, options?: TableOptions) => {
  const { table } = setDefaults(options, DEFAULTS_TABLE);

  if (isNodeTypeIn(editor, table.type)) {
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
