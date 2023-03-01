import { useEffect } from 'react';
import {
  findNodePath,
  getPluginOptions,
  unsetNodes,
  useEditorRef,
} from '@udecode/plate-core';
import {
  ELEMENT_TABLE,
  getTableColumnCount,
  TablePlugin,
  TTableElement,
} from '@udecode/plate-table';
import { useTableStore } from '../table.atoms';

/**
 * Returns node.colSizes if it exists, otherwise returns a 0-filled array.
 * Unset node.colSizes if `colCount` updates to 1.
 */
export const useTableColSizes = (tableNode: TTableElement): number[] => {
  const editor = useEditorRef();
  const resizingCol = useTableStore().get.resizingCol();

  const { disableUnsetSingleColSize } = getPluginOptions<TablePlugin>(
    editor,
    ELEMENT_TABLE
  );

  const colCount = getTableColumnCount(tableNode);

  const colSizes = tableNode.colSizes
    ? [...tableNode.colSizes]
    : Array(colCount).fill(0);

  if (resizingCol) {
    colSizes[resizingCol.index ?? 0] = resizingCol.width;
  }

  useEffect(() => {
    if (
      !disableUnsetSingleColSize &&
      colCount < 2 &&
      tableNode.colSizes?.length
    ) {
      unsetNodes(editor, 'colSizes', {
        at: findNodePath(editor, tableNode),
      });
    }
  }, [colCount, disableUnsetSingleColSize, editor, tableNode]);

  return colSizes;
};
