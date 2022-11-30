import React from 'react';
import { css } from 'styled-components';
import { PlateAvatar } from '../Avatar';
import { useComment } from '../CommentProvider';
import { PlateResolveCommentButton } from '../CommentResolveButton';
import { useCommentsSelectors } from '../CommentsProvider';
import { CommentUserName } from './CommentUserName';
import {
  commentUserCss,
  userHeaderActionsCss,
  userHeaderAssignedToContainerCss,
  userHeaderAssignedToTextCss,
  userHeaderAvatarContainerCss,
  userHeaderRootCss,
} from './styles';

export const PlateCommentHeader = () => {
  const comment = useComment()!;

  const myUserId = useCommentsSelectors().myUserId();
  const isMyUser = myUserId === comment.userId;

  return (
    <div
      css={[
        userHeaderRootCss,
        css`
          color: ${isMyUser ? 'white' : 'rgb(60, 64, 67)'};
          background-color: ${isMyUser ? '#1a73e8' : '#e8f0fe'};
        `,
      ]}
    >
      <div css={userHeaderAvatarContainerCss}>
        <PlateAvatar userId={comment.userId} />
      </div>

      <div css={userHeaderAssignedToContainerCss}>
        <div css={userHeaderAssignedToTextCss}>Author</div>

        <CommentUserName css={commentUserCss} />
      </div>

      <div css={userHeaderActionsCss}>
        <PlateResolveCommentButton />
      </div>
    </div>
  );
};
