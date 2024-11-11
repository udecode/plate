import React from 'react';

import { findNodePath, useEditorRef } from '@udecode/plate-common/react';
import {
  type ResizeEvent,
  resizeLengthClampStatic,
} from '@udecode/plate-resizable';

import {
  type TTableElement,
  setTableColSize,
  setTableMarginLeft,
  setTableRowSize,
} from '../../../lib';
import {
  useOverrideColSize,
  useOverrideMarginLeft,
  useOverrideRowSize,
  useTableStore,
} from '../../stores';
import { roundCellSizeToStep } from '../TableCellElement';
import { useReSizerOffset } from './useResizerOffset';

export type TableElementResizableOptions = {
  /** Resize by step instead of by pixel. */
  step?: number;

  /** Overrides for X and Y axes. */
  stepX?: number;
  stepY?: number;
};

export const useTableResizableState = ({
  step,
  stepX = step,
  stepY = step,
}: TableElementResizableOptions) => {
  const hoveredColIndex = useTableStore().get.hoveredColIndex();
  const hoveredRowIndex = useTableStore().get.hoveredRowIndex();

  return {
    hoveredColIndex,
    hoveredRowIndex,
    stepX,
    stepY,
  };
};

export interface TableResizeOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  element: TTableElement;
  isSelectingCell: boolean;
  minColumnWidth: number;
  resizeOffset?: number;
}

export const useTableResize = ({
  containerRef,
  element,
  hoveredColIndex,
  hoveredRowIndex,
  isSelectingCell,
  minColumnWidth,
  resizeOffset = 2,
  stepX,
  stepY,
}: ReturnType<typeof useTableResizableState> & TableResizeOptions) => {
  const editor = useEditorRef();

  const overrideColSize = useOverrideColSize();
  const overrideRowSize = useOverrideRowSize();
  const overrideMarginLeft = useOverrideMarginLeft();
  const setHoveredColIndex = useTableStore().set.hoveredColIndex();
  const setHoveredRowIndex = useTableStore().set.hoveredRowIndex();

  const [currentColIndex, setCurrentColIndex] = React.useState<number | null>(
    null
  );
  const [currentRowIndex, setCurrentRowIndex] = React.useState<number | null>(
    null
  );

  const { marginLeft = 0 } = element;

  React.useEffect(() => {
    if (isSelectingCell) return;
    if (currentColIndex === null && currentRowIndex === null) {
      if (hoveredColIndex !== null) {
        setCurrentColIndex(hoveredColIndex);
      }
      if (hoveredRowIndex !== null) {
        setCurrentRowIndex(hoveredRowIndex);
      }
    }
  }, [
    currentColIndex,
    currentRowIndex,
    hoveredColIndex,
    hoveredRowIndex,
    isSelectingCell,
  ]);

  const {
    initialColSize,
    initialRowSize,
    lastValidOffsets,
    nextInitialColSize,
  } = useReSizerOffset({
    containerRef,
    currentColIndex,
    currentRowIndex,
    marginLeft,
  });

  const resetCol = React.useCallback(() => {
    setCurrentColIndex(null);
    setHoveredColIndex(null);
  }, [setHoveredColIndex]);

  const resetRow = React.useCallback(() => {
    setCurrentRowIndex(null);
    setHoveredRowIndex(null);
  }, [setHoveredRowIndex]);

  const setColSize = React.useCallback(
    (colIndex: number, width: number) => {
      setTableColSize(
        editor,
        { colIndex, width },
        { at: findNodePath(editor, element)! }
      );
    },
    [editor, element]
  );

  const setRowSize = React.useCallback(
    (rowIndex: number, height: number) => {
      setTableRowSize(
        editor,
        { height, rowIndex },
        { at: findNodePath(editor, element)! }
      );
    },
    [editor, element]
  );

  const setMarginLeftSize = React.useCallback(
    (marginLeft: number) => {
      setTableMarginLeft(
        editor,
        { marginLeft },
        { at: findNodePath(editor, element)! }
      );
    },
    [editor, element]
  );

  const handleResizeRight = React.useCallback(
    ({ delta, finished }: ResizeEvent) => {
      if (currentColIndex === null) return;
      if (initialColSize + delta < minColumnWidth) return;

      const complement = (width: number) =>
        initialColSize + nextInitialColSize - width;

      const currentNew = roundCellSizeToStep(
        resizeLengthClampStatic(initialColSize + delta, {
          max: nextInitialColSize ? complement(minColumnWidth) : undefined,
          min: minColumnWidth,
        }),
        stepX
      );

      const nextNew = nextInitialColSize ? complement(currentNew) : undefined;

      const fn = finished ? setColSize : overrideColSize;
      fn(currentColIndex, currentNew);

      if (nextNew) fn(currentColIndex + 1, nextNew);
    },
    [
      currentColIndex,
      initialColSize,
      minColumnWidth,
      nextInitialColSize,
      overrideColSize,
      setColSize,
      stepX,
    ]
  );

  const handleResizeRow = React.useCallback(
    ({ delta, finished }: ResizeEvent) => {
      if (currentRowIndex === null) return;

      const newHeight = roundCellSizeToStep(initialRowSize + delta, stepY);

      if (finished) {
        setRowSize(currentRowIndex, newHeight);
      } else {
        overrideRowSize(currentRowIndex, newHeight);
      }
    },
    [currentRowIndex, initialRowSize, stepY, setRowSize, overrideRowSize]
  );

  const handleResizeLeft = React.useCallback(
    ({ delta, finished }: ResizeEvent) => {
      if (currentColIndex === null) return;

      const complement = (width: number) => initialColSize + marginLeft - width;

      const newMargin = roundCellSizeToStep(
        resizeLengthClampStatic(marginLeft + delta, {
          max: complement(minColumnWidth),
          min: 0,
        }),
        stepX
      );

      const newWidth = complement(newMargin);

      if (finished) {
        setMarginLeftSize(newMargin);
        setColSize(currentColIndex + 1, newWidth);
      } else {
        overrideMarginLeft(newMargin);
        overrideColSize(currentColIndex + 1, newWidth);
      }
    },
    [
      currentColIndex,
      initialColSize,
      marginLeft,
      minColumnWidth,
      overrideColSize,
      overrideMarginLeft,
      setColSize,
      setMarginLeftSize,
      stepX,
    ]
  );

  const resizeHandleProps = {
    bottomProps: {
      options: {
        direction: 'bottom' as const,
        onHoverEnd: resetRow,
        onResize: handleResizeRow,
      },
      style: {
        top: lastValidOffsets.current.row - resizeOffset,
      },
    },
    leftProps: {
      options: {
        direction: 'left' as const,
        onHoverEnd: () => {
          if (currentColIndex !== -1) return;

          resetCol();
        },
        onResize: handleResizeLeft,
      },
      style: {
        left: lastValidOffsets.current.colLeft,
      },
    },

    rightProps: {
      options: {
        direction: 'right' as const,
        onHoverEnd: resetCol,
        onResize: handleResizeRight,
      },
      style: {
        left: lastValidOffsets.current.col - resizeOffset,
      },
    },
  };

  return {
    currentColIndex,
    currentRowIndex,
    resizeHandleProps,
    resizeStyle: {
      height: containerRef.current?.querySelector('table')?.clientHeight,
      width: '100%',
    },
  };
};
