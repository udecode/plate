import React from 'react';
import {
  AccountCircleIcon,
  AvatarImage,
  useUserById,
} from '@udecode/plate-comments';
import { css } from 'styled-components';
import tw from 'twin.macro';

export const avatarRootCss = css`
  ${tw`font-normal text-left text-black text-sm cursor-default whitespace-nowrap w-8 h-8 object-cover left-0 block relative rounded-full`};
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  user-select: text;
  aspect-ratio: auto 32 / 32;
`;

export const avatarImageCss = css`
  ${tw`rounded-full font-normal text-left text-black text-sm cursor-default whitespace-nowrap h-8 w-8`}
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  user-select: text;
`;

export const avatarAccountCircleCss = css`
  ${tw`font-normal text-left text-gray-500 text-sm cursor-default whitespace-nowrap h-8 w-8`};
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  user-select: text;
`;

export const PlateAvatar = ({ userId }: { userId: string | null }) => {
  const user = useUserById(userId);
  if (!user) return null;

  return (
    <div css={avatarRootCss}>
      {user.avatarUrl ? (
        <AvatarImage css={avatarImageCss} userId={userId!} />
      ) : (
        <AccountCircleIcon css={avatarAccountCircleCss} viewBox="0 0 24 24" />
      )}
    </div>
  );
};
