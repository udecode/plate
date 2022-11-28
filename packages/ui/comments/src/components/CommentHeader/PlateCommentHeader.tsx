import React from 'react';
import { useCommentsSelectors } from '@udecode/plate-comments';
import { css } from 'styled-components';
import { PlateAvatar } from '../Avatar';
import { PlateResolveCommentButton } from '../ResolveButton';
import { PlateUnresolveCommentButton } from '../UnresolveButton/index';
import { CommentUserName } from './CommentUserName';
import {
  commentUserCss,
  userHeaderActionsCss,
  userHeaderAssignedToContainerCss,
  userHeaderAssignedToTextCss,
  userHeaderAvatarContainerCss,
  userHeaderRootCss,
} from './styles';

type PlateCommentHeaderProps = {
  commentId: string;
  showResolveCommentButton: boolean;
  showUnresolveCommentButton: boolean;
};

export const PlateCommentHeader = (props: PlateCommentHeaderProps) => {
  const {
    commentId,
    showUnresolveCommentButton,
    showResolveCommentButton,
  } = props;

  const comment = useCommentsSelectors().comment(commentId);

  const currentUserId = useCommentsSelectors().currentUserId();
  const isCurrentUser = currentUserId === comment.userId;

  return (
    <div
      css={[
        userHeaderRootCss,
        css`
          color: ${isCurrentUser ? 'white' : 'rgb(60, 64, 67)'};
          background-color: ${isCurrentUser ? '#1a73e8' : '#e8f0fe'};
        `,
      ]}
    >
      <div css={userHeaderAvatarContainerCss}>
        <PlateAvatar userId={comment.userId} />
      </div>

      <div css={userHeaderAssignedToContainerCss}>
        <div css={userHeaderAssignedToTextCss}>Author</div>

        <CommentUserName
          {...props}
          userId={comment.userId}
          css={commentUserCss}
        />
      </div>

      <div css={userHeaderActionsCss}>
        {showResolveCommentButton ? (
          <PlateResolveCommentButton {...props} />
        ) : null}
        {showUnresolveCommentButton ? (
          <PlateUnresolveCommentButton {...props} />
        ) : null}
      </div>
    </div>
  );
};
