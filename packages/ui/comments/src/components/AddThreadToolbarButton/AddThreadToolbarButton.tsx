import React, { MouseEventHandler, useCallback } from 'react';
import {
  useEventPlateId,
  usePlateEditorState,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';
import { OnAddThread } from '../../types';

type AddThreadToolbarButtonProps = {
  onAddThread?: OnAddThread;
} & ToolbarButtonProps;

export const AddThreadToolbarButton = withPlateEventProvider(
  (props: AddThreadToolbarButtonProps) => {
    const { id, onAddThread, ...otherProps } = props;

    const eventPlateId = useEventPlateId(id);
    const editor = usePlateEditorState(eventPlateId)!;

    const onMouseDown = useCallback<MouseEventHandler<HTMLSpanElement>>(
      (event) => {
        if (editor) {
          event.preventDefault();
          onAddThread?.();
        }
      },
      [editor, onAddThread]
    );

    return <ToolbarButton onMouseDown={onMouseDown} {...otherProps} />;
  }
);
