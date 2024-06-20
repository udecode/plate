import { createPrimitiveComponent } from '@udecode/plate-common';

import { useCommentsActions } from '../stores';

export const useCommentEditCancelButton = () => {
  const setEditingReply = useCommentsActions().editingReplyId();

  return {
    props: {
      onClick: () => {
        setEditingReply(null);
      },
    },
  };
};

export const CommentEditCancelButton = createPrimitiveComponent('button')({
  propsHook: useCommentEditCancelButton,
});
