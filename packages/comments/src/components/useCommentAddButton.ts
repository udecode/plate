import { MouseEventHandler, useCallback } from 'react';
import {
  focusEditor,
  HTMLPropsAs,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-core';
import { useAddCommentMark, useCommentsActions } from '../stores/index';

export const useCommentAddButton = (
  props: HTMLPropsAs<'span'>
): HTMLPropsAs<'span'> => {
  const addCommentMark = useAddCommentMark();
  const setFocusTextarea = useCommentsActions().focusTextarea();
  const editor = usePlateEditorState(useEventPlateId());

  const onClick = useCallback<MouseEventHandler<HTMLSpanElement>>(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      addCommentMark();
      setFocusTextarea(true);
      focusEditor(editor);
    },
    [addCommentMark, editor, setFocusTextarea]
  );

  return { onClick, ...props };
};
