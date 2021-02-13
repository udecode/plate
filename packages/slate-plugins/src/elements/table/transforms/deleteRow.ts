import { Editor, Transforms } from 'slate';
import { getAbove } from '../../../common/queries';
import { someNode } from '../../../common/queries/someNode';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';

export const deleteRow = (editor: Editor, options?: TableOptions) => {
  const { table, tr } = setDefaults(options, DEFAULTS_TABLE);

  if (someNode(editor, { match: { type: table.type } })) {
    const currentTableItem = getAbove(editor, { match: { type: table.type } });
    const currentRowItem = getAbove(editor, { match: { type: tr.type } });
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
