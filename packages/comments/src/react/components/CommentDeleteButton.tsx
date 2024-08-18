import {
  createPrimitiveComponent,
  useEditorRef,
} from '@udecode/plate-common/react';

import { unsetCommentNodesById } from '../../lib';
import { useCommentSelectors } from '../stores/comment/CommentProvider';
import {
  useCommentsActions,
  useCommentsSelectors,
  useRemoveComment,
} from '../stores/comments/CommentsProvider';

export const useCommentDeleteButtonState = () => {
  const activeCommentId = useCommentsSelectors().activeCommentId();
  const onCommentDelete = useCommentsSelectors().onCommentDelete();
  const id = useCommentSelectors().id();
  const setActiveCommentId = useCommentsActions().activeCommentId();
  const removeComment = useRemoveComment();
  const editor = useEditorRef();

  return {
    activeCommentId,
    editor,
    id,
    onCommentDelete,
    removeComment,
    setActiveCommentId,
  };
};

export const useCommentDeleteButton = ({
  activeCommentId,
  editor,
  id,
  onCommentDelete,
  removeComment,
  setActiveCommentId,
}: ReturnType<typeof useCommentDeleteButtonState>) => {
  return {
    props: {
      onClick: () => {
        if (activeCommentId === id) {
          unsetCommentNodesById(editor, { id });
          setActiveCommentId(null);
        } else {
          removeComment(id);
        }

        onCommentDelete?.(id);
      },
    },
  };
};

export const CommentDeleteButton = createPrimitiveComponent('button')({
  propsHook: useCommentDeleteButton,
  stateHook: useCommentDeleteButtonState,
});
