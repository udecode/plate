import { useEffect } from 'react';
import { findNodePath, unsetNodes, useEditorRef } from '@udecode/plate-core';
import { getTableColumnCount, TTableElement } from '@udecode/plate-table';
import { useTableStore } from '../table.atoms';

/**
 * Returns node.colSizes if it exists, otherwise returns a 0-filled array.
 * Unset node.colSizes if `colCount` updates to 1.
 */
export const useTableColSizes = (tableNode: TTableElement): number[] => {
  const editor = useEditorRef();
  const resizingCol = useTableStore().get.resizingCol();

  const colCount = getTableColumnCount(tableNode);

  const colSizes = tableNode.colSizes
    ? [...tableNode.colSizes]
    : Array(colCount);

  if (resizingCol) {
    colSizes[resizingCol.index ?? 0] = resizingCol.width;
  }

  useEffect(() => {
    if (colCount < 2 && tableNode.colSizes?.length) {
      unsetNodes(editor, 'colSizes', {
        at: findNodePath(editor, tableNode),
      });
    }
  }, [colCount, editor, tableNode]);

  return colSizes;
};
