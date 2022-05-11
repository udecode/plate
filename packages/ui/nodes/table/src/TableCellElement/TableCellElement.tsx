import React, { useMemo } from 'react';
import { findNodePath, Value } from '@udecode/plate-core';
import { getRootProps } from '@udecode/plate-styled-components';
import {
  ELEMENT_TABLE,
  getTableColumnIndex,
  setTableColSize,
} from '@udecode/plate-table';
import clsx from 'clsx';
import { useAtom } from 'jotai';
import { HandleStyles, Resizable, ResizableProps } from 're-resizable';
import { useReadOnly } from 'slate-react';
import { hoveredColIndexAtom, resizingColAtom } from '../table.atoms';
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

  const [hoveredColIndex, setHoveredColIndex] = useAtom(
    hoveredColIndexAtom,
    ELEMENT_TABLE
  );
  const [, setResizingCol] = useAtom(resizingColAtom, ELEMENT_TABLE);

  const handleResize: HandleStyles | undefined =
    ignoreReadOnly || !readOnly
      ? {
          right: {
            top: -12,
            height: 'calc(100% + 12px)',
            zIndex: 20,
          },
        }
      : undefined;

  const colIndex = useMemo(
    () => getTableColumnIndex(editor, { node: element }),
    [editor, element]
  );

  const {
    root,
    content,
    resizableWrapper,
    resizable,
    handle,
  } = getTableCellElementStyles({
    ...props,
    hovered: hoveredColIndex === colIndex,
    readOnly: !ignoreReadOnly && readOnly,
  });

  const onResize: ResizableProps['onResize'] = (e, direction, ref) => {
    setResizingCol({
      index: colIndex,
      width: ref.offsetWidth,
    });
  };

  const onResizeStop: ResizableProps['onResizeStop'] = (e, direction, ref) => {
    setTableColSize(
      editor,
      { colIndex, width: ref.offsetWidth },
      { at: findNodePath(editor, element)! }
    );

    setResizingCol(null);
  };

  return (
    <td
      {...attributes}
      css={root.css}
      className={root.className}
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
          handleStyles={handleResize}
          onResize={onResize}
          onResizeStop={onResizeStop}
          {...resizableProps}
        />

        <div css={handle?.css} className={handle?.className} />
      </div>
    </td>
  );
};
