import React from 'react';
import { getRootProps } from '@udecode/plate-styled-components';
import { getTableRowElementStyles } from './TableRowElement.styles';
import { TableRowElementProps } from './TableRowElement.types';

export const TableRowElement = (props: TableRowElementProps) => {
  const { attributes, children, nodeProps } = props;

  const rootProps = getRootProps(props);
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
