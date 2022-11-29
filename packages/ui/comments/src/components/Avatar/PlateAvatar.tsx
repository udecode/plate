import React from 'react';
import { AccountCircle } from '@styled-icons/material';
import { useCommentUser } from '../CommentProvider';
import { AvatarImage } from './AvatarImage';
import {
  avatarAccountCircleCss,
  avatarImageCss,
  avatarRootCss,
} from './styles';

export const PlateAvatar = () => {
  const user = useCommentUser();
  if (!user) return null;

  return (
    <div css={avatarRootCss}>
      {user.avatarUrl ? (
        <AvatarImage css={avatarImageCss} />
      ) : (
        <AccountCircle css={avatarAccountCircleCss} />
      )}
    </div>
  );
};
