import {
  getBlockAbove,
  getEndPoint,
  getPluginType,
  getPointAfter,
  getPointBefore,
  getStartPoint,
  isCollapsed,
  isRangeInSameBlock,
  moveSelection,
  PlateEditor,
  replaceNodeChildren,
  select,
  TElement,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Point } from 'slate';
import { getTableGridAbove } from './queries/getTableGridAbove';
import { getCellTypes } from './utils/getCellType';
import { ELEMENT_TABLE } from './createTablePlugin';

/**
 * Return true if:
 * - at start/end of a cell.
 * - next to a table cell. Move selection to the table cell.
 */
export const preventDeleteTableCell = <V extends Value = Value>(
  editor: PlateEditor<V>,
  {
    unit,
    reverse,
  }: {
    unit?: 'character' | 'word' | 'line' | 'block';
    reverse?: boolean;
  }
) => {
  const { selection } = editor;

  const getPoint = !reverse ? getStartPoint : getEndPoint;
  const getNextPoint = !reverse ? getPointBefore : getPointAfter;

  if (isCollapsed(selection)) {
    const cellEntry = getBlockAbove(editor, {
      match: { type: getCellTypes(editor) },
    });

    if (cellEntry) {
      // Prevent deleting cell at the start or end of a cell
      const [, cellPath] = cellEntry;

      const start = getPoint(editor, cellPath);

      if (selection && Point.equals(selection.anchor, start)) {
        return true;
      }
    } else {
      // Prevent deleting cell when selection is before or after a table
      const nextPoint = getNextPoint(editor, selection!, { unit });

      const nextCellEntry = getBlockAbove(editor, {
        match: { type: getCellTypes(editor) },
        at: nextPoint,
      });
      if (nextCellEntry) {
        moveSelection(editor, { reverse: !reverse });
        return true;
      }
    }
  }
};

/**
 * Prevent cell deletion.
 */
export const withDeleteTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const { deleteBackward, deleteForward, deleteFragment } = editor;

  editor.deleteBackward = (unit) => {
    if (preventDeleteTableCell(editor, { unit })) return;

    return deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    if (preventDeleteTableCell(editor, { unit, reverse: true })) return;

    return deleteForward(unit);
  };

  editor.deleteFragment = (direction) => {
    if (
      isRangeInSameBlock(editor, {
        match: (n) => n.type === getPluginType(editor, ELEMENT_TABLE),
      })
    ) {
      const cellEntries = getTableGridAbove(editor, { format: 'cell' });
      if (cellEntries.length > 1) {
        withoutNormalizing(editor, () => {
          cellEntries.forEach(([, cellPath]) => {
            replaceNodeChildren<TElement>(editor, {
              at: cellPath,
              nodes: editor.blockFactory(),
            });
          });

          // set back the selection
          select(editor, {
            anchor: getStartPoint(editor, cellEntries[0][1]),
            focus: getEndPoint(editor, cellEntries[cellEntries.length - 1][1]),
          });
        });

        return;
      }
    }

    deleteFragment(direction);
  };

  return editor;
};
