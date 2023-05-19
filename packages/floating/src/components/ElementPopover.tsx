import React from 'react';
import { isCollapsed, usePlateEditorState } from '@udecode/plate-common';
import { useReadOnly, useSelected } from 'slate-react';
import { Popover, PopoverProps } from './Popover';

/**
 * Popover displayed over an element if:
 * - not disabled
 * - not read-only
 * - element selected
 */
export function ElementPopover({
  floatingOptions = {},
  ...props
}: PopoverProps) {
  const { disabled } = props;

  const readOnly = useReadOnly();
  const selected = useSelected();

  const editor = usePlateEditorState();

  return (
    <Popover
      floatingOptions={{
        open:
          !disabled && !readOnly && selected && isCollapsed(editor.selection),
        ...floatingOptions,
      }}
      {...props}
    />
  );
}
