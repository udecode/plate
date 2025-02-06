import React from 'react';

import {
  type ResizeEvent,
  type ResizeHandle,
  resizeLengthClampStatic,
} from '@udecode/plate-resizable';
import {
  useEditorPlugin,
  useElement,
  useElementSelector,
} from '@udecode/plate/react';

import type { TableCellElementState } from './useTableCellElement';

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
} from '../../stores';
import { TablePlugin } from '../../TablePlugin';
import { useTableColSizes } from '../TableElement/useTableColSizes';
import { roundCellSizeToStep } from './roundCellSizeToStep';

export type TableCellElementResizableOptions = {
  /** Resize by step instead of by pixel. */
  step?: number;
  /** Overrides for X and Y axes. */
  stepX?: number;
  stepY?: number;
} & Pick<TableCellElementState, 'colIndex' | 'colSpan' | 'rowIndex'>;

export const useTableCellElementResizable = ({
  colIndex,
  colSpan,
  rowIndex,
  step,
  stepX = step,
  stepY = step,
}: TableCellElementResizableOptions): {
  bottomProps: React.ComponentPropsWithoutRef<typeof ResizeHandle>;
  hiddenLeft: boolean;
  leftProps: React.ComponentPropsWithoutRef<typeof ResizeHandle>;
  rightProps: React.ComponentPropsWithoutRef<typeof ResizeHandle>;
} => {
  const { editor, getOptions } = useEditorPlugin(TablePlugin);
  const element = useElement();
  const { disableMarginLeft, minColumnWidth = 0 } = getOptions();

  const initialWidth = useElementSelector(
    ([node]) =>
      colSpan > 1 ? (node as TTableElement).colSizes?.[colIndex] : undefined,
    [colSpan, colIndex],
    { key: TablePlugin.key }
  );
  const marginLeft = useElementSelector(
    ([node]) => (node as TTableElement).marginLeft ?? 0,
    [],
    { key: TablePlugin.key }
  );

  const colSizesWithoutOverrides = useTableColSizes({ disableOverrides: true });
  const colSizesWithoutOverridesRef = React.useRef(colSizesWithoutOverrides);
  React.useEffect(() => {
    colSizesWithoutOverridesRef.current = colSizesWithoutOverrides;
  }, [colSizesWithoutOverrides]);

  const overrideColSize = useOverrideColSize();
  const overrideRowSize = useOverrideRowSize();
  const overrideMarginLeft = useOverrideMarginLeft();

  const setColSize = React.useCallback(
    (colIndex: number, width: number) => {
      setTableColSize(editor, { colIndex, width }, { at: element });

      // Prevent flickering
      setTimeout(() => overrideColSize(colIndex, null), 0);
    },
    [editor, element, overrideColSize]
  );

  const setRowSize = React.useCallback(
    (rowIndex: number, height: number) => {
      setTableRowSize(editor, { height, rowIndex }, { at: element });

      // Prevent flickering
      setTimeout(() => overrideRowSize(rowIndex, null), 0);
    },
    [editor, element, overrideRowSize]
  );

  const setMarginLeft = React.useCallback(
    (marginLeft: number) => {
      setTableMarginLeft(editor, { marginLeft }, { at: element });

      // Prevent flickering
      setTimeout(() => overrideMarginLeft(null), 0);
    },
    [editor, element, overrideMarginLeft]
  );

  const handleResizeRight = React.useCallback(
    ({ delta, finished, initialSize: currentInitial }: ResizeEvent) => {
      const nextInitial = colSizesWithoutOverridesRef.current[colIndex + 1];

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
    [colIndex, minColumnWidth, overrideColSize, setColSize, stepX]
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
      const initial = colSizesWithoutOverridesRef.current[colIndex];

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
      marginLeft,
      minColumnWidth,
      overrideColSize,
      overrideMarginLeft,
      setColSize,
      setMarginLeft,
      stepX,
    ]
  );

  const hasLeftHandle = colIndex === 0 && !disableMarginLeft;

  return {
    bottomProps: React.useMemo(
      () => ({
        options: {
          direction: 'bottom',
          onResize: handleResizeBottom,
        },
      }),
      [handleResizeBottom]
    ),
    hiddenLeft: !hasLeftHandle,
    leftProps: React.useMemo(
      () => ({
        options: {
          direction: 'left',
          onResize: handleResizeLeft,
        },
      }),
      [handleResizeLeft]
    ),
    rightProps: React.useMemo(
      () => ({
        options: {
          direction: 'right',
          initialSize: initialWidth,
          onResize: handleResizeRight,
        },
      }),
      [initialWidth, handleResizeRight]
    ),
  };
};
