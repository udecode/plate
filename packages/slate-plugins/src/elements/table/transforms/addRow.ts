import { Editor, Path, Transforms } from 'slate';
import { getAboveByType, hasNodeByType } from '../../../common/queries';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';
import { getEmptyRowNode } from '../utils';

export const addRow = (editor: Editor, options?: TableOptions) => {
  const { table, tr } = setDefaults(options, DEFAULTS_TABLE);

  if (hasNodeByType(editor, table.type)) {
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
