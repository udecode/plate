import React from 'react';
import { TElement, Value } from '@udecode/plate-core';
import { StyledElementProps } from '@udecode/plate-styled-components';
import clsx from 'clsx';
import { CSSProp } from 'styled-components';
import { TableCellElement } from './TableCellElement';
import { getTableCellElementStyles } from './TableCellElement.styles';
import { useTableCellElementState } from './useTableCellElementState';

export interface TableCellElementStyles {
  content: CSSProp;
  resizableWrapper: CSSProp;
  resizable: CSSProp;
  selectedCell: CSSProp;
  handle: CSSProp;
}

export interface PlateTableCellElementProps
  extends StyledElementProps<Value, TElement, TableCellElementStyles> {
  hideBorder?: boolean;
}

export const PlateTableCellElement = (props: PlateTableCellElementProps) => {
  const { as, children, ...rootProps } = props;

  const { colIndex, readOnly, selected, hovered } = useTableCellElementState();

  const {
    root,
    content,
    resizableWrapper,
    resizable,
    handle,
  } = getTableCellElementStyles({
    ...props,
    selected,
    hovered,
    readOnly,
  });

  return (
    <TableCellElement.Root
      css={root.css}
      className={root.className}
      {...rootProps}
    >
      <TableCellElement.Content
        css={content?.css}
        className={content?.className}
      >
        {children}
      </TableCellElement.Content>

      <TableCellElement.ResizableWrapper
        css={resizableWrapper?.css}
        className={clsx(resizableWrapper?.className, 'group')}
        colIndex={colIndex}
      >
        <TableCellElement.Resizable
          css={resizable?.css}
          className={resizable?.className}
          colIndex={colIndex}
          readOnly={readOnly}
        />

        <TableCellElement.Handle
          css={handle?.css}
          className={handle?.className}
        />
      </TableCellElement.ResizableWrapper>
    </TableCellElement.Root>
  );
};
