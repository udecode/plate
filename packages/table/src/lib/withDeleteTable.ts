import {
  type ExtendEditor,
  type SlateEditor,
  type TElement,
  isCollapsed,
  replaceNodeChildren,
} from '@udecode/plate-common';
import { Point } from 'slate';

import { type TableConfig, getCellTypes } from '.';
import { getTableGridAbove } from './queries/getTableGridAbove';

/**
 * Return true if:
 *
 * - At start/end of a cell.
 * - Next to a table cell. Move selection to the table cell.
 */
export const preventDeleteTableCell = (
  editor: SlateEditor,
  {
    reverse,
    unit,
  }: {
    reverse?: boolean;
    unit?: 'block' | 'character' | 'line' | 'word';
  }
) => {
  const { selection } = editor;

  const getNextPoint = reverse ? editor.api.after : editor.api.before;

  if (isCollapsed(selection)) {
    const cellEntry = editor.api.block({
      match: { type: getCellTypes(editor) },
    });

    if (cellEntry) {
      // Prevent deleting cell at the start or end of a cell
      const [, cellPath] = cellEntry;

      const start = reverse
        ? editor.api.end(cellPath)
        : editor.api.start(cellPath);

      if (selection && Point.equals(selection.anchor, start!)) {
        return true;
      }
    } else {
      // Prevent deleting cell when selection is before or after a table
      const nextPoint = getNextPoint(selection!, { unit });

      const nextCellEntry = editor.api.block({
        at: nextPoint,
        match: { type: getCellTypes(editor) },
      });

      if (nextCellEntry) {
        editor.tf.move({ reverse: !reverse });

        return true;
      }
    }
  }
};

/** Prevent cell deletion. */
export const withDeleteTable: ExtendEditor<TableConfig> = ({
  editor,
  type,
}) => {
  const { deleteBackward, deleteForward, deleteFragment } = editor;

  editor.deleteBackward = (unit) => {
    if (preventDeleteTableCell(editor, { unit })) return;

    return deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    if (preventDeleteTableCell(editor, { reverse: true, unit })) return;

    return deleteForward(unit);
  };

  editor.deleteFragment = (direction) => {
    if (editor.api.isAt({ block: true, match: (n) => n.type === type })) {
      const cellEntries = getTableGridAbove(editor, { format: 'cell' });

      if (cellEntries.length > 1) {
        editor.tf.withoutNormalizing(() => {
          cellEntries.forEach(([, cellPath]) => {
            replaceNodeChildren<TElement>(editor, {
              at: cellPath,
              nodes: editor.api.create.block(),
            });
          });

          // set back the selection
          editor.tf.select({
            anchor: editor.api.start(cellEntries[0][1])!,
            focus: editor.api.end(cellEntries.at(-1)![1])!,
          });
        });

        return;
      }
    }

    deleteFragment(direction);
  };

  return editor;
};
