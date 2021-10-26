import React from 'react';
import { TElement } from '@udecode/plate-core';
import { RemoveNodeButton } from '@udecode/plate-ui-button';
import { Popover, PopoverProps } from '@udecode/plate-ui-popover';

export const TablePopover = ({
  element,
  ...props
}: PopoverProps & { element: TElement }) => (
  <Popover content={<RemoveNodeButton element={element} />} {...props} />
);
