import { MouseEventHandler, useCallback } from 'react';

import {
  useAddCommentMark,
  useCommentsActions,
  useCommentsSelectors,
} from '../stores/index';

export const useCommentAddButton = () => {
  const addCommentMark = useAddCommentMark();
  const setFocusTextarea = useCommentsActions().focusTextarea();
  const myUserId = useCommentsSelectors().myUserId();

  const onClick = useCallback<MouseEventHandler<HTMLSpanElement>>(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      addCommentMark();
      setFocusTextarea(true);
    },
    [addCommentMark, setFocusTextarea]
  );

  return {
    props: {
      onClick,
      disabled: !myUserId,
    },
  };
};
