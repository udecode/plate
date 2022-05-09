import React from 'react';
import { Value } from '@udecode/plate-core';
import { getRootProps } from '@udecode/plate-styled-components';
import { getTableRowElementStyles } from './TableRowElement.styles';
import { TableRowElementProps } from './TableRowElement.types';

export const TableRowElement = <V extends Value>(
  props: TableRowElementProps<V>
) => {
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
