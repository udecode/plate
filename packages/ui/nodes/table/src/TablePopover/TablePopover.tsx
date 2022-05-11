import React from 'react';
import { Value } from '@udecode/plate-core';
import { RemoveNodeButton } from '@udecode/plate-ui-button';
import { Popover } from '@udecode/plate-ui-popover';
import { TableElementProps } from '../TableElement/TableElement.types';

export const TablePopover = <V extends Value>({
  element,
  popoverProps,
  children,
}: TableElementProps<V>) => (
  <Popover content={<RemoveNodeButton element={element} />} {...popoverProps}>
    {children}
  </Popover>
);
