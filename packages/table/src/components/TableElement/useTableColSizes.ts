import { useEffect, useMemo } from 'react';
import {
  findNodePath,
  getPluginOptions,
  unsetNodes,
  usePlateEditorRef,
} from '@udecode/plate-common';

import { ELEMENT_TABLE } from '../../createTablePlugin';
import {
  getTableColumnCount,
  getTableOverriddenColSizes,
} from '../../queries/index';
import { useTableStore } from '../../stores/tableStore';
import { TablePlugin, TTableElement } from '../../types';
import { getCellOffsets } from '../TableCellElement/getCellsOffsets';

/**
 * Returns colSizes with overrides applied.
 * Unset node.colSizes if `colCount` updates to 1.
 */
export const useTableColSizes = (
  tableNode: TTableElement,
  { disableOverrides = false } = {}
): number[] => {
  const editor = usePlateEditorRef();
  const colSizeOverrides = useTableStore().get.colSizeOverrides();

  const { enableUnsetSingleColSize, minColumnWidth } =
    getPluginOptions<TablePlugin>(editor, ELEMENT_TABLE);

  const colCount = getTableColumnCount(tableNode);

  // spread needed here to apply new array, not a reference
  const overriddenColSizes = useMemo(
    () =>
      getTableOverriddenColSizes(
        colCount,
        minColumnWidth,
        tableNode.colSizes ? [...tableNode.colSizes] : undefined,
        disableOverrides ? undefined : colSizeOverrides
      ),
    [
      colCount,
      colSizeOverrides,
      disableOverrides,
      minColumnWidth,
      tableNode.colSizes,
    ]
  );

  const setCellsOffsets = useTableStore().set.cellsOffsets();
  useEffect(() => {
    setCellsOffsets(getCellOffsets(overriddenColSizes));
  }, [overriddenColSizes, setCellsOffsets]);

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

  return overriddenColSizes;
};
