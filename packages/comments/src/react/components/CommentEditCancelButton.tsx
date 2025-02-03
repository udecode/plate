import { createPrimitiveComponent } from '@udecode/plate/react';

import { useCommentStore } from '../stores';

export const useCommentEditCancelButton = () => {
  const setEditingValue = useCommentStore().useSetEditingValue();

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
