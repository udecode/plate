import {
  getAboveNode,
  KeyboardHandlerReturnType,
  PlateEditor,
  PluginOptions,
  select,
  TElement,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-core';
import { getNextTableCell } from './queries/getNextTableCell';
import { getPreviousTableCell } from './queries/getPreviousTableCell';
import { getTableCellEntry } from './queries/getTableCellEntry';
import { moveSelectionFromCell } from './transforms/moveSelectionFromCell';

export const onKeyDownTable = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { type }: WithPlatePlugin<P, V, E>
): KeyboardHandlerReturnType => (e) => {
  if (e.key === 'ArrowUp') {
    if (
      moveSelectionFromCell(editor, {
        reverse: true,
        edge: e.shiftKey ? 'top' : undefined,
      })
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  if (e.key === 'ArrowDown') {
    if (
      moveSelectionFromCell(editor, { edge: e.shiftKey ? 'bottom' : undefined })
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  if (e.shiftKey) {
    if (e.key === 'ArrowLeft') {
      if (moveSelectionFromCell(editor, { edge: 'left' })) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    if (e.key === 'ArrowRight') {
      if (moveSelectionFromCell(editor, { edge: 'right' })) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }

  if (e.key === 'Tab') {
    e.preventDefault();
    e.stopPropagation();
    const res = getTableCellEntry(editor, {});
    if (!res) return;
    const { tableRow, tableCell } = res;
    const [, tableCellPath] = tableCell;
    const shiftTab = e.shiftKey;
    const tab = !e.shiftKey;
    if (shiftTab) {
      // move left with shift+tab
      const previousCell = getPreviousTableCell(
        editor,
        tableCell,
        tableCellPath,
        tableRow
      );
      if (previousCell) {
        const [, previousCellPath] = previousCell;
        select(editor, previousCellPath);
      }
    } else if (tab) {
      // move right with tab
      const nextCell = getNextTableCell(
        editor,
        tableCell,
        tableCellPath,
        tableRow
      );
      if (nextCell) {
        const [, nextCellPath] = nextCell;
        select(editor, nextCellPath);
      }
    }
  }

  // FIXME: would prefer this as mod+a, but doesn't work
  if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
    const res = getAboveNode<TElement>(editor, { match: { type } });
    if (!res) return;

    const [, tablePath] = res;

    // select the whole table
    select(editor, tablePath);

    e.preventDefault();
    e.stopPropagation();
  }
};
