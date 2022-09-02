import { MouseEventHandler, useCallback } from 'react';
import { useEventPlateId, usePlateEditorState } from '@udecode/plate-core';
import { AddThreadToolbarButtonProps } from './AddThreadToolbarButton.types';

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
