import { createPrimitiveComponent } from '@udecode/plate-common';

import {
  useComment,
  useCommentActions,
} from '../stores/comment/CommentProvider';

export const useCommentEditButtonState = () => {
  const setIsMenuOpen = useCommentActions().isMenuOpen();
  const comment = useComment()!;
  const editingValue = useCommentActions().editingValue();

  return {
    setIsMenuOpen,
    comment,
    editingValue,
  };
};

export const useCommentEditButton = ({
  setIsMenuOpen,
  comment,
  editingValue,
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
  stateHook: useCommentEditButtonState,
  propsHook: useCommentEditButton,
});
