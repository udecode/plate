import React from 'react';
import { Alignment, KEY_ALIGN, setAlign } from '@udecode/plate-alignment';
import {
  getPreventDefaultHandler,
  isCollapsed,
  someNode,
} from '@udecode/plate-common';
import { usePlateEditorState } from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-toolbar';

export interface AlignToolbarButtonProps extends ToolbarButtonProps {
  value: Alignment;
}

export const AlignToolbarButton = ({
  value,
  ...props
}: AlignToolbarButtonProps) => {
  const editor = usePlateEditorState();

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
