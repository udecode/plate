import { createPrimitiveComponent } from '@udecode/plate-common/react';

import { useCommentUser } from '../stores/comment/CommentProvider';

export const useCommentUserName = () => {
  const user = useCommentUser();

  return {
    props: {
      children: user?.name ?? 'Anonymous',
    },
  };
};

export const CommentUserName = createPrimitiveComponent('div')({
  propsHook: useCommentUserName,
});
