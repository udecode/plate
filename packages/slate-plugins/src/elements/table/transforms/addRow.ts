import { Editor, Path, Transforms } from 'slate';
import { isNodeTypeIn } from '../../../common/queries';
import { isTableRow } from '../queries';
import { defaultTableTypes } from '../types';
import { getEmptyRowNode } from '../utils';

export const addRow = (editor: Editor, options = defaultTableTypes) => {
  if (isNodeTypeIn(editor, options.typeTable)) {
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
