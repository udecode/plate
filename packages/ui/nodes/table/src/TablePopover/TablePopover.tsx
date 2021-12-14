import React from 'react';
import { RemoveNodeButton } from '@udecode/plate-ui-button';
import { Popover } from '@udecode/plate-ui-popover';
import { TableElementProps } from '../TableElement/TableElement.types';

export const TablePopover = ({
  element,
  popoverProps,
  children,
}: TableElementProps) => (
  <Popover content={<RemoveNodeButton element={element} />} {...popoverProps}>
    {children}
  </Popover>
);
