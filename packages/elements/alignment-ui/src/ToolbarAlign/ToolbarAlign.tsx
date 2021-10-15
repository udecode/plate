import * as React from 'react';
import { Alignment, setAlign } from '@udecode/plate-alignment';
import {
  getPreventDefaultHandler,
  isCollapsed,
  someNode,
} from '@udecode/plate-common';
import { useEventEditorId, useStoreEditorState } from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-toolbar';

export interface ToolbarAlignProps extends ToolbarButtonProps {
  align: Alignment;
}

export const ToolbarAlign = ({ align, ...props }: ToolbarAlignProps) => {
  const editor = useStoreEditorState(useEventEditorId('focus'));

  return (
    <ToolbarButton
      active={
        isCollapsed(editor?.selection) &&
        someNode(editor!, { match: { align } })
      }
      onMouseDown={
        editor
          ? getPreventDefaultHandler(setAlign, editor, {
              align,
            })
          : undefined
      }
      {...props}
    />
  );
};
