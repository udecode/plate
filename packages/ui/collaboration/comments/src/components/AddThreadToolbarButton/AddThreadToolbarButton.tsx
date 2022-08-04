import React from 'react';
import {
  useEventPlateId,
  usePlateEditorState,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';
import { OnAddThread } from '../../hooks';

export const AddThreadToolbarButton = withPlateEventProvider(
  ({
    id,
    onAddThread,
    ...props
  }: ToolbarButtonProps & {
    onAddThread: OnAddThread;
  }) => {
    id = useEventPlateId(id);
    const editor = usePlateEditorState(id)!;

    return (
      <ToolbarButton
        onMouseDown={async (event) => {
          if (!editor) {
            return;
          }

          event.preventDefault();
          await onAddThread();
        }}
        {...props}
      />
    );
  }
);
