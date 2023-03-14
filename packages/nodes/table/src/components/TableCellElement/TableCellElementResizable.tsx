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
import { getTableColSizeForSibling } from './getTableColSizeForSibling';
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

  const getNextColSize = (ownSize: number): number | undefined => {
    return initialColSize && initialSiblingColSize
      ? getTableColSizeForSibling(
          initialColSize,
          initialSiblingColSize,
          ownSize
        )
      : undefined;
  };

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
      const newSize = roundCellSizeToStep(ref.offsetWidth, stepX);
      const siblingSize = getNextColSize(newSize);

      overrideColSize(colIndex, newSize);

      if (siblingSize) {
        overrideColSize(colIndex + 1, siblingSize);
      }
    } else {
      overrideRowSize(rowIndex, roundCellSizeToStep(ref.offsetHeight, stepY));
    }
  };

  const onResizeStop: ResizableProps['onResizeStop'] = (e, direction) => {
    if (direction === 'right') {
      colSizeOverrides.forEach((size, index) => {
        setTableColSize(
          editor,
          { colIndex: index, width: size },
          { at: findNodePath(editor, element)! }
        );

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

  return {
    size: { width: '100%', height: '100%' },
    enable: {
      right: !readOnly,
      bottom: !readOnly,
    },
    minWidth,
    maxWidth: getNextColSize(minWidth ?? 0),
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
