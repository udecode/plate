import React from 'react';
import {
  TableRowElement,
  TableRowElementRootProps,
} from '@udecode/plate-table';
import tw from 'twin.macro';

export interface PlateTableRowElementProps extends TableRowElementRootProps {
  hideBorder?: boolean;
}

export const PlateTableRowElement = (props: PlateTableRowElementProps) => {
  const { as, children, hideBorder, ...rootProps } = props;

  return (
    <TableRowElement.Root
      css={[tw`h-full`, hideBorder && tw`border-none`]}
      {...rootProps}
    >
      {children}
    </TableRowElement.Root>
  );
};
