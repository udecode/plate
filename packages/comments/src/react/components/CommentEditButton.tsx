import { createPrimitiveComponent } from '@udecode/plate/react';

import { useComment, useCommentSet } from '../stores/comment/CommentProvider';

export const useCommentEditButton = () => {
  const comment = useComment()!;
  const setIsMenuOpen = useCommentSet('isMenuOpen');
  const setEditingValue = useCommentSet('editingValue');

  return {
    props: {
      onClick: () => {
        setIsMenuOpen(false);
        setEditingValue(comment.value);
      },
    },
  };
};

export const CommentEditButton = createPrimitiveComponent('button')({
  propsHook: useCommentEditButton,
});
