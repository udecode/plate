import {
  type OverrideEditor,
  type SlateEditor,
  PointApi,
} from '@udecode/plate';

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

  if (editor.api.isCollapsed()) {
    const cellEntry = editor.api.block({
      match: { type: getCellTypes(editor) },
    });

    if (cellEntry) {
      // Prevent deleting cell at the start or end of a cell
      const [, cellPath] = cellEntry;
      const start = reverse
        ? editor.api.end(cellPath)
        : editor.api.start(cellPath);

      if (selection && PointApi.equals(selection.anchor, start!)) {
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
export const withDeleteTable: OverrideEditor<TableConfig> = ({
  editor,
  tf: { deleteBackward, deleteForward, deleteFragment },
  type,
}) => ({
  transforms: {
    deleteBackward(unit) {
      if (preventDeleteTableCell(editor, { unit: unit })) return;

      deleteBackward(unit);
    },

    deleteForward(unit) {
      if (
        preventDeleteTableCell(editor, {
          reverse: true,
          unit: unit,
        })
      )
        return;

      deleteForward(unit);
    },

    deleteFragment(direction) {
      if (editor.api.isAt({ block: true, match: (n) => n.type === type })) {
        const cellEntries = getTableGridAbove(editor, { format: 'cell' });

        if (cellEntries.length > 1) {
          editor.tf.withoutNormalizing(() => {
            cellEntries.forEach(([, cellPath]) => {
              editor.tf.replaceNodes(editor.api.create.block(), {
                at: cellPath,
                children: true,
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
    },
  },
});
