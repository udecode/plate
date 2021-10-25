import React from 'react';
import { Divider } from '@udecode/plate-styled-components';
import { RemoveNodeButton } from '@udecode/plate-ui-button';
import { Popover, PopoverProps } from '@udecode/plate-ui-popover';
import { TableMenu } from '../TableMenu/TableMenu';

export const TablePopover = (props: PopoverProps) => {
  return (
    <Popover
      content={
        <>
          <TableMenu />
          <Divider />
          <RemoveNodeButton />
        </>
      }
      {...props}
    />
  );
};
