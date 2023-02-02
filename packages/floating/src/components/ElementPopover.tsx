import React from 'react';
import { isCollapsed, usePlateEditorState } from '@udecode/plate-core';
import { useReadOnly, useSelected } from 'slate-react';
import { Popover, PopoverProps } from './Popover';

/**
 * Popover displayed over an element if:
 * - not read-only
 * - element selected
 */
export const ElementPopover = ({
  floatingOptions = {},
  ...props
}: PopoverProps) => {
  const readOnly = useReadOnly();
  const selected = useSelected();

  const editor = usePlateEditorState();

  return (
    <Popover
      floatingOptions={{
        open: !readOnly && selected && isCollapsed(editor.selection),
        ...floatingOptions,
      }}
      {...props}
    />
  );
};
