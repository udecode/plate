import React from 'react';
import {
  CommentProvider,
  useComment,
  useCommentById,
  useCommentSelectors,
  useCommentsSelectors,
  useCommentText,
  useCommentUser,
} from '@udecode/plate-comments';
import { formatDistance } from 'date-fns';
import { CommentAvatar } from './CommentAvatar';
import { CommentMoreDropdown } from './CommentMoreDropdown';
import { CommentResolveButton } from './CommentResolveButton';
import { PlateCommentValue } from './PlateCommentValue';

type PlateCommentProps = {
  commentId: string;
};

function CommentItemContent() {
  const comment = useComment()!;
  const isReplyComment = !!comment.parentId;
  const commentText = useCommentText();
  const user = useCommentUser();
  const myUserId = useCommentsSelectors().myUserId();
  const editingValue = useCommentSelectors().editingValue();

  const isMyComment = myUserId === comment.userId;

  return (
    <div>
      <div className="flex items-center gap-2">
        <CommentAvatar userId={comment.userId} />

        <h4 className="text-sm font-semibold">{user?.name}</h4>

        <div className="text-xs text-muted-foreground">
          {formatDistance(comment.createdAt, Date.now())} ago
        </div>

        {isMyComment && (
          <div className="absolute right-2 top-2 flex space-x-1">
            {!isReplyComment ? <CommentResolveButton /> : null}

            <CommentMoreDropdown />
          </div>
        )}
      </div>

      <div className="pl-10">
        {editingValue ? (
          <PlateCommentValue />
        ) : (
          <div className="whitespace-pre-wrap">{commentText}</div>
        )}
      </div>
    </div>
  );
}

export function CommentItem({ commentId }: PlateCommentProps) {
  const comment = useCommentById(commentId);
  if (!comment) return null;

  return (
    <CommentProvider key={commentId} id={commentId}>
      <CommentItemContent />
    </CommentProvider>
  );
}
