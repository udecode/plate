import {
  getAboveNode,
  Hotkeys,
  KeyboardHandlerReturnType,
  PlateEditor,
  PluginOptions,
  select,
  TElement,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import {
  getNextTableCell,
  getPreviousTableCell,
  getTableCellEntry,
} from './queries/index';
import { moveSelectionFromCell } from './transforms/index';

export const onKeyDownTable = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { type }: WithPlatePlugin<P, V, E>
): KeyboardHandlerReturnType => (e) => {
  const isShiftUp = isHotkey('shift+up', e);
  if (isHotkey('up', e) || isShiftUp) {
    if (
      moveSelectionFromCell(editor, {
        reverse: true,
        edge: isShiftUp ? 'top' : undefined,
      })
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  const isShiftDown = isHotkey('shift+down', e);
  if (isHotkey('down', e) || isShiftDown) {
    if (
      moveSelectionFromCell(editor, {
        edge: isShiftDown ? 'bottom' : undefined,
      })
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  if (isHotkey('shift+left', e)) {
    if (moveSelectionFromCell(editor, { edge: 'left' })) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  if (isHotkey('shift+right', e)) {
    if (moveSelectionFromCell(editor, { edge: 'right' })) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  const isTab = Hotkeys.isTab(editor, e);
  const isUntab = Hotkeys.isUntab(editor, e);
  if (isTab || isUntab) {
    const res = getTableCellEntry(editor, {});
    if (!res) return;
    const { tableRow, tableCell } = res;
    const [, tableCellPath] = tableCell;

    if (isUntab) {
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
        e.preventDefault();
        e.stopPropagation();
      }
    } else if (isTab) {
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
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }

  if (isHotkey('mod+a', e)) {
    const res = getAboveNode<TElement>(editor, { match: { type } });
    if (!res) return;

    const [, tablePath] = res;

    // select the whole table
    select(editor, tablePath);

    e.preventDefault();
    e.stopPropagation();
  }
};
