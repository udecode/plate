import { Editor, Node, Point, Transforms } from 'slate';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from './defaults';
import { WithTableOptions } from './types';

export const withTable = (options?: WithTableOptions) => <T extends Editor>(
  editor: T
) => {
  const { td, th } = setDefaults(options, DEFAULTS_TABLE);
  const matchCells = (node: Node) =>
    node.type === td.type || node.type === th.type;

  const { deleteBackward, deleteForward, deleteFragment } = editor;

  const preventDeleteCell = (
    operation: any,
    pointCallback: any,
    nextPoint: any
  ) => (unit: any) => {
    const { selection } = editor;
    // Prevent deletions within a cell
    if (isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: matchCells,
      });

      if (cell) {
        const [, cellPath] = cell;
        const start = pointCallback(editor, cellPath);

        if (selection && Point.equals(selection.anchor, start)) {
          return;
        }
      }
    }
    // Prevent deleting cell when selection is before or after a table
    const next = nextPoint(editor, selection, { unit });
    const [cell] = Editor.nodes(editor, {
      match: matchCells,
      at: next,
    });
    if (cell) {
      return;
    }

    operation(unit);
  };

  editor.deleteFragment = () => {
    const { selection } = editor;
    const [start] = Editor.nodes(editor, {
      match: matchCells,
      at: selection?.anchor.path,
    });
    const [end] = Editor.nodes(editor, {
      match: matchCells,
      at: selection?.focus.path,
    });
    // Skip deletes if they start or end in a table cell, unless start & end in the same cell
    if ((start || end) && start?.[0] !== end?.[0]) {
      // Clear cells content
      const cells = Editor.nodes(editor, {
        match: matchCells,
      });
      for (const [, path] of cells) {
        for (const [, childPath] of Node.children(editor, path)) {
          Transforms.removeNodes(editor, { at: childPath });
        }
      }
      Transforms.collapse(editor);
      return;
    }
    deleteFragment();
  };

  // prevent deleting cells with deleteBackward
  editor.deleteBackward = preventDeleteCell(
    deleteBackward,
    Editor.start,
    Editor.before
  );

  // prevent deleting cells with deleteForward
  editor.deleteForward = preventDeleteCell(
    deleteForward,
    Editor.end,
    Editor.after
  );

  return editor;
};
