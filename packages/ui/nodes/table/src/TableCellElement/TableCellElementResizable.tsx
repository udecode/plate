import React from 'react';
import {
  findNodePath,
  HTMLPropsAs,
  useElement,
  usePlateEditorRef,
} from '@udecode/plate-core';
import { setTableColSize } from '@udecode/plate-table';
import { HandleStyles, Resizable, ResizableProps } from 're-resizable';
import { useTableStore } from '../table.atoms';
import { TableCellElementState } from './useTableCellElementState';

export type TableCellElementResizableProps = HTMLPropsAs<'div'> &
  Pick<TableCellElementState, 'colIndex' | 'readOnly'> & {
    /**
     * Resize by step instead of by pixel.
     */
    step?: number;
  };

export const useTableCellElementResizableProps = ({
  colIndex,
  readOnly,
  step,
  ...props
}: TableCellElementResizableProps): ResizableProps => {
  const editor = usePlateEditorRef();
  const element = useElement();
  const setHoveredColIndex = useTableStore().set.hoveredColIndex();
  const setResizingCol = useTableStore().set.resizingCol();

  const handleResize: HandleStyles | undefined = !readOnly
    ? {
        right: {
          top: -12,
          height: 'calc(100% + 12px)',
          zIndex: 40,
          userSelect: 'none',
        },
      }
    : undefined;

  const onResize: ResizableProps['onResize'] = (e, direction, ref) => {
    setResizingCol({
      index: colIndex,
      width: step ? Math.round(ref.offsetWidth / step) * step : ref.offsetWidth,
    });
  };

  const onResizeStop: ResizableProps['onResizeStop'] = (e, direction, ref) => {
    setTableColSize(
      editor,
      { colIndex, width: ref.offsetWidth },
      { at: findNodePath(editor, element)! }
    );

    setResizingCol(null);
    setHoveredColIndex(null);
  };

  return {
    size: { width: '100%', height: '100%' },
    enable: { right: !readOnly },
    minWidth: 48,
    handleStyles: handleResize,
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
