import React from 'react';
import { Avatar, AvatarStyleProps, useAvatar } from '@udecode/plate-comments';
import { getAvatarStyles } from './PlateAvatar.styles';

export const PlateAvatar = (props: AvatarStyleProps) => {
  const { user } = useAvatar(props);

  const styles = getAvatarStyles(props);

  return (
    <Avatar.Root css={styles.root.css} className={styles.root.className}>
      {user.avatarUrl ? (
        <Avatar.Image
          css={styles.avatar?.css}
          className={styles.avatar?.className}
        />
      ) : (
        <Avatar.AccountCircle
          css={styles.avatar?.css}
          className={styles.avatar?.className}
        />
      )}
    </Avatar.Root>
  );
};
