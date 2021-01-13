import { Editor, Transforms } from 'slate';
import { someNode } from '../../../common/queries/someNode';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';
import { getEmptyTableNode } from '../utils';

export const insertTable = (editor: Editor, options?: TableOptions) => {
  const { table } = setDefaults(options, DEFAULTS_TABLE);

  if (!someNode(editor, { match: { type: table.type } })) {
    Transforms.insertNodes(editor, getEmptyTableNode(options));
  }
};
