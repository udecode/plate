import React, { useMemo } from 'react';
import { getRootProps } from '@udecode/plate-styled-components';
import {
  ELEMENT_TABLE,
  getTableColumnIndex,
  setTableColSize,
} from '@udecode/plate-table';
import clsx from 'clsx';
import { useAtom } from 'jotai';
import { Resizable, ResizableProps } from 're-resizable';
import { ReactEditor } from 'slate-react';
import { hoveredColIndexAtom, resizingColAtom } from '../table.atoms';
import { getTableCellElementStyles } from './TableCellElement.styles';
import { TableCellElementProps } from './TableCellElement.types';

export const TableCellElement = (props: TableCellElementProps) => {
  const {
    attributes,
    children,
    nodeProps,
    element,
    resizableProps,
    editor,
  } = props;

  const rootProps = getRootProps(props);

  const [hoveredColIndex, setHoveredColIndex] = useAtom(
    hoveredColIndexAtom,
    ELEMENT_TABLE
  );
  const [, setResizingCol] = useAtom(resizingColAtom, ELEMENT_TABLE);

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
      { at: ReactEditor.findPath(editor, element) }
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
          enable={{ right: true }}
          handleStyles={{
            right: {
              top: -12,
              height: 'calc(100% + 12px)',
              zIndex: 20,
            },
          }}
          onResize={onResize}
          onResizeStop={onResizeStop}
          {...resizableProps}
        />

        <div css={handle?.css} className={handle?.className} />
      </div>
    </td>
  );
};
