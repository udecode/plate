import React from 'react';

import { collapseSelection, getPluginOptions } from '@udecode/plate-common';
import { useEditorRef, useElement } from '@udecode/plate-common/react';

import type { TTableElement, TablePluginOptions } from '../../types';

import { TablePlugin } from '../../TablePlugin';
import { computeAllCellIndices } from '../../merge/computeCellIndices';
import { useTableStore } from '../../stores/tableStore';
import { useSelectedCells } from './useSelectedCells';
import { useTableColSizes } from './useTableColSizes';

export interface TableElementState {
  colSizes: number[];
  isSelectingCell: boolean;
  marginLeft: number;
  minColumnWidth: number;
}

export const useTableElementState = ({
  transformColSizes,
}: {
  /** Transform node column sizes */
  transformColSizes?: (colSizes: number[]) => number[];
} = {}): TableElementState => {
  const editor = useEditorRef();

  const { disableMarginLeft, enableMerging, minColumnWidth } =
    getPluginOptions<TablePluginOptions>(editor, TablePlugin.key);

  const element = useElement<TTableElement>();
  const selectedCells = useTableStore().get.selectedCells();
  const marginLeftOverride = useTableStore().get.marginLeftOverride();

  const marginLeft = disableMarginLeft
    ? 0
    : marginLeftOverride ?? element.marginLeft ?? 0;

  let colSizes = useTableColSizes(element);

  React.useEffect(() => {
    if (enableMerging) {
      computeAllCellIndices(editor, element);
    }
  }, [editor, element, enableMerging]);

  if (transformColSizes) {
    colSizes = transformColSizes(colSizes);
  }
  // add a last col to fill the remaining space
  if (!colSizes.includes(0)) {
    colSizes.push('100%' as any);
  }

  return {
    colSizes,
    isSelectingCell: !!selectedCells,
    marginLeft,
    minColumnWidth: minColumnWidth!,
  };
};

export const useTableElement = () => {
  const editor = useEditorRef();
  const selectedCells = useTableStore().get.selectedCells();

  useSelectedCells();

  return {
    colGroupProps: {
      contentEditable: false,
      style: { width: '100%' },
    },
    props: {
      onMouseDown: () => {
        // until cell dnd is supported, we collapse the selection on mouse down
        if (selectedCells) {
          collapseSelection(editor);
        }
      },
    },
  };
};
