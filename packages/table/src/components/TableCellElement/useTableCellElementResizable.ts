import React from 'react';

import { findNodePath, useEditorRef, useElement } from '@udecode/plate-common';
import { getPluginOptions } from '@udecode/plate-common/server';
import {
  type ResizeEvent,
  type ResizeHandle,
  resizeLengthClampStatic,
} from '@udecode/plate-resizable';

import type { TTableElement, TablePluginOptions } from '../../types';
import type { TableCellElementState } from './useTableCellElementState';

import { ELEMENT_TABLE } from '../../TablePlugin';
import {
  useOverrideColSize,
  useOverrideMarginLeft,
  useOverrideRowSize,
  useTableStore,
} from '../../stores/tableStore';
import {
  setTableColSize,
  setTableMarginLeft,
  setTableRowSize,
} from '../../transforms/index';
import { useTableColSizes } from '../TableElement/useTableColSizes';
import { roundCellSizeToStep } from './roundCellSizeToStep';

export type TableCellElementResizableOptions = {
  /** Resize by step instead of by pixel. */
  step?: number;

  /** Overrides for X and Y axes. */
  stepX?: number;
  stepY?: number;
} & Pick<TableCellElementState, 'colIndex' | 'colSpan' | 'rowIndex'>;

export const useTableCellElementResizableState = ({
  colIndex,
  colSpan,
  rowIndex,
  step,
  stepX = step,
  stepY = step,
}: TableCellElementResizableOptions) => {
  const editor = useEditorRef();
  const { disableMarginLeft } = getPluginOptions<TablePluginOptions>(
    editor,
    ELEMENT_TABLE
  );

  return {
    colIndex,
    colSpan,
    disableMarginLeft,
    rowIndex,
    stepX,
    stepY,
  };
};

export const useTableCellElementResizable = ({
  colIndex,
  colSpan,
  disableMarginLeft,
  rowIndex,
  stepX,
  stepY,
}: ReturnType<typeof useTableCellElementResizableState>): {
  bottomProps: React.ComponentPropsWithoutRef<typeof ResizeHandle>;
  hiddenLeft: boolean;
  leftProps: React.ComponentPropsWithoutRef<typeof ResizeHandle>;
  rightProps: React.ComponentPropsWithoutRef<typeof ResizeHandle>;
} => {
  const editor = useEditorRef();
  const element = useElement();
  const tableElement = useElement<TTableElement>(ELEMENT_TABLE);
  const { minColumnWidth = 0 } = getPluginOptions<TablePluginOptions>(
    editor,
    ELEMENT_TABLE
  );

  let initialWidth: number | undefined;

  if (colSpan > 1) {
    initialWidth = tableElement.colSizes?.[colIndex];
  }

  const [hoveredColIndex, setHoveredColIndex] =
    useTableStore().use.hoveredColIndex();

  const colSizesWithoutOverrides = useTableColSizes(tableElement, {
    disableOverrides: true,
  });
  const { marginLeft = 0 } = tableElement;

  const overrideColSize = useOverrideColSize();
  const overrideRowSize = useOverrideRowSize();
  const overrideMarginLeft = useOverrideMarginLeft();

  /* eslint-disable @typescript-eslint/no-shadow */
  const setColSize = React.useCallback(
    (colIndex: number, width: number) => {
      setTableColSize(
        editor,
        { colIndex, width },
        { at: findNodePath(editor, element)! }
      );

      // Prevent flickering
      setTimeout(() => overrideColSize(colIndex, null), 0);
    },
    [editor, element, overrideColSize]
  );

  /* eslint-disable @typescript-eslint/no-shadow */
  const setRowSize = React.useCallback(
    (rowIndex: number, height: number) => {
      setTableRowSize(
        editor,
        { height, rowIndex },
        { at: findNodePath(editor, element)! }
      );

      // Prevent flickering
      setTimeout(() => overrideRowSize(rowIndex, null), 0);
    },
    [editor, element, overrideRowSize]
  );

  const setMarginLeft = React.useCallback(
    (marginLeft: number) => {
      setTableMarginLeft(
        editor,
        { marginLeft },
        { at: findNodePath(editor, element)! }
      );

      // Prevent flickering
      setTimeout(() => overrideMarginLeft(null), 0);
    },
    [editor, element, overrideMarginLeft]
  );

  const handleResizeRight = React.useCallback(
    ({ delta, finished, initialSize: currentInitial }: ResizeEvent) => {
      const nextInitial = colSizesWithoutOverrides[colIndex + 1];

      const complement = (width: number) =>
        currentInitial + nextInitial - width;

      const currentNew = roundCellSizeToStep(
        resizeLengthClampStatic(currentInitial + delta, {
          max: nextInitial ? complement(minColumnWidth) : undefined,
          min: minColumnWidth,
        }),
        stepX
      );

      const nextNew = nextInitial ? complement(currentNew) : undefined;

      const fn = finished ? setColSize : overrideColSize;
      fn(colIndex, currentNew);

      if (nextNew) fn(colIndex + 1, nextNew);
    },
    [
      colIndex,
      colSizesWithoutOverrides,
      minColumnWidth,
      overrideColSize,
      setColSize,
      stepX,
    ]
  );

  const handleResizeBottom = React.useCallback(
    (event: ResizeEvent) => {
      const newHeight = roundCellSizeToStep(
        event.initialSize + event.delta,
        stepY
      );

      if (event.finished) {
        setRowSize(rowIndex, newHeight);
      } else {
        overrideRowSize(rowIndex, newHeight);
      }
    },
    [overrideRowSize, rowIndex, setRowSize, stepY]
  );

  const handleResizeLeft = React.useCallback(
    (event: ResizeEvent) => {
      const initial = colSizesWithoutOverrides[colIndex];

      const complement = (width: number) => initial + marginLeft - width;

      const newMargin = roundCellSizeToStep(
        resizeLengthClampStatic(marginLeft + event.delta, {
          max: complement(minColumnWidth),
          min: 0,
        }),
        stepX
      );

      const newWidth = complement(newMargin);

      if (event.finished) {
        setMarginLeft(newMargin);
        setColSize(colIndex, newWidth);
      } else {
        overrideMarginLeft(newMargin);
        overrideColSize(colIndex, newWidth);
      }
    },
    [
      colIndex,
      colSizesWithoutOverrides,
      marginLeft,
      minColumnWidth,
      overrideColSize,
      overrideMarginLeft,
      setColSize,
      setMarginLeft,
      stepX,
    ]
  );

  /* eslint-disable @typescript-eslint/no-shadow */
  const getHandleHoverProps = (colIndex: number) => ({
    onHover: () => {
      if (hoveredColIndex === null) {
        setHoveredColIndex(colIndex);
      }
    },
    onHoverEnd: () => {
      if (hoveredColIndex === colIndex) {
        setHoveredColIndex(null);
      }
    },
  });

  const hasLeftHandle = colIndex === 0 && !disableMarginLeft;

  return {
    bottomProps: {
      options: {
        direction: 'bottom',
        onResize: handleResizeBottom,
      },
    },
    hiddenLeft: !hasLeftHandle,
    leftProps: {
      options: {
        direction: 'left',
        onResize: handleResizeLeft,
        ...getHandleHoverProps(-1),
      },
    },
    rightProps: {
      options: {
        direction: 'right',
        initialSize: initialWidth,
        onResize: handleResizeRight,
        ...getHandleHoverProps(colIndex),
      },
    },
  };
};
