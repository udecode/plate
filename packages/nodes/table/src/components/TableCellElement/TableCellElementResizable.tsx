import React, { useCallback } from 'react';
import {
  createComponentAs,
  findNodePath,
  getPluginOptions,
  HTMLPropsAs,
  isDefined,
  useElement,
  usePlateEditorRef,
} from '@udecode/plate-common';
import {
  ResizeEvent,
  ResizeHandle,
  ResizeHandleProps,
} from '@udecode/resizable';
import tw from 'twin.macro';
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
  wrapperProps: HTMLPropsAs<'div'>;
  rightProps: ResizeHandleProps;
  bottomProps: ResizeHandleProps;
  leftProps: ResizeHandleProps;
} => {
  const editor = usePlateEditorRef();
  const element = useElement();
  const tableElement = useElement<TTableElement>(ELEMENT_TABLE);
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
    (event: ResizeEvent) => {
      const [currentInitial, nextInitial] = colSizesWithoutOverrides.slice(
        colIndex,
        colIndex + 2
      );

      const minDelta = minColumnWidth - currentInitial;
      const maxDelta = isDefined(nextInitial)
        ? nextInitial - minColumnWidth
        : Infinity;
      const clampedDelta = Math.min(Math.max(event.delta, minDelta), maxDelta);
      const roundedDelta = roundCellSizeToStep(clampedDelta, stepX);

      const fn = event.finished ? setColSize : overrideColSize;

      fn(colIndex, currentInitial + roundedDelta);

      if (isDefined(nextInitial)) {
        fn(colIndex + 1, nextInitial - roundedDelta);
      }
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
      const roundedDelta = roundCellSizeToStep(event.delta, stepY);

      const fn = event.finished ? setRowSize : overrideRowSize;
      fn(rowIndex, event.initialSize + roundedDelta);
    },
    [overrideRowSize, rowIndex, setRowSize, stepY]
  );

  const handleResizeLeft = useCallback(
    (event: ResizeEvent) => {
      const initial = colSizesWithoutOverrides[colIndex];

      const minDelta = -marginLeft;
      const maxDelta = initial - minColumnWidth;
      const clampedDelta = Math.min(Math.max(event.delta, minDelta), maxDelta);
      const roundedDelta = roundCellSizeToStep(clampedDelta, stepX);

      const { finished } = event;
      (finished ? setColSize : overrideColSize)(
        colIndex,
        initial - roundedDelta
      );
      (finished ? setMarginLeft : overrideMarginLeft)(
        marginLeft + roundedDelta
      );
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
    wrapperProps: {
      css: [tw`relative w-full h-full`],
    },
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
      wrapperProps,
      rightProps,
      bottomProps,
      leftProps,
    } = useTableCellElementResizableProps(props);

    const hasLeftHandle = colIndex === 0 && !disableMarginLeft;

    return (
      !readOnly && (
        <div {...wrapperProps}>
          <ResizeHandle {...rightProps} />
          <ResizeHandle {...bottomProps} />
          {hasLeftHandle && <ResizeHandle {...leftProps} />}
        </div>
      )
    );
  }
);
