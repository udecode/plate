import {
  type SlateEditor,
  type TElement,
  getEditorPlugin,
} from '@udecode/plate';

import type { TTableElement } from '../types';

import { type TableConfig, BaseTableRowPlugin } from '../BaseTablePlugin';
import { deleteTableMergeColumn } from '../merge/deleteColumn';
import { deleteColumnWhenExpanded } from '../merge/deleteColumnWhenExpanded';
import { getCellTypes } from '../utils';

export const deleteColumn = (editor: SlateEditor) => {
  const { getOptions, type } = getEditorPlugin<TableConfig>(editor, {
    key: 'table',
  });
  const { disableMerge } = getOptions();

  const tableEntry = editor.api.above<TTableElement>({
    match: { type },
  });

  if (!tableEntry) return;

  editor.tf.withoutNormalizing(() => {
    if (!disableMerge) {
      deleteTableMergeColumn(editor);

      return;
    }
    if (editor.api.isExpanded())
      return deleteColumnWhenExpanded(editor, tableEntry);

    const tdEntry = editor.api.above({
      match: { type: getCellTypes(editor) },
    });
    const trEntry = editor.api.above({
      match: { type: editor.getType(BaseTableRowPlugin) },
    });

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
          (row.children as TElement[]).length === 1 ||
          colIndex > (row.children as TElement[]).length - 1
        )
          return;

        editor.tf.removeNodes({ at: pathToDelete });
      });

      const { colSizes } = tableNode;

      if (colSizes) {
        const newColSizes = [...colSizes];
        newColSizes.splice(colIndex, 1);

        editor.tf.setNodes<TTableElement>(
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
