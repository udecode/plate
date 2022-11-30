import React from 'react';
import { PlateAvatar } from '../Avatar';
import {
  CommentProvider,
  useComment,
  useCommentText,
  useCommentUser,
} from '../CommentProvider';
import { useCommentById } from '../CommentsProvider';
import { PlateCommentValue } from '../CommentValue/PlateCommentValue';
import { PlateCommmentMenuButton } from '../MenuButton';
import { PlateResolveCommentButton } from '../ResolveButton';
import { PlateUnresolveCommentButton } from '../UnresolveButton/index';
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
  const isReplyComment = !!comment.threadId;
  const commentText = useCommentText();
  const user = useCommentUser();

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

        {!isReplyComment ? (
          comment.isResolved ? (
            <PlateUnresolveCommentButton />
          ) : (
            <PlateResolveCommentButton />
          )
        ) : null}

        {!isReplyComment ? <PlateCommmentMenuButton /> : null}
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
