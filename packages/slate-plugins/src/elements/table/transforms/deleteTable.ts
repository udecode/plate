import { Editor, Transforms } from 'slate';
import { getAbove } from '../../../common/queries';
import { someNode } from '../../../common/queries/someNode';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';

export const deleteTable = (editor: Editor, options?: TableOptions) => {
  const { table } = setDefaults(options, DEFAULTS_TABLE);

  if (someNode(editor, { match: { type: table.type } })) {
    const tableItem = getAbove(editor, { match: { type: table.type } });
    if (tableItem) {
      Transforms.removeNodes(editor, {
        at: tableItem[1],
      });
    }
  }
};
