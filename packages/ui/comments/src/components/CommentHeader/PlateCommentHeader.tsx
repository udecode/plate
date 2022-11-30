import React from 'react';
import { css } from 'styled-components';
import { PlateAvatar } from '../Avatar';
import { useComment } from '../CommentProvider';
import { PlateResolveCommentButton } from '../CommentResolveButton';
import { useCommentsSelectors } from '../CommentsProvider';
import { PlateUnresolveCommentButton } from '../CommentUnresolveButton/index';
import { CommentUserName } from './CommentUserName';
import {
  commentUserCss,
  userHeaderActionsCss,
  userHeaderAssignedToContainerCss,
  userHeaderAssignedToTextCss,
  userHeaderAvatarContainerCss,
  userHeaderRootCss,
} from './styles';

export const PlateCommentHeader = (props) => {
  const comment = useComment()!;

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

        <CommentUserName {...props} css={commentUserCss} />
      </div>

      <div css={userHeaderActionsCss}>
        <PlateResolveCommentButton {...props} />
        <PlateUnresolveCommentButton {...props} />
      </div>
    </div>
  );
};
