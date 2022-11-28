import React from 'react';
import { AccountCircle } from '@styled-icons/material';
import { useCommentsSelectors } from '@udecode/plate-comments';
import { Avatar } from './Avatar';
import {
  avatarAccountCircleCss,
  avatarImageCss,
  avatarRootCss,
} from './styles';

export type PlateAvatarProps = { userId: string };

export const PlateAvatar = (props: PlateAvatarProps) => {
  const { userId } = props;

  const user = useCommentsSelectors().user(userId);
  if (!user) return null;

  return (
    <div css={avatarRootCss}>
      {user.avatarUrl ? (
        <Avatar.Image {...props} css={avatarImageCss} />
      ) : (
        <AccountCircle css={avatarAccountCircleCss} />
      )}
    </div>
  );
};
