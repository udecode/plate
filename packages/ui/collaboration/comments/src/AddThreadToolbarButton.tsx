import React from 'react';
import {
  useEventPlateId,
  usePlateEditorState,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export const AddThreadToolbarButton = withPlateEventProvider(
  ({ id, onAddThread, ...props }: ToolbarButtonProps) => {
    id = useEventPlateId(id);
    const editor = usePlateEditorState(id)!;

    return (
      <ToolbarButton
        onMouseDown={(event) => {
          if (!editor) {
            return;
          }

          event.preventDefault();
          onAddThread();
        }}
        {...props}
      />
    );
  }
);
