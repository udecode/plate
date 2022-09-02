import React from 'react';
import { AccountCircle } from '@styled-icons/material';
import { getAvatarStyles } from './Avatar.styles';
import { AvatarStyleProps } from './Avatar.types';
import { useAvatar } from './useAvatar';

export const Avatar = (props: AvatarStyleProps) => {
  const { user } = useAvatar(props);

  const styles = getAvatarStyles(props);

  return (
    <div css={styles.root.css} className={styles.root.className}>
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={`Avatar of ${user.name}`}
          css={styles.avatar?.css}
          className={styles.avatar?.className}
        />
      ) : (
        <AccountCircle
          css={styles.avatar?.css}
          className={styles.avatar?.className}
        />
      )}
    </div>
  );
};
