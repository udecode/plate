import { Editor, Path, Transforms } from 'slate';
import { isNodeTypeIn } from '../../../common/queries';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { isTableRow } from '../queries';
import { TableOptions } from '../types';
import { getEmptyRowNode } from '../utils';

export const addRow = (editor: Editor, options?: TableOptions) => {
  const { table } = setDefaults(options, DEFAULTS_TABLE);

  if (isNodeTypeIn(editor, table.type)) {
    const currentRowItem = Editor.above(editor, {
      match: isTableRow(options),
    });
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
