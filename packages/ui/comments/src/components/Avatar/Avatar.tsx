import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { AccountCircle } from '@styled-icons/material/AccountCircle';
import { StyledProps } from '@udecode/plate-styled-components';
import { User } from '@udecode/plate-comments';
import { createAvatarHolderStyles, createAvatarStyles } from './Avatar.styles';

type AvatarProps = { user: User } & StyledProps;

export const Avatar = (props: AvatarProps) => {
  const { user } = props;

  const { root: avatarHolder } = createAvatarHolderStyles(props);
  const { root: avatar } = createAvatarStyles(props);

  return (
    <div css={avatarHolder.css} className={avatarHolder.className}>
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={`Avatar of ${user.name}`}
          width={32}
          height={32}
          css={avatar.css}
          className={avatar.className}
        />
      ) : (
        <AccountCircle
          style={{ color: '#9e9e9e' }}
          css={avatar.css}
          className={avatar.className}
        />
      )}
    </div>
  );
};
