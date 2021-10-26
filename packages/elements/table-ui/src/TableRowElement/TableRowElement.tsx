import React from 'react';
import { getTableRowElementStyles } from './TableRowElement.styles';
import { TableRowElementProps } from './TableRowElement.types';

export const TableRowElement = (props: TableRowElementProps) => {
  const {
    attributes,
    children,
    nodeProps,
    styles,
    element,
    classNames,
    prefixClassNames,
    // resizableProps,
    ...rootProps
  } = props;

  const { root } = getTableRowElementStyles(props);

  return (
    <tr
      {...attributes}
      css={root.css}
      className={root.className}
      {...rootProps}
      {...nodeProps}
    >
      {children}
    </tr>
  );
};
