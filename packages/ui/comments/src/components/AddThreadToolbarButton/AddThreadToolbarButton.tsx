import React, { MouseEventHandler, useCallback } from 'react';
import {
  useEditorState,
  useEventPlateId,
  usePlateEditorState,
  withPlateEventProvider,
} from '@udecode/plate-core';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export type AddThreadToolbarButtonProps = {
  onAddThread: () => void;
} & ToolbarButtonProps;

export const useAddThreadToolbarButton = (
  props: AddThreadToolbarButtonProps
) => {
  const { id, onAddThread, ...otherProps } = props;

  const eventPlateId = useEventPlateId(id);
  const editor = usePlateEditorState(eventPlateId)!;

  const onMouseDown = useCallback<MouseEventHandler<HTMLSpanElement>>(
    (event) => {
      if (editor) {
        event.preventDefault();
        onAddThread();
      }
    },
    [editor, onAddThread]
  );

  return {
    onMouseDown,
    otherProps,
  } as const;
};

export const AddThreadToolbarButton = withPlateEventProvider(
  (props: AddThreadToolbarButtonProps) => {
    const { onMouseDown, otherProps } = useAddThreadToolbarButton(props);

    return <ToolbarButton {...otherProps} onMouseDown={onMouseDown} />;
  }
);
