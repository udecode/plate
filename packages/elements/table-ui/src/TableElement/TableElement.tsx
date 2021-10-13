import * as React from 'react';
import { StyledElementProps } from '@udecode/plate-styled-components';
import { getTableElementStyles } from './TableElement.styles';

export const TableElement = (props: StyledElementProps) => {
  const {
    attributes,
    children,
    nodeProps,
    styles,
    element,
    classNames,
    prefixClassNames,
    ...rootProps
  } = props;

  const { root } = getTableElementStyles(props);

  return (
    <table
      {...attributes}
      css={root.css}
      className={root.className}
      {...rootProps}
      {...nodeProps}
    >
      <tbody>{children}</tbody>
    </table>
  );
};
