import { Editor, Transforms } from 'slate';
import { getAboveByType, hasNodeByType } from '../../../common/queries';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';

export const deleteTable = (editor: Editor, options?: TableOptions) => {
  const { table } = setDefaults(options, DEFAULTS_TABLE);

  if (hasNodeByType(editor, table.type)) {
    const tableItem = getAboveByType(editor, table.type);
    if (tableItem) {
      Transforms.removeNodes(editor, {
        at: tableItem[1],
      });
    }
  }
};
