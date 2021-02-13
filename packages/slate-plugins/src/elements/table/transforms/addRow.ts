import { Editor, Path, Transforms } from 'slate';
import { getAbove } from '../../../common/queries';
import { someNode } from '../../../common/queries/someNode';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';
import { getEmptyRowNode } from '../utils';

export const addRow = (editor: Editor, options?: TableOptions) => {
  const { table, tr } = setDefaults(options, DEFAULTS_TABLE);

  if (someNode(editor, { match: { type: table.type } })) {
    const currentRowItem = getAbove(editor, { match: { type: tr.type } });
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
