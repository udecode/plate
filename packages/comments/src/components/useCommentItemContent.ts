import {
  useComment,
  useCommentSelectors,
  useCommentsSelectors,
  useCommentText,
  useCommentUser,
} from '..';

export const useCommentItemContentState = () => {
  const comment = useComment()!;
  const isReplyComment = !!comment.parentId;
  const commentText = useCommentText();
  const user = useCommentUser();
  const myUserId = useCommentsSelectors().myUserId();
  const editingValue = useCommentSelectors().editingValue();

  const isMyComment = myUserId === comment.userId;

  return {
    comment,
    isReplyComment,
    commentText,
    user,
    myUserId,
    editingValue,
    isMyComment,
  };
};
