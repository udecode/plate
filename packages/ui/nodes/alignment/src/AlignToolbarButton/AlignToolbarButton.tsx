import React from 'react';
import { Alignment, KEY_ALIGN, setAlign } from '@udecode/plate-alignment';
import {
  getPreventDefaultHandler,
  isCollapsed,
  someNode,
  usePlateEditorState,
  withEditor,
} from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export interface AlignToolbarButtonProps extends ToolbarButtonProps {
  value: Alignment;
  pluginKey?: string;
}

export const AlignToolbarButton = withEditor(
  ({ value, pluginKey = KEY_ALIGN, ...props }: AlignToolbarButtonProps) => {
    const editor = usePlateEditorState()!;

    return (
      <ToolbarButton
        active={
          isCollapsed(editor?.selection) &&
          someNode(editor!, { match: { [pluginKey]: value } })
        }
        onMouseDown={
          editor
            ? getPreventDefaultHandler(setAlign, editor, {
                value,
                key: pluginKey,
              })
            : undefined
        }
        {...props}
      />
    );
  }
);
