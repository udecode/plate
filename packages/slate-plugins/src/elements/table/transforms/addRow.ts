import { isNodeInSelection } from 'common/queries';
import { getEmptyRowNode } from 'elements/table/utils/getEmptyRowNode';
import { Editor, Path, Transforms } from 'slate';
import { isTableRow } from '../queries';
import { defaultTableTypes } from '../types';

export const addRow = (editor: Editor, options = defaultTableTypes) => {
  if (isNodeInSelection(editor, options.typeTable)) {
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
