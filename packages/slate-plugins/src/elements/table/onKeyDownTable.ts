import { Editor, Transforms } from 'slate';
import { setDefaults } from '../../common';
import { getAbove } from '../../common/queries';
import { getNextTableCell } from './queries/getNextTableCell';
import { getPreviousTableCell } from './queries/getPreviousTableCell';
import { getTableCellEntry } from './queries/getTableCellEntry';
import { DEFAULTS_TABLE } from './defaults';
import { TableHotKey, TableOnKeyDownOptions } from './types';

export const onKeyDownTable = (options?: TableOnKeyDownOptions) => (
  e: KeyboardEvent,
  editor: Editor
) => {
  if (e.key === TableHotKey.TAB) {
    e.preventDefault();
    const res = getTableCellEntry(editor, {}, options);
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
    const { table } = setDefaults(options, DEFAULTS_TABLE);

    const res = getAbove(editor, { match: { type: table.type } });
    if (!res) return;

    const [, tablePath] = res;

    // select the whole table
    Transforms.select(editor, tablePath);

    e.preventDefault();
    e.stopPropagation();
  }
};
