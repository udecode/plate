import { Editor, Point, Range } from 'slate';
import { TableType, WithTableOptions } from './types';

export const withTable = ({
  typeTable = TableType.TABLE,
  typeTd = TableType.CELL,
}: WithTableOptions = {}) => <T extends Editor>(editor: T) => {
  const { deleteBackward, deleteForward, insertBreak } = editor;

  const preventDeleteCell = (operation: any, pointCallback: any) => (
    unit: any
  ) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: (n) => n.type === typeTd,
      });

      if (cell) {
        const [, cellPath] = cell;
        const start = pointCallback(editor, cellPath);

        if (Point.equals(selection.anchor, start)) {
          return;
        }
      }
    }

    operation(unit);
  };

  // prevent deleting cells with deleteBackward
  editor.deleteBackward = preventDeleteCell(deleteBackward, Editor.start);

  // prevent deleting cells with deleteForward
  editor.deleteForward = preventDeleteCell(deleteForward, Editor.end);

  editor.insertBreak = () => {
    const { selection } = editor;

    if (selection) {
      const [table] = Editor.nodes(editor, {
        match: (n) => n.type === typeTable,
      });

      if (table) return;
    }

    insertBreak();
  };

  return editor;
};
