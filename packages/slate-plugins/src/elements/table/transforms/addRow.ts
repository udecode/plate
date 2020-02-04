import { Editor, Path, Transforms } from 'slate';
import { isSelectionInTable, isTableRow } from '../queries';
import { emptyRow } from '../types';

export const addRow = (editor: Editor) => {
  if (isSelectionInTable(editor)) {
    const currentRowItem = Editor.above(editor, {
      match: isTableRow,
    });
    if (currentRowItem) {
      const [currentRowElem, currentRowPath] = currentRowItem;
      Transforms.insertNodes(editor, emptyRow(currentRowElem.children.length), {
        at: Path.next(currentRowPath),
        select: true,
      });
    }
  }
};
