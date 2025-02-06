import { usePluginOption } from '@udecode/plate/react';

import { CommentsPlugin } from '../CommentsPlugin';
import {
  useComment,
  useCommentText,
  useCommentUser,
  useCommentValue,
} from '../stores';

export const useCommentItemContentState = () => {
  const comment = useComment()!;
  const isReplyComment = !!comment.parentId;
  const commentText = useCommentText();
  const user = useCommentUser();
  const myUserId = usePluginOption(CommentsPlugin, 'myUserId');
  const editingValue = useCommentValue('editingValue');

  const isMyComment = myUserId === comment.userId;

  return {
    comment,
    commentText,
    editingValue,
    isMyComment,
    isReplyComment,
    myUserId,
    user,
  };
};
