import { useEditorPlugin } from '@udecode/plate/react';

import { CommentsPlugin } from '../CommentsPlugin';
import {
  useComment,
  useCommentText,
  useCommentUser,
  useCommentValue,
} from '../stores';

export const useCommentItemContentState = () => {
  const { useOption } = useEditorPlugin(CommentsPlugin);

  const comment = useComment()!;
  const isReplyComment = !!comment.parentId;
  const commentText = useCommentText();
  const user = useCommentUser();
  const myUserId = useOption('myUserId');
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
