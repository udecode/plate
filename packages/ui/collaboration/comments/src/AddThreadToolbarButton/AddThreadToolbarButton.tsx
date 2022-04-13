import React from 'react';
import { ELEMENT_THREAD } from '@udecode/plate-comments';
import {
  getPluginType,
  someNode,
  useEventPlateId,
  usePlateEditorState,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export const AddThreadToolbarButton = withPlateEventProvider(
  ({ id, onAddThread, ...props }: ToolbarButtonProps) => {
    id = useEventPlateId(id);
    const editor = usePlateEditorState(id)!;

    const type = getPluginType(editor, ELEMENT_THREAD);
    const isThread =
      !!editor?.selection && someNode(editor, { match: { type } });

    return (
      <ToolbarButton
        active={isThread}
        onMouseDown={(event) => {
          if (!editor) return;

          event.preventDefault();
          onAddThread();
        }}
        {...props}
      />
    );
  }
);
