import React, { useEffect } from 'react';
import { findNodePath, Value } from '@udecode/plate-core';
import { getRootProps } from '@udecode/plate-styled-components';
import { getTableColumnIndex, setTableColSize } from '@udecode/plate-table';
import clsx from 'clsx';
import { HandleStyles, Resizable, ResizableProps } from 're-resizable';
import { useReadOnly } from 'slate-react';
import { useIsCellSelected } from '../hooks/useIsCellSelected';
import { useTableStore } from '../table.atoms';
import { getTableCellElementStyles } from './TableCellElement.styles';
import { TableCellElementProps } from './TableCellElement.types';

export const TableCellElement = <V extends Value>(
  props: TableCellElementProps<V>
) => {
  const {
    attributes,
    children,
    nodeProps,
    element,
    resizableProps,
    editor,
    ignoreReadOnly = false,
  } = props;

  const rootProps = getRootProps(props);
  const readOnly = useReadOnly();

  const [
    hoveredColIndex,
    setHoveredColIndex,
  ] = useTableStore().use.hoveredColIndex();
  const setResizingCol = useTableStore().set.resizingCol();

  useEffect(() => {
    setHoveredColIndex(null);
  }, [element, setHoveredColIndex]);

  const isCellSelected = useIsCellSelected(element);

  const handleResize: HandleStyles | undefined =
    ignoreReadOnly || !readOnly
      ? {
          right: {
            top: -12,
            height: 'calc(100% + 12px)',
            zIndex: 40,
            userSelect: 'none',
          },
        }
      : undefined;

  const colIndex = getTableColumnIndex(editor, { node: element });

  const {
    root,
    content,
    resizableWrapper,
    resizable,
    handle,
  } = getTableCellElementStyles({
    ...props,
    selected: isCellSelected,
    hovered: hoveredColIndex === colIndex,
    readOnly: !ignoreReadOnly && readOnly,
  });

  const onResize: ResizableProps['onResize'] = (e, direction, ref) => {
    const step = resizableProps?.step;

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

  return (
    <td
      {...attributes}
      css={root.css}
      className={root.className}
      draggable={false}
      {...rootProps}
      {...nodeProps}
    >
      <div css={content?.css} className={content?.className}>
        {children}
      </div>

      <div
        css={resizableWrapper?.css}
        className={clsx(resizableWrapper?.className, 'group')}
        contentEditable={false}
        onMouseOver={() => setHoveredColIndex(colIndex)}
        onFocus={() => setHoveredColIndex(colIndex)}
        onMouseOut={() => setHoveredColIndex(null)}
        onBlur={() => setHoveredColIndex(null)}
      >
        <Resizable
          // @ts-ignore
          css={resizable?.css}
          className={resizable?.className}
          size={{ width: '100%', height: '100%' }}
          enable={{ right: ignoreReadOnly || !readOnly }}
          minWidth={48}
          handleStyles={handleResize}
          snapGap={10}
          onResize={onResize}
          onResizeStop={onResizeStop}
          {...resizableProps}
        />

        <div css={handle?.css} className={handle?.className} />
      </div>
    </td>
  );
};
