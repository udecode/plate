import type { BaseEditor, ExtendPlateEditorExtension } from '@platejs/core';
import { type EditorUpdateTransaction, PointApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { TableConfig } from './BaseTablePlugin';

import { getTableGridAbove } from './queries/getTableGridAbove';
import { getCellTypes } from './utils';

/**
 * Return true if the selection is at a cell edge or immediately next to a
 * table cell.
 */
const preventDeleteTableCell = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  {
    reverse,
    unit,
  }: {
    reverse?: boolean;
    unit?: 'block' | 'character' | 'line' | 'word';
  }
) => {
  const selection = editor.read.selection();
  const getNextPoint = reverse
    ? editor.read.points.after
    : editor.read.points.before;

  if (!selection || !editor.read.selection.isCollapsed()) return;

  const cellEntry = editor.read.nodes.block({
    match: { type: getCellTypes(editor) },
  });

  if (cellEntry) {
    const [, cellPath] = cellEntry;
    const edge = reverse
      ? editor.read.points.end(cellPath)
      : editor.read.points.start(cellPath);

    if (edge && PointApi.equals(selection.anchor, edge)) return true;

    return;
  }

  const nextPoint = getNextPoint(selection, { unit });

  if (
    nextPoint &&
    editor.read.nodes.block({
      at: nextPoint,
      match: { type: getCellTypes(editor) },
    })
  ) {
    tx.selection.move({ reverse: !reverse });

    return true;
  }
};

/** Prevent cell deletion. */
export const withDeleteTable: ExtendPlateEditorExtension<TableConfig> = ({
  editor,
  type,
}) => ({
  transforms: {
    deleteBackward({ next, tx, unit }) {
      if (preventDeleteTableCell(editor, tx, { unit })) return true;

      return next({ unit });
    },
    deleteForward({ next, tx, unit }) {
      if (preventDeleteTableCell(editor, tx, { reverse: true, unit })) {
        return true;
      }

      return next({ unit });
    },
    deleteFragment({ next, options, tx }) {
      if (editor.read.nodes.above({ match: { type } })) {
        const cellEntries = getTableGridAbove(editor, { format: 'cell' });

        if (cellEntries.length > 1) {
          cellEntries.forEach(([, cellPath]) => {
            tx.nodes.replaceChildren(
              [
                {
                  children: [{ text: '' }],
                  type: editor.getType(KEYS.p),
                },
              ],
              { at: cellPath }
            );
          });

          const anchor = editor.read.points.start(cellEntries[0][1]);
          const focus = editor.read.points.end(cellEntries.at(-1)![1]);

          if (anchor && focus) tx.selection.set({ anchor, focus });

          return true;
        }
      }

      return next({ options });
    },
  },
});
