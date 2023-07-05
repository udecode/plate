import React, { useCallback } from 'react';
import {
  createComponentAs,
  findNodePath,
  getPluginOptions,
  HTMLPropsAs,
  useElement,
  usePlateEditorRef,
} from '@udecode/plate-common';
import {
  ResizeEvent,
  ResizeHandle,
  ResizeHandleProps,
  resizeLengthClampStatic,
} from '@udecode/resizable';
import { ELEMENT_TABLE } from '../../createTablePlugin';
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
} from '../../transforms';
import { TablePlugin, TTableElement } from '../../types';
import { useTableColSizes } from '../TableElement/useTableColSizes';
import { roundCellSizeToStep } from './roundCellSizeToStep';
import { TableCellElementState } from './useTableCellElementState';

export type TableCellElementResizableProps = HTMLPropsAs<'div'> &
  Pick<TableCellElementState, 'colIndex' | 'rowIndex' | 'readOnly'> & {
    /**
     * Resize by step instead of by pixel.
     */
    step?: number;

    /**
     * Overrides for X and Y axes.
     */
    stepX?: number;
    stepY?: number;
  };

export const useTableCellElementResizableProps = ({
  colIndex,
  rowIndex,
  step,
  stepX = step,
  stepY = step,
}: TableCellElementResizableProps): {
  rightProps: ResizeHandleProps;
  bottomProps: ResizeHandleProps;
  leftProps: ResizeHandleProps;
} => {
  const editor = usePlateEditorRef();
  const element = useElement();
  const tableElement = useElement<TTableElement>();
  const { minColumnWidth = 0 } = getPluginOptions<TablePlugin>(
    editor,
    ELEMENT_TABLE
  );

  const [
    hoveredColIndex,
    setHoveredColIndex,
  ] = useTableStore().use.hoveredColIndex();

  const colSizesWithoutOverrides = useTableColSizes(tableElement, {
    disableOverrides: true,
  });
  const { marginLeft = 0 } = tableElement;

  const overrideColSize = useOverrideColSize();
  const overrideRowSize = useOverrideRowSize();
  const overrideMarginLeft = useOverrideMarginLeft();

  /* eslint-disable @typescript-eslint/no-shadow */
  const setColSize = useCallback(
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
  const setRowSize = useCallback(
    (rowIndex: number, height: number) => {
      setTableRowSize(
        editor,
        { rowIndex, height },
        { at: findNodePath(editor, element)! }
      );

      // Prevent flickering
      setTimeout(() => overrideRowSize(rowIndex, null), 0);
    },
    [editor, element, overrideRowSize]
  );

  const setMarginLeft = useCallback(
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

  const handleResizeRight = useCallback(
    ({ initialSize: currentInitial, delta, finished }: ResizeEvent) => {
      const nextInitial = colSizesWithoutOverrides[colIndex + 1];

      const complement = (width: number) =>
        currentInitial + nextInitial - width;

      const currentNew = roundCellSizeToStep(
        resizeLengthClampStatic(currentInitial + delta, {
          min: minColumnWidth,
          max: nextInitial ? complement(minColumnWidth) : undefined,
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

  const handleResizeBottom = useCallback(
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

  const handleResizeLeft = useCallback(
    (event: ResizeEvent) => {
      const initial = colSizesWithoutOverrides[colIndex];

      const complement = (width: number) => initial + marginLeft - width;

      const newMargin = roundCellSizeToStep(
        resizeLengthClampStatic(marginLeft + event.delta, {
          min: 0,
          max: complement(minColumnWidth),
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

  const commonHandleProps = {
    startMargin: -12,
  };

  return {
    rightProps: {
      direction: 'right',
      onResize: handleResizeRight,
      ...getHandleHoverProps(colIndex),
      ...commonHandleProps,
    },
    bottomProps: {
      direction: 'bottom',
      onResize: handleResizeBottom,
      ...commonHandleProps,
    },
    leftProps: {
      direction: 'left',
      onResize: handleResizeLeft,
      ...getHandleHoverProps(-1),
      ...commonHandleProps,
    },
  };
};

export const TableCellElementResizable = createComponentAs<TableCellElementResizableProps>(
  (props) => {
    const editor = usePlateEditorRef();
    const { disableMarginLeft } = getPluginOptions<TablePlugin>(
      editor,
      ELEMENT_TABLE
    );
    const { readOnly, colIndex } = props;
    const {
      rightProps,
      bottomProps,
      leftProps,
    } = useTableCellElementResizableProps(props);

    const hasLeftHandle = colIndex === 0 && !disableMarginLeft;

    return (
      !readOnly && (
        <>
          <ResizeHandle {...rightProps} />
          <ResizeHandle {...bottomProps} />
          {hasLeftHandle && <ResizeHandle {...leftProps} />}
        </>
      )
    );
  }
);
