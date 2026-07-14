import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';
import type { TTableElement, TTableRowElement } from '@platejs/utils';

import { getEditorPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import type { TableConfig } from '../BaseTablePlugin';

import { deleteTableMergeColumn } from '../merge/deleteColumn';
import { deleteColumnWhenExpanded } from '../merge/deleteColumnWhenExpanded';
import { getTableColumnCount } from '../queries';
import { getCellTypes } from '../utils';

export const deleteColumn = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction
) => {
  const { getOptions, type } = getEditorPlugin<TableConfig>(editor, {
    key: KEYS.table,
  });
  const { disableMerge } = getOptions();

  const tableEntry = editor.read.nodes.above<TTableElement>({
    match: { type },
  });

  if (!tableEntry) return;

  tx.withoutNormalizing(({ tx }) => {
    if (!disableMerge) {
      deleteTableMergeColumn(editor, tx);

      return;
    }
    if (editor.read.selection.isExpanded())
      return deleteColumnWhenExpanded(editor, tx, tableEntry);

    const tdEntry = editor.read.nodes.above({
      match: { type: getCellTypes(editor) },
    });
    const trEntry = editor.read.nodes.above<TTableRowElement>({
      match: { type: editor.getType(KEYS.tr) },
    });

    if (tdEntry && trEntry && getTableColumnCount(tableEntry[0]) <= 1) {
      tx.nodes.remove({ at: tableEntry[1] });

      return;
    }

    if (
      tdEntry &&
      trEntry &&
      tableEntry &&
      // Cannot delete the last cell
      trEntry[0].children.length > 1
    ) {
      const [tableNode, tablePath] = tableEntry;

      const tdPath = tdEntry[1];
      const colIndex = tdPath.at(-1)!;

      const pathToDelete = tdPath.slice();
      const replacePathPos = pathToDelete.length - 2;

      tableNode.children.forEach((row, rowIdx) => {
        const rowElement = row as TTableRowElement;

        pathToDelete[replacePathPos] = rowIdx;

        // for tables containing rows of different lengths
        // - don't delete if only one cell in row
        // - don't delete if row doesn't have this cell
        if (
          rowElement.children.length === 1 ||
          colIndex > rowElement.children.length - 1
        )
          return;

        tx.nodes.remove({ at: pathToDelete });
      });

      const { colSizes } = tableNode;

      if (colSizes) {
        const newColSizes = [...colSizes];
        newColSizes.splice(colIndex, 1);

        tx.nodes.set<TTableElement>(
          { colSizes: newColSizes },
          { at: tablePath }
        );
      }
    }
  });

  // computeCellIndices(editor, {
  //   tableNode: tableEntry[0],
  // });
};
