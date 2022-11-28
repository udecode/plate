import React from 'react';
import { IconButton } from '@mui/material';
import { Unarchive } from '@styled-icons/material';
import { UnresolveCommentButton } from './UnresolveCommentButton';
import { UnresolveCommentButtonRootProps } from './UnresolveCommentButtonRoot';

export const PlateUnresolveCommentButton = (
  props: UnresolveCommentButtonRootProps
) => {
  return (
    <IconButton>
      <UnresolveCommentButton.Root {...props}>
        <Unarchive size={22} />
      </UnresolveCommentButton.Root>
    </IconButton>
  );
};
