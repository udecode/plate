import { createPrimitiveComponent, useStoreSet } from '@udecode/plate/react';

import { useCommentStore } from '../stores';

export const useCommentEditCancelButton = () => {
  const setEditingValue = useStoreSet(useCommentStore(), 'editingValue');

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
