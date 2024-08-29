import { createPrimitiveComponent } from '@udecode/plate-common/react';

import {
  useComment,
  useCommentActions,
} from '../stores/comment/CommentProvider';

export const useCommentEditButtonState = () => {
  const setIsMenuOpen = useCommentActions().isMenuOpen();
  const comment = useComment()!;
  const editingValue = useCommentActions().editingValue();

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
