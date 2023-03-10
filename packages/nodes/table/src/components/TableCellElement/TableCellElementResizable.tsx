import React, { useState } from 'react';
import {
  Box,
  findNodePath,
  HTMLPropsAs,
  useElement,
  usePlateEditorRef,
} from '@udecode/plate-common';
import { HandleStyles, Resizable, ResizableProps } from 're-resizable';
import { useTableRowStore } from '../../stores/tableRowStore';
import { useTableStore } from '../../stores/tableStore';
import { setTableColSize, setTableRowSize } from '../../transforms';
import { TableCellElementState } from './useTableCellElementState';

export type TableCellElementResizableProps = HTMLPropsAs<'div'> &
  Pick<TableCellElementState, 'colIndex' | 'readOnly'> & {
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

const roundToStep = (size: number, step?: number) =>
  step ? Math.round(size / step) * step : size;

export const useTableCellElementResizableProps = ({
  colIndex,
  readOnly,
  step,
  stepX = step,
  stepY = step,
  ...props
}: TableCellElementResizableProps): ResizableProps => {
  const editor = usePlateEditorRef();
  const element = useElement();
  const setHoveredColIndex = useTableStore().set.hoveredColIndex();
  const setResizingCol = useTableStore().set.resizingCol();
  const setOverrideRowSize = useTableRowStore().set.overrideSize();
  const [isResizingRight, setIsResizingRight] = useState(false);

  const handleResize: HandleStyles | undefined = !readOnly
    ? {
        right: {
          top: -12,
          height: 'calc(100% + 12px)',
          zIndex: 40,
          userSelect: 'none',
        },
        bottom: {
          left: -12,
          width: 'calc(100% + 12px)',
          zIndex: 40,
          userSelect: 'none',
        },
      }
    : undefined;

  const onMouseOverRight = () => {
    setHoveredColIndex(colIndex);
  };

  const onMouseOutRight = () => {
    if (!isResizingRight) {
      setHoveredColIndex(null);
    }
  };

  const onMouseDownRight = () => {
    setIsResizingRight(true);
  };

  const onResize: ResizableProps['onResize'] = (e, direction, ref) => {
    if (direction === 'right') {
      setHoveredColIndex(colIndex);

      setResizingCol({
        index: colIndex,
        width: roundToStep(ref.offsetWidth, stepX),
      });
    } else {
      setOverrideRowSize(roundToStep(ref.offsetHeight, stepY));
    }
  };

  const onResizeStop: ResizableProps['onResizeStop'] = (e, direction, ref) => {
    if (direction === 'right') {
      setTableColSize(
        editor,
        { colIndex, width: roundToStep(ref.offsetWidth, stepX) },
        { at: findNodePath(editor, element)! }
      );

      // Prevent flickering
      setTimeout(() => setResizingCol(null), 0);

      setHoveredColIndex(null);
      setIsResizingRight(false);
    } else {
      setTableRowSize(
        editor,
        { height: roundToStep(ref.offsetHeight, stepY) },
        { at: findNodePath(editor, element)! }
      );

      // Prevent flickering
      setTimeout(() => setOverrideRowSize(null), 0);
    }
  };

  return {
    size: { width: '100%', height: '100%' },
    enable: {
      right: !readOnly,
      bottom: !readOnly,
    },
    minWidth: 48,
    handleStyles: handleResize,
    handleComponent: {
      right: (
        <Box
          style={{ width: '100%', height: '100%' }}
          onMouseOver={onMouseOverRight}
          onMouseOut={onMouseOutRight}
          onMouseDown={onMouseDownRight}
        />
      ),
    },
    onResize,
    onResizeStop,
    ...props,
  };
};

export const TableCellElementResizable = (
  props: TableCellElementResizableProps
) => {
  const htmlProps = useTableCellElementResizableProps(props);

  return <Resizable {...htmlProps} />;
};
