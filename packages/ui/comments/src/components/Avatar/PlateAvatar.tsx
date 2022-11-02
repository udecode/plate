import React from 'react';
import { AccountCircle } from '@styled-icons/material';
import { User } from '@udecode/plate-comments';
import { Avatar } from './Avatar';
import {
  avatarAccountCircleCss,
  avatarImageCss,
  avatarRootCss,
} from './styles';

export type PlateAvatarProps = { user: User };

export const PlateAvatar = (props: PlateAvatarProps) => {
  const { user } = props;
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
