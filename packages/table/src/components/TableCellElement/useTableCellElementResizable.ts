import { ComponentPropsWithoutRef, useCallback } from 'react';
import {
  findNodePath,
  getPluginOptions,
  useElement,
  usePlateEditorRef,
} from '@udecode/plate-common';
import {
  ResizeEvent,
  ResizeHandle,
  resizeLengthClampStatic,
} from '@udecode/plate-resizable';

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
} from '../../transforms/index';
import { TablePlugin, TTableCellElement, TTableElement } from '../../types';
import { useTableColSizes } from '../TableElement/useTableColSizes';
import { roundCellSizeToStep } from './roundCellSizeToStep';
import { TableCellElementState } from './useTableCellElementState';

export type TableCellElementResizableOptions = Pick<
  TableCellElementState,
  'colIndex' | 'rowIndex' | 'colSpan'
> & {
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

export const useTableCellElementResizableState = ({
  colIndex,
  rowIndex,
  colSpan,
  step,
  stepX = step,
  stepY = step,
}: TableCellElementResizableOptions) => {
  const editor = usePlateEditorRef();
  const { disableMarginLeft } = getPluginOptions<TablePlugin>(
    editor,
    ELEMENT_TABLE
  );

  return {
    disableMarginLeft,
    colIndex,
    rowIndex,
    colSpan,
    stepX,
    stepY,
  };
};

export const useTableCellElementResizable = ({
  disableMarginLeft,
  colIndex,
  rowIndex,
  colSpan,
  stepX,
  stepY,
}: ReturnType<typeof useTableCellElementResizableState>): {
  rightProps: ComponentPropsWithoutRef<typeof ResizeHandle>;
  bottomProps: ComponentPropsWithoutRef<typeof ResizeHandle>;
  leftProps: ComponentPropsWithoutRef<typeof ResizeHandle>;
  hiddenLeft: boolean;
} => {
  const editor = usePlateEditorRef();
  const element = useElement<TTableCellElement>();
  const tableElement = useElement<TTableElement>(ELEMENT_TABLE);
  const { minColumnWidth = 0 } = getPluginOptions<TablePlugin>(
    editor,
    ELEMENT_TABLE
  );

  // override width for horizontally merged cell
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
      // console.log(
      //   'currentInitial',
      //   currentInitial,
      //   'currentNew',
      //   currentNew,
      //   'colSizesWithoutOverrides',
      //   colSizesWithoutOverrides,
      //   'nextInitial',
      //   nextInitial,
      //   'nextNew',
      //   nextNew,
      //   'finished',
      //   finished
      // );

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
      // console.log('hovering over handle', colIndex);
      if (hoveredColIndex === null) {
        // console.log('setting hovered col index', colIndex);
        setHoveredColIndex(colIndex);
      }
    },
    onHoverEnd: () => {
      if (hoveredColIndex === colIndex) {
        // console.log('unsetting hovered col index');
        setHoveredColIndex(null);
      }
    },
  });

  const hasLeftHandle = colIndex === 0 && !disableMarginLeft;

  return {
    rightProps: {
      options: {
        direction: 'right',
        initialSize: initialWidth,
        onResize: handleResizeRight,
        ...getHandleHoverProps(colIndex),
      },
    },
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
  };
};
