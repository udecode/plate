import {
  createPrimitiveComponent,
  useEditorPlugin,
} from '@udecode/plate-common/react';

import { CommentsPlugin } from '../CommentsPlugin';
import { useComment } from '../stores/comment/CommentProvider';

export const useCommentResolveButton = () => {
  const { api, getOptions, setOption } = useEditorPlugin(CommentsPlugin);

  const comment = useComment()!;

  return {
    props: {
      onClick: () => {
        const isResolved = !comment.isResolved;

        const value = {
          isResolved,
        };

        const { activeCommentId, onCommentUpdate } = getOptions();

        api.comment.updateComment(activeCommentId, value);

        onCommentUpdate?.({
          id: activeCommentId!,
          ...value,
        });

        if (isResolved) {
          setOption('activeCommentId', null);
        }
      },
    },
  };
};

export const CommentResolveButton = createPrimitiveComponent('button')({
  propsHook: useCommentResolveButton,
});
