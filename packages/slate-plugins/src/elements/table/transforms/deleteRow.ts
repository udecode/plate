import {
  getAboveByType,
  isNodeTypeIn,
  setDefaults,
} from '@udecode/slate-plugins-common';
import { Editor, Transforms } from 'slate';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';

export const deleteRow = (editor: Editor, options?: TableOptions) => {
  const { table, tr } = setDefaults(options, DEFAULTS_TABLE);

  if (isNodeTypeIn(editor, table.type)) {
    const currentTableItem = getAboveByType(editor, table.type);
    const currentRowItem = getAboveByType(editor, tr.type);
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
