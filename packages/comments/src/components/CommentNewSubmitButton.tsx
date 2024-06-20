import { createPrimitiveComponent } from '@udecode/plate-common';

import {
  useActiveComments,
  useCommentsNewReply,
  useCommentsSelectors,
  useResetNewCommentValue,
} from '../stores/comments/CommentsProvider';

export const useCommentNewSubmitButtonState = () => {
  const newContent = useCommentsNewReply();

  const activeComments = useActiveComments();
  const myUserId = useCommentsSelectors().myUserId();

  const resetNewCommentValue = useResetNewCommentValue();
  const onCommentAdd = useCommentsSelectors().onCommentAdd();

  return {
    activeComments,
    myUserId,
    newContent,
    onCommentAdd,
    resetNewCommentValue,
  };
};

export const useCommentNewSubmitButton = ({
  activeComments,
  myUserId,
  newContent,
  onCommentAdd,
  resetNewCommentValue,
}: ReturnType<typeof useCommentNewSubmitButtonState>) => {
  return {
    props: {
      children: 'Comment',
      disabled: !newContent[0]?.trim().length,
      onClick: () => {
        // TODO: throw new error
        if (!activeComments || !myUserId) return;

        onCommentAdd?.(activeComments, newContent, myUserId);

        resetNewCommentValue();
      },
      type: 'submit',
    },
  };
};

export const CommentNewSubmitButton = createPrimitiveComponent('button')({
  propsHook: useCommentNewSubmitButton,
  stateHook: useCommentNewSubmitButtonState,
});
