import React from 'react';

import { findNode } from '@udecode/plate-common';
import {
  findNodePath,
  useEditorPlugin,
  useElement,
} from '@udecode/plate-common/react';
import debounce from 'lodash/debounce.js';

import {
  type TTableElement,
  computeCellIndices,
  getColSpan,
  getRowSpan,
} from '../../../lib';
import { TablePlugin } from '../../TablePlugin';
import { getTableRowIndex } from '../../queries';
import { useTableStore } from '../../stores';

export const useTableCellElementResizable = () => {
  const { editor } = useEditorPlugin(TablePlugin);
  const element = useElement();

  const setHoveredColIndex = useTableStore().set.hoveredColIndex();
  const setHoveredRowIndex = useTableStore().set.hoveredRowIndex();

  const handleColumnResize = debounce((colIndex?: number) => {
    if (colIndex === -1) {
      setHoveredColIndex(colIndex);

      return;
    }

    const cellPath = findNodePath(editor, element)!;
    const [tableElement] = findNode<TTableElement>(editor, {
      at: cellPath,
      match: { type: TablePlugin.key },
    })!;

    const defaultColIndex = computeCellIndices(
      editor,
      tableElement,
      element
    )!.col;
    const colSpan = getColSpan(element);
    const endingColIndex = defaultColIndex + colSpan - 1;

    if (endingColIndex !== undefined) {
      setHoveredColIndex(endingColIndex);
    }
  }, 150);

  const handleRowResize = debounce(() => {
    const defaultRowIndex = getTableRowIndex(editor, element);
    const rowSpan = getRowSpan(element);
    const endingRowIndex = defaultRowIndex + rowSpan - 1;
    setHoveredRowIndex(endingRowIndex);
  }, 150);

  const handleColumnResizeCancel = () => {
    handleColumnResize.cancel();
    setHoveredColIndex(null);
  };

  const handleRowResizeCancel = () => {
    handleRowResize.cancel();
    setHoveredRowIndex(null);
  };

  React.useEffect(() => {
    return () => {
      handleColumnResize.cancel();
      handleRowResize.cancel();
    };
  }, [handleColumnResize, handleRowResize]);

  return {
    bottomProps: {
      onMouseEnter: handleRowResize,
      onMouseLeave: handleRowResizeCancel,
    },
    leftProps: {
      onMouseEnter: () => handleColumnResize(-1),
      onMouseLeave: handleColumnResizeCancel,
    },
    rightProps: {
      onMouseEnter: () => handleColumnResize(),
      onMouseLeave: handleColumnResizeCancel,
    },
  };
};
