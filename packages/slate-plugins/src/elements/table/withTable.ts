import { Editor, Point } from 'slate';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { TableType, WithTableOptions } from './types';

export const withTable = ({
  typeTd = TableType.CELL,
}: WithTableOptions = {}) => <T extends Editor>(editor: T) => {
  const { deleteBackward, deleteForward } = editor;

  const preventDeleteCell = (operation: any, pointCallback: any) => (
    unit: any
  ) => {
    const { selection } = editor;

    if (isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: (n) => n.type === typeTd,
      });

      if (cell) {
        const [, cellPath] = cell;
        const start = pointCallback(editor, cellPath);

        if (selection && Point.equals(selection.anchor, start)) {
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

  return editor;
};
