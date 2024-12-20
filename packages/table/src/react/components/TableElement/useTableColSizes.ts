import React from 'react';

import { unsetNodes } from '@udecode/plate-common';
import { useEditorRef, useNodePath } from '@udecode/plate-common/react';

import {
  type TTableElement,
  getTableColumnCount,
  getTableOverriddenColSizes,
} from '../../../lib';
import { TablePlugin } from '../../TablePlugin';
import { useTableStore } from '../../stores';

/**
 * Returns colSizes with overrides applied. Unset node.colSizes if `colCount`
 * updates to 1.
 */
export const useTableColSizes = (
  tableNode: TTableElement,
  { disableOverrides = false } = {}
): number[] => {
  const editor = useEditorRef();
  const colSizeOverrides = useTableStore().get.colSizeOverrides();
  const path = useNodePath(tableNode);

  const { enableUnsetSingleColSize } = editor.getOptions(TablePlugin);

  const overriddenColSizes = getTableOverriddenColSizes(
    tableNode,
    disableOverrides ? undefined : colSizeOverrides
  );

  const colCount = getTableColumnCount(tableNode);

  React.useEffect(() => {
    if (
      enableUnsetSingleColSize &&
      colCount < 2 &&
      tableNode.colSizes?.length
    ) {
      unsetNodes(editor, 'colSizes', {
        at: path,
      });
    }
  }, [colCount, enableUnsetSingleColSize, editor, tableNode, path]);

  return overriddenColSizes;
};
