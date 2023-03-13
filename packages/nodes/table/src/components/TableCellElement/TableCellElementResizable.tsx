import React, { useState } from 'react';
import {
  Box,
  findNodePath,
  getPluginOptions,
  HTMLPropsAs,
  useElement,
  usePlateEditorRef,
} from '@udecode/plate-common';
import { HandleStyles, Resizable, ResizableProps } from 're-resizable';
import { ELEMENT_TABLE } from '../../createTablePlugin';
import {
  useOverrideColSize,
  useOverrideRowSize,
  useTableStore,
} from '../../stores/tableStore';
import { setTableColSize, setTableRowSize } from '../../transforms';
import { TablePlugin, TTableElement } from '../../types';
import { useTableColSizes } from '../TableElement/useTableColSizes';
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

const roundToStep = (size: number, step?: number) =>
  step ? Math.round(size / step) * step : size;

export const useTableCellElementResizableProps = ({
  colIndex,
  rowIndex,
  readOnly,
  step,
  stepX = step,
  stepY = step,
  ...props
}: TableCellElementResizableProps): ResizableProps => {
  const editor = usePlateEditorRef();
  const { minColumnWidth: minWidth } = getPluginOptions<TablePlugin>(
    editor,
    ELEMENT_TABLE
  );
  const element = useElement();
  const tableElement = useElement<TTableElement>(ELEMENT_TABLE);
  const setHoveredColIndex = useTableStore().set.hoveredColIndex();
  const [isResizingRight, setIsResizingRight] = useState(false);

  const colSizes = useTableColSizes(tableElement);
  const [initialColSize, setInitialColSize] = useState<number | null>(null);
  const [initialSiblingColSize, setInitialSiblingColSize] = useState<
    number | null
  >(null);

  const colSizeOverrides = useTableStore().get.colSizeOverrides();
  const rowSizeOverrides = useTableStore().get.rowSizeOverrides();

  const overrideColSize = useOverrideColSize();
  const overrideRowSize = useOverrideRowSize();

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

  const onResizeStart: ResizableProps['onResizeStart'] = (e, direction) => {
    if (direction === 'right') {
      setHoveredColIndex(colIndex);
      setInitialColSize(colSizes[colIndex]);
      setInitialSiblingColSize(colSizes[colIndex + 1] ?? null);
    }
  };

  const onResize: ResizableProps['onResize'] = (e, direction, ref) => {
    if (direction === 'right') {
      const newSize = roundToStep(ref.offsetWidth, stepX);

      overrideColSize(colIndex, newSize);

      if (initialColSize && initialSiblingColSize) {
        overrideColSize(
          colIndex + 1,
          initialColSize + initialSiblingColSize - newSize
        );
      }
    } else {
      overrideRowSize(rowIndex, roundToStep(ref.offsetHeight, stepY));
    }
  };

  const onResizeStop: ResizableProps['onResizeStop'] = (e, direction) => {
    if (direction === 'right') {
      colSizeOverrides.forEach((size, index) => {
        setTableColSize(editor, { colIndex: index, width: size }, { at: findNodePath(editor, element)! });

        // Prevent flickering
        setTimeout(() => overrideColSize(index, null), 0);
      });

      setHoveredColIndex(null);
      setIsResizingRight(false);
    } else {
      rowSizeOverrides.forEach((size, index) => {
        setTableRowSize(
          editor,
          { rowIndex: index, height: size },
          { at: findNodePath(editor, element)! }
        );

        // Prevent flickering
        setTimeout(() => overrideRowSize(index, null), 0);
      });
    }
  };

  const maxWidth =
    initialColSize && initialSiblingColSize
      ? initialColSize + initialSiblingColSize - (minWidth ?? 0)
      : undefined;

  return {
    size: { width: '100%', height: '100%' },
    enable: {
      right: !readOnly,
      bottom: !readOnly,
    },
    minWidth,
    maxWidth,
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
    onResizeStart,
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
