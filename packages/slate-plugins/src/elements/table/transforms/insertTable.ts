import { isBlockActive } from 'elements/queries';
import { Editor, Transforms } from 'slate';
import { TableType } from '../types';

const emptyCell = () => ({
  type: TableType.CELL,
  children: [{ text: '' }],
});

const emptyRow = () => ({
  type: TableType.ROW,
  children: [emptyCell(), emptyCell()],
});

const emptyTable = () => ({
  type: TableType.TABLE,
  children: [emptyRow(), emptyRow()],
});

export const insertTable = (editor: Editor) => {
  const isActive = isBlockActive(editor, TableType.TABLE);

  if (!isActive) {
    Transforms.insertNodes(editor, emptyTable());
  }
};
