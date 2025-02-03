import { createPrimitiveComponent } from '@udecode/plate/react';

import { useComment, useCommentStore } from '../stores/comment/CommentProvider';

export const useCommentEditButtonState = () => {
  const store = useCommentStore();
  const setIsMenuOpen = store.useSetIsMenuOpen();
  const comment = useComment()!;
  const editingValue = store.useSetEditingValue();

  return {
    comment,
    editingValue,
    setIsMenuOpen,
  };
};

export const useCommentEditButton = ({
  comment,
  editingValue,
  setIsMenuOpen,
}: ReturnType<typeof useCommentEditButtonState>) => {
  return {
    props: {
      onClick: () => {
        setIsMenuOpen(false);
        editingValue(comment.value);
      },
    },
  };
};

export const CommentEditButton = createPrimitiveComponent('button')({
  propsHook: useCommentEditButton,
  stateHook: useCommentEditButtonState,
});
