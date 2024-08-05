import {
  type PlateEditor,
  type TElement,
  type WithOverride,
  getBlockAbove,
  getEndPoint,
  getPluginType,
  getPointAfter,
  getPointBefore,
  getStartPoint,
  isCollapsed,
  isRangeInSameBlock,
  moveSelection,
  replaceNodeChildren,
  select,
  withoutNormalizing,
} from '@udecode/plate-common/server';
import { Point } from 'slate';

import type { TablePluginOptions } from './types';

import { ELEMENT_TABLE } from './TablePlugin';
import { getTableGridAbove } from './queries/getTableGridAbove';
import { getCellTypes } from './utils/getCellType';

/**
 * Return true if:
 *
 * - At start/end of a cell.
 * - Next to a table cell. Move selection to the table cell.
 */
export const preventDeleteTableCell = (
  editor: PlateEditor,
  {
    reverse,
    unit,
  }: {
    reverse?: boolean;
    unit?: 'block' | 'character' | 'line' | 'word';
  }
) => {
  const { selection } = editor;

  const getPoint = reverse ? getEndPoint : getStartPoint;
  const getNextPoint = reverse ? getPointAfter : getPointBefore;

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
        at: nextPoint,
        match: { type: getCellTypes(editor) },
      });

      if (nextCellEntry) {
        moveSelection(editor, { reverse: !reverse });

        return true;
      }
    }
  }
};

/** Prevent cell deletion. */
export const withDeleteTable: WithOverride<TablePluginOptions> = ({ editor }) => {
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
            focus: getEndPoint(editor, cellEntries.at(-1)![1]),
          });
        });

        return;
      }
    }

    deleteFragment(direction);
  };

  return editor;
};
