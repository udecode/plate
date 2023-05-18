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
import { PlateAvatar } from './PlateAvatar';
import { PlateCommentMenuButton } from './PlateCommentMenuButton';
import { PlateCommentResolveButton } from './PlateCommentResolveButton';
import { PlateCommentValue } from './PlateCommentValue';

type PlateCommentProps = {
  commentId: string;
};

function PlateCommentContent() {
  const comment = useComment()!;
  const isReplyComment = !!comment.parentId;
  const commentText = useCommentText();
  const user = useCommentUser();
  const myUserId = useCommentsSelectors().myUserId();
  const editingValue = useCommentSelectors().editingValue();

  const isMyComment = myUserId === comment.userId;

  return (
    <div>
      <div className="m-0 box-content flex h-10 cursor-default items-center whitespace-nowrap text-left text-sm font-normal text-black">
        <PlateAvatar userId={comment.userId} />

        <div className="ml-2 flex grow cursor-pointer flex-col items-start justify-center truncate text-left text-sm font-normal text-black">
          <div className="h-4 cursor-default self-stretch truncate text-left text-sm font-medium leading-5 tracking-wide text-[rgba(60,64,67,1)]">
            {user?.name}
          </div>

          <div className="text-xs leading-4 tracking-wide text-[rgba(60,64,67,1)]">
            {new Date(comment.createdAt).toLocaleString()}
          </div>
        </div>

        {isMyComment && (
          <div className="flex space-x-1">
            {!isReplyComment ? <PlateCommentResolveButton /> : null}

            <PlateCommentMenuButton />
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

export function PlateComment({ commentId }: PlateCommentProps) {
  const comment = useCommentById(commentId);
  if (!comment) return null;

  return (
    <CommentProvider key={commentId} id={commentId}>
      <PlateCommentContent />
    </CommentProvider>
  );
}
