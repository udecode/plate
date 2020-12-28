import {
  getAboveByType,
  isNodeTypeIn,
  setDefaults,
} from '@udecode/slate-plugins-common';
import { Editor, Path, Transforms } from 'slate';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';
import { getEmptyRowNode } from '../utils';

export const addRow = (editor: Editor, options?: TableOptions) => {
  const { table, tr } = setDefaults(options, DEFAULTS_TABLE);

  if (isNodeTypeIn(editor, table.type)) {
    const currentRowItem = getAboveByType(editor, tr.type);
    if (currentRowItem) {
      const [currentRowElem, currentRowPath] = currentRowItem;
      Transforms.insertNodes(
        editor,
        getEmptyRowNode(currentRowElem.children.length, options),
        {
          at: Path.next(currentRowPath),
          select: true,
        }
      );
    }
  }
};
