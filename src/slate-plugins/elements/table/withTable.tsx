import { Editor, Point, Range } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';

export const withTable = (editor: Editor) => {
  const { deleteBackward, deleteForward, insertBreak } = editor;

  editor.deleteBackward = unit => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: n => n.type === ElementType.TABLE_CELL,
      });
      if (cell) {
        const [, cellPath] = cell;
        const start = Editor.start(editor, cellPath);

        if (Point.equals(selection.anchor, start)) {
          return;
        }
      }
    }

    deleteBackward(unit);
  };

  editor.deleteForward = unit => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: n => n.type === ElementType.TABLE_CELL,
      });

      if (cell) {
        const [, cellPath] = cell;
        const end = Editor.end(editor, cellPath);

        if (Point.equals(selection.anchor, end)) {
          return;
        }
      }
    }

    deleteForward(unit);
  };

  editor.insertBreak = () => {
    const { selection } = editor;

    if (selection) {
      const [table] = Editor.nodes(editor, {
        match: n => n.type === ElementType.TABLE,
      });

      if (table) return;
    }

    insertBreak();
  };

  return editor;
};
