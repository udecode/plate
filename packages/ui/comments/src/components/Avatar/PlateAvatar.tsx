import React from 'react';
import { Avatar } from './Avatar';
import { AvatarAccountCircleProps } from './AvatarAccountCircle';
import { AvatarImageProps } from './AvatarImage';
import { AvatarRootProps } from './AvatarRoot';
import { avatarImageCss, avatarRootCss } from './styles';

export type PlateAvatarProps = AvatarRootProps &
  AvatarImageProps &
  AvatarAccountCircleProps;

export const PlateAvatar = (props: PlateAvatarProps) => {
  const { user } = props;
  return (
    <Avatar.Root css={avatarRootCss}>
      {user.avatarUrl ? (
        <Avatar.Image {...props} css={avatarImageCss} />
      ) : (
        <Avatar.AccountCircle css={avatarImageCss} />
      )}
    </Avatar.Root>
  );
};
