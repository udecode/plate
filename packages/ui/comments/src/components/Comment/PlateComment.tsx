import React from 'react';
import { PlateAvatar } from '../Avatar';
import { PlateCommentMenuButton } from '../CommentMenuButton';
import {
  CommentProvider,
  useComment,
  useCommentText,
  useCommentUser,
} from '../CommentProvider';
import { PlateResolveCommentButton } from '../CommentResolveButton';
import { useCommentById, useCommentsSelectors } from '../CommentsProvider';
import { PlateCommentValue } from '../CommentValue/PlateCommentValue';
import {
  commentsHeaderCss,
  threadCommentHeaderCreatedDateCss,
  threadCommentHeaderInfoCss,
  threadCommentHeaderUserNameCss,
  threadCommentRootCss,
  threadCommentTextCss,
} from './styles';

type PlateCommentProps = {
  commentId: string;
};

const PlateCommentContent = () => {
  const comment = useComment()!;
  const isReplyComment = !!comment.parentId;
  const commentText = useCommentText();
  const user = useCommentUser();
  const myUserId = useCommentsSelectors().myUserId();

  const isMyComment = myUserId === comment.userId;

  // TODO
  const isEditing = false;

  return (
    <div css={threadCommentRootCss}>
      <div css={commentsHeaderCss}>
        <PlateAvatar userId={comment.userId} />

        <div css={threadCommentHeaderInfoCss}>
          <div css={threadCommentHeaderUserNameCss}>{user?.name}</div>

          <div css={threadCommentHeaderCreatedDateCss}>
            {new Date(comment.createdAt).toLocaleString()}
          </div>
        </div>

        {isMyComment && (
          <div tw="flex space-x-1">
            {!isReplyComment ? <PlateResolveCommentButton /> : null}

            <PlateCommentMenuButton />
          </div>
        )}
      </div>

      <div tw="pl-10">
        {isEditing ? (
          <PlateCommentValue />
        ) : (
          <div css={threadCommentTextCss}>{commentText}</div>
        )}
      </div>
    </div>
  );
};

export const PlateComment = ({ commentId }: PlateCommentProps) => {
  const comment = useCommentById(commentId);
  if (!comment) return null;

  return (
    <CommentProvider key={commentId} id={commentId}>
      <PlateCommentContent />
    </CommentProvider>
  );
};
