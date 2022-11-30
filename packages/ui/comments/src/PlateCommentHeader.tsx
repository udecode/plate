import React from 'react';
import {
  CommentUserName,
  useComment,
  useCommentsSelectors,
} from '@udecode/plate-comments';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { PlateAvatar } from './PlateAvatar';
import { PlateCommentResolveButton } from './PlateCommentResolveButton';

export const userHeaderRootCss = css`
  ${tw`flex flex-row items-center p-3 rounded-t-lg`};
  border-bottom: 1px solid rgb(218, 220, 224);
`;

export const userHeaderAvatarContainerCss = css`
  ${tw`mr-2 bg-white w-8 h-8 flex-none rounded-full`};
`;

export const userHeaderAssignedToContainerCss = css`
  ${tw`flex-auto`}
`;

export const userHeaderAssignedToTextCss = css`
  ${tw`text-xs`};
`;

export const commentUserCss = css`
  ${tw`text-sm leading-5 font-medium`};
`;

export const userHeaderActionsCss = css`
  ${tw`flex-none`};
`;

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
        <PlateCommentResolveButton />
      </div>
    </div>
  );
};
