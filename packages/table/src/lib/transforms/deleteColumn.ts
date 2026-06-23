import type { Element } from '@platejs/slate';
import type { SlateEditor, TTableElement } from 'platejs';

import { getEditorPlugin, KEYS } from 'platejs';

import type { TableConfig } from '../BaseTablePlugin';

import { deleteTableMergeColumn } from '../merge/deleteColumn';
import { deleteColumnWhenExpanded } from '../merge/deleteColumnWhenExpanded';
import { getTableColumnCount } from '../queries';
import { getCellTypes } from '../utils';

export const deleteColumn = (editor: SlateEditor) => {
  const { getOptions, type } = getEditorPlugin<TableConfig>(editor, {
    key: KEYS.table,
  });
  const { disableMerge } = getOptions();

  const tableEntry = editor.api.above<TTableElement>({
    match: { type },
  });

  if (!tableEntry) return;

  if (!disableMerge) {
    deleteTableMergeColumn(editor);

    return;
  }
  if (editor.api.isExpanded()) return deleteColumnWhenExpanded(editor, tableEntry);

    const tdEntry = editor.api.above({
      match: { type: getCellTypes(editor) },
    });
    const trEntry = editor.api.above({
      match: { type: editor.getType(KEYS.tr) },
    });

    if (tdEntry && trEntry && getTableColumnCount(tableEntry[0]) <= 1) {
      editor.update((tx) => {
        tx.nodes.remove({ at: tableEntry[1] });
      });

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
        pathToDelete[replacePathPos] = rowIdx;

        // for tables containing rows of different lengths
        // - don't delete if only one cell in row
        // - don't delete if row doesn't have this cell
        if (
          (row.children as Element[]).length === 1 ||
          colIndex > (row.children as Element[]).length - 1
        )
          return;

        editor.update((tx) => {
          tx.nodes.remove({ at: pathToDelete });
        });
      });

      const { colSizes } = tableNode;

      if (colSizes) {
        const newColSizes = [...colSizes];
        newColSizes.splice(colIndex, 1);

        editor.update((tx) => {
          tx.nodes.set(
            { colSizes: newColSizes } satisfies Partial<TTableElement>,
            { at: tablePath }
          );
        });
      }
    }

  // computeCellIndices(editor, {
  //   tableNode: tableEntry[0],
  // });
};
