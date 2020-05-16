import { isNodeInSelection } from 'common/queries';
import { Editor, Path, Transforms } from 'slate';
import { isTableRow } from '../queries';
import { defaultTableTypes, emptyRow } from '../types';

export const addRow = (editor: Editor, options = defaultTableTypes) => {
  if (isNodeInSelection(editor, options.typeTable)) {
    const currentRowItem = Editor.above(editor, {
      match: isTableRow(options),
    });
    if (currentRowItem) {
      const [currentRowElem, currentRowPath] = currentRowItem;
      Transforms.insertNodes(
        editor,
        emptyRow(currentRowElem.children.length, options),
        {
          at: Path.next(currentRowPath),
          select: true,
        }
      );
    }
  }
};
