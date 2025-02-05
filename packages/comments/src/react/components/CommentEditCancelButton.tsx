import { createPrimitiveComponent } from '@udecode/plate/react';

import { useCommentSet } from '../stores';

export const useCommentEditCancelButton = () => {
  const setEditingValue = useCommentSet('editingValue');

  return {
    props: {
      onClick: () => {
        setEditingValue(null);
      },
    },
  };
};

export const CommentEditCancelButton = createPrimitiveComponent('button')({
  propsHook: useCommentEditCancelButton,
});
