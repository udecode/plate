import {
  type PlateEditor,
  type TElement,
  type Value,
  getAboveNode,
  getPluginOptions,
  getPluginType,
  isExpanded,
  removeNodes,
  setNodes,
  someNode,
  withoutNormalizing,
} from '@udecode/plate-common/server';

import type { TTableElement, TablePlugin } from '../types';

import {
  ELEMENT_TABLE,
  ELEMENT_TD,
  ELEMENT_TH,
  ELEMENT_TR,
} from '../createTablePlugin';
import { deleteTableMergeColumn } from '../merge/deleteColumn';
import { deleteColumnWhenExpanded } from '../merge/deleteColumnWhenExpanded';

export const deleteColumn = <V extends Value>(editor: PlateEditor<V>) => {
  const { enableMerging } = getPluginOptions<TablePlugin, V>(
    editor,
    ELEMENT_TABLE
  );

  if (enableMerging) {
    return deleteTableMergeColumn(editor);
  }
  if (
    !someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    return;
  }

  const tableEntry = getAboveNode<TTableElement>(editor, {
    match: { type: getPluginType(editor, ELEMENT_TABLE) },
  });

  if (!tableEntry) return;
  if (isExpanded(editor.selection))
    return deleteColumnWhenExpanded(editor, tableEntry);

  const tdEntry = getAboveNode(editor, {
    match: {
      type: [
        getPluginType(editor, ELEMENT_TD),
        getPluginType(editor, ELEMENT_TH),
      ],
    },
  });
  const trEntry = getAboveNode(editor, {
    match: { type: getPluginType(editor, ELEMENT_TR) },
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
