import React, { useMemo } from 'react';

import { unsetNodes } from '@udecode/plate-common';
import {
  useEditorRef,
  useElement,
  useNodePath,
} from '@udecode/plate-common/react';

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
export const useTableColSizes = ({
  disableOverrides = false,
  transformColSizes,
}: {
  disableOverrides?: boolean;
  transformColSizes?: (colSizes: number[]) => number[];
} = {}): number[] => {
  const editor = useEditorRef();
  const tableNode = useElement<TTableElement>(TablePlugin.key);
  const colSizeOverrides = useTableStore().get.colSizeOverrides();
  const path = useNodePath(tableNode);

  const { enableUnsetSingleColSize } = editor.getOptions(TablePlugin);

  const overriddenColSizes = useMemo(() => {
    const colSizes = getTableOverriddenColSizes(
      tableNode,
      disableOverrides ? undefined : colSizeOverrides
    );

    if (transformColSizes) {
      return transformColSizes(colSizes);
    }

    return colSizes;
  }, [tableNode, disableOverrides, colSizeOverrides, transformColSizes]);

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
