import React from 'react';
import tw from 'twin.macro';
import { TableRowElement, TableRowElementRootProps } from './TableRowElement';

export interface PlateTableRowElementProps extends TableRowElementRootProps {
  hideBorder?: boolean;
}

export const PlateTableRowElement = (props: PlateTableRowElementProps) => {
  const { as, children, hideBorder, ...rootProps } = props;

  return (
    <TableRowElement.Root css={hideBorder && tw`border-none`} {...rootProps}>
      {children}
    </TableRowElement.Root>
  );
};
