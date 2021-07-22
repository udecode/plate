import { getAbove } from '@udecode/plate-common';
import {
  getPlatePluginOptions,
  KeyboardHandler,
  SPEditor,
  TElement,
} from '@udecode/plate-core';
import { Transforms } from 'slate';
import { getNextTableCell } from './queries/getNextTableCell';
import { getPreviousTableCell } from './queries/getPreviousTableCell';
import { getTableCellEntry } from './queries/getTableCellEntry';
import { ELEMENT_TABLE } from './defaults';

export const getTableOnKeyDown = <
  T extends SPEditor = SPEditor
>(): KeyboardHandler<T> => (editor) => (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
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
        Transforms.select(editor, previousCellPath);
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
        Transforms.select(editor, nextCellPath);
      }
    }
  }

  // FIXME: would prefer this as mod+a, but doesn't work
  if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
    const options = getPlatePluginOptions(editor, ELEMENT_TABLE);

    const res = getAbove<TElement>(editor, { match: { type: options.type } });
    if (!res) return;

    const [, tablePath] = res;

    // select the whole table
    Transforms.select(editor, tablePath);

    e.preventDefault();
    e.stopPropagation();
  }
};
