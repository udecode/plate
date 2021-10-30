import React from 'react';
import { Alignment, KEY_ALIGN, setAlign } from '@udecode/plate-alignment';
import {
  getPreventDefaultHandler,
  isCollapsed,
  someNode,
} from '@udecode/plate-common';
import { useEventEditorId, useStoreEditorState } from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-toolbar';

export interface ToolbarAlignProps extends ToolbarButtonProps {
  value: Alignment;
}

export const ToolbarAlign = ({ value, ...props }: ToolbarAlignProps) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));

  return (
    <ToolbarButton
      active={
        isCollapsed(editor?.selection) &&
        someNode(editor!, { match: { [KEY_ALIGN]: value } })
      }
      onMouseDown={
        editor
          ? getPreventDefaultHandler(setAlign, editor, {
              value,
            })
          : undefined
      }
      {...props}
    />
  );
};
