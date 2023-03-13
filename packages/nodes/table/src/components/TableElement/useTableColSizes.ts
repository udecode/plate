import { useEffect } from 'react';
import {
  findNodePath,
  getPluginOptions,
  unsetNodes,
  useEditorRef,
} from '@udecode/plate-common';
import { ELEMENT_TABLE } from '../../createTablePlugin';
import { getTableColumnCount } from '../../queries';
import { useTableStore } from '../../stores/tableStore';
import { TablePlugin, TTableElement } from '../../types';

/**
 * Returns node.colSizes if it exists, otherwise returns a 0-filled array.
 * Unset node.colSizes if `colCount` updates to 1.
 */
export const useTableColSizes = (tableNode: TTableElement): number[] => {
  const editor = useEditorRef();
  const colSizeOverrides = useTableStore().get.colSizeOverrides();

  const { enableUnsetSingleColSize } = getPluginOptions<TablePlugin>(
    editor,
    ELEMENT_TABLE
  );

  const colCount = getTableColumnCount(tableNode);

  const colSizes = (tableNode.colSizes
    ? [...tableNode.colSizes]
    : Array(colCount).fill(0)
  ).map((size, index) => colSizeOverrides.get(index) ?? size);

  useEffect(() => {
    if (
      enableUnsetSingleColSize &&
      colCount < 2 &&
      tableNode.colSizes?.length
    ) {
      unsetNodes(editor, 'colSizes', {
        at: findNodePath(editor, tableNode),
      });
    }
  }, [colCount, enableUnsetSingleColSize, editor, tableNode]);

  return colSizes;
};
