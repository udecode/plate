import { useEditorPlugin } from '@udecode/plate-common/react';

import { CommentsPlugin } from '../CommentsPlugin';
import {
  useComment,
  useCommentSelectors,
  useCommentText,
  useCommentUser,
} from '../stores';

export const useCommentItemContentState = () => {
  const { useOption } = useEditorPlugin(CommentsPlugin);

  const comment = useComment()!;
  const isReplyComment = !!comment.parentId;
  const commentText = useCommentText();
  const user = useCommentUser();
  const myUserId = useOption('myUserId');
  const editingValue = useCommentSelectors().editingValue();

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
