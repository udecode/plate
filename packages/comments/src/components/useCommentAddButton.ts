import { MouseEventHandler, useCallback } from 'react';
import { HTMLPropsAs } from '@udecode/plate-core';
import { useAddCommentMark, useCommentsActions } from '../stores/index';

export const useCommentAddButton = (
  props: HTMLPropsAs<'span'>
): HTMLPropsAs<'span'> => {
  const addCommentMark = useAddCommentMark();
  const setFocusTextarea = useCommentsActions().focusTextarea();

  const onClick = useCallback<MouseEventHandler<HTMLSpanElement>>(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      addCommentMark();
      setFocusTextarea(true);
    },
    [addCommentMark, setFocusTextarea]
  );

  return { onClick, ...props };
};
