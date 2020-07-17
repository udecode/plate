import { Editor, Transforms } from 'slate';
import { isNodeTypeIn } from '../../../common/queries';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { isTable } from '../queries';
import { TableOptions } from '../types';

export const deleteTable = (editor: Editor, options?: TableOptions) => {
  const { table } = setDefaults(options, DEFAULTS_TABLE);

  if (isNodeTypeIn(editor, table.type)) {
    const tableItem = Editor.above(editor, {
      match: isTable(options),
    });
    if (tableItem) {
      Transforms.removeNodes(editor, {
        at: tableItem[1],
      });
    }
  }
};
