import {
  type PlateEditor,
  type TElement,
  getAboveNode,
  getPluginOptions,
  getPluginType,
  isExpanded,
  removeNodes,
  setNodes,
  someNode,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { TTableElement, TablePluginOptions } from '../types';

import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from '../TablePlugin';
import { deleteTableMergeColumn } from '../merge/deleteColumn';
import { deleteColumnWhenExpanded } from '../merge/deleteColumnWhenExpanded';

export const deleteColumn = (editor: PlateEditor) => {
  const { enableMerging } = getPluginOptions<TablePluginOptions>(
    editor,
    TablePlugin.key
  );

  if (enableMerging) {
    return deleteTableMergeColumn(editor);
  }
  if (
    !someNode(editor, {
      match: { type: getPluginType(editor, TablePlugin.key) },
    })
  ) {
    return;
  }

  const tableEntry = getAboveNode<TTableElement>(editor, {
    match: { type: getPluginType(editor, TablePlugin.key) },
  });

  if (!tableEntry) return;
  if (isExpanded(editor.selection))
    return deleteColumnWhenExpanded(editor, tableEntry);

  const tdEntry = getAboveNode(editor, {
    match: {
      type: [
        getPluginType(editor, TableCellPlugin.key),
        getPluginType(editor, TableCellHeaderPlugin.key),
      ],
    },
  });
  const trEntry = getAboveNode(editor, {
    match: { type: getPluginType(editor, TableRowPlugin.key) },
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

    withoutNormalizing(editor, () => {
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

        removeNodes(editor, {
          at: pathToDelete,
        });
      });

      const { colSizes } = tableNode;

      if (colSizes) {
        const newColSizes = [...colSizes];
        newColSizes.splice(colIndex, 1);

        setNodes<TTableElement>(
          editor,
          {
            colSizes: newColSizes,
          },
          {
            at: tablePath,
          }
        );
      }
    });
  }
};
